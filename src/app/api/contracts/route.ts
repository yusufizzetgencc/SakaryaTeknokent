import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { addMonths } from "date-fns";
import { Prisma } from "@prisma/client";

async function uploadFile(file: File): Promise<string> {
  console.log(`(Placeholder) Dosya yükleniyor: ${file.name}`);
  const fakeUrl = `https://fake-storage-service.com/contracts/${Date.now()}-${file.name.replace(
    /\s/g,
    "_"
  )}`;
  return fakeUrl;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Yetkiniz yok." }), {
      status: 401,
    });
  }

  try {
    // URL parametrelerini kontrol et
    const { searchParams } = new URL(request.url);
    const isBasic = searchParams.get("basic") === "true";

    if (isBasic) {
      // Temel proje bilgilerini getir (filtre için)
      const projects = await prisma.projectContract.findMany({
        select: {
          id: true,
          companyName: true,
          projectNumber: true,
        },
        orderBy: {
          projectStartDate: "desc",
        },
      });
      return NextResponse.json(projects);
    }

    // Tüm proje bilgilerini getir
    const projects = await prisma.projectContract.findMany({
      select: {
        id: true,
        companyName: true,
        academicianName: true,
        projectNumber: true,
        projectStartDate: true,
      },
      orderBy: {
        projectStartDate: "desc",
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[GET_CONTRACTS] Projeleri listeleme hatası:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Projeler getirilirken bir sunucu hatası oluştu.",
      }),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return new NextResponse(
      JSON.stringify({ error: "Bu işlemi yapmaya yetkiniz yok." }),
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();

    const companyName = formData.get("companyName") as string;
    const academicianName = formData.get("academicianName") as string;
    const projectNumber = formData.get("projectNumber") as string;
    const projectStartDateStr = formData.get("projectStartDate") as string;
    const invoiceStartDateStr = formData.get("invoiceStartDate") as string;
    const invoiceType = formData.get("invoiceType") as "ONE_TIME" | "MONTHLY";
    const invoiceDurationMonthsStr = formData.get("invoiceDurationMonths") as
      | string
      | null;
    const invoiceAmountStr = formData.get("invoiceAmount") as string | null;
    const companyContractFile = formData.get(
      "companyContractFile"
    ) as File | null;
    const academicianContractFile = formData.get(
      "academicianContractFile"
    ) as File | null;

    const requiredFields = {
      companyName,
      academicianName,
      projectNumber,
      projectStartDateStr,
      invoiceStartDateStr,
      invoiceType,
      companyContractFile,
      academicianContractFile,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return new NextResponse(
          JSON.stringify({ error: `Eksik bilgi: '${key}' alanı zorunludur.` }),
          { status: 400 }
        );
      }
    }

    if (invoiceType === "MONTHLY" && !invoiceDurationMonthsStr) {
      return new NextResponse(
        JSON.stringify({
          error: "Aylık fatura tipi için süre belirtilmelidir.",
        }),
        { status: 400 }
      );
    }

    const [companyContractUrl, academicianContractUrl] = await Promise.all([
      uploadFile(companyContractFile!),
      uploadFile(academicianContractFile!),
    ]);

    const newContract = await prisma.$transaction(async (tx) => {
      const contract = await tx.projectContract.create({
        data: {
          companyName,
          academicianName,
          projectNumber,
          projectStartDate: new Date(projectStartDateStr),
          invoiceStartDate: new Date(invoiceStartDateStr),
          invoiceType,
          invoiceDurationMonths: invoiceDurationMonthsStr
            ? parseInt(invoiceDurationMonthsStr)
            : null,
          invoiceAmount: invoiceAmountStr ? parseFloat(invoiceAmountStr) : null,
          companyContractUrl,
          academicianContractUrl,
          uploadedById: session.user.id,
        },
      });

      if (contract.invoiceType === "ONE_TIME") {
        await tx.projectInvoice.create({
          data: {
            projectContractId: contract.id,
            invoiceDate: contract.invoiceStartDate,
            amount: contract.invoiceAmount,
          },
        });
      } else if (
        contract.invoiceType === "MONTHLY" &&
        contract.invoiceDurationMonths
      ) {
        const invoicesToCreate: Prisma.ProjectInvoiceCreateManyInput[] = [];
        for (let i = 0; i < contract.invoiceDurationMonths; i++) {
          invoicesToCreate.push({
            projectContractId: contract.id,
            invoiceDate: addMonths(contract.invoiceStartDate, i),
            amount: contract.invoiceAmount,
          });
        }
        await tx.projectInvoice.createMany({ data: invoicesToCreate });
      }

      return contract;
    });

    return NextResponse.json(newContract, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST_CONTRACT] Sözleşme oluşturma hatası:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        error.code === "P2002" &&
        (error.meta?.target as string[])?.includes("projectNumber")
      ) {
        return new NextResponse(
          JSON.stringify({
            error: "Bu proje numarası ile daha önce bir kayıt oluşturulmuş.",
          }),
          { status: 409 }
        );
      }
    }

    // Eğer error bir Error ise mesajını yazdır, değilse genel hata mesajı
    let errorMessage = "Sözleşme oluşturulurken bir sunucu hatası oluştu.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
