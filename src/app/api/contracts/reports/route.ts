import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new NextResponse(JSON.stringify({ error: "Yetkiniz yok." }), {
      status: 403,
    });
  }

  try {
    const { searchParams } = new URL(request.url);

    // --- Filtre Parametrelerini Al ---
    const companyName = searchParams.get("companyName");
    const academicianName = searchParams.get("academicianName");
    const projectNumber = searchParams.get("projectNumber");
    const year = searchParams.get("year");
    const invoiceType = searchParams.get("invoiceType") as
      | "ONE_TIME"
      | "MONTHLY"
      | null;

    // --- Dinamik 'where' Sorgusu Oluştur ---
    const where: Prisma.ProjectContractWhereInput = {};

    if (companyName) {
      where.companyName = {
        contains: companyName,
      };
    }

    if (academicianName) {
      where.academicianName = {
        contains: academicianName,
      };
    }

    if (projectNumber) {
      where.projectNumber = {
        contains: projectNumber,
      };
    }

    if (invoiceType) {
      where.invoiceType = invoiceType;
    }

    // Yıl filtresi: Belirtilen yılın başından sonuna kadar olan aralığı kapsar
    if (year && /^\d{4}$/.test(year)) {
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, 0, 1); // Yılın ilk günü
      const endDate = new Date(yearNum + 1, 0, 1); // Sonraki yılın ilk günü
      where.projectStartDate = {
        gte: startDate,
        lt: endDate,
      };
    }

    // --- Veritabanı Sorgusu ---
    const reportData = await prisma.projectContract.findMany({
      where,
      include: {
        uploadedBy: {
          select: { firstName: true, lastName: true },
        },
        invoices: {
          select: {
            id: true,
            invoiceDate: true,
            amount: true,
            status: true,
            paymentDate: true,
          },
          orderBy: {
            invoiceDate: "asc",
          },
        },
      },
      orderBy: {
        projectStartDate: "desc",
      },
    });

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Proje raporu oluşturma hatası:", error);
    return new NextResponse(
      JSON.stringify({ error: "Rapor oluşturulurken bir hata oluştu." }),
      { status: 500 }
    );
  }
}
