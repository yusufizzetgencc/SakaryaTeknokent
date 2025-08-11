import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { isPast } from "date-fns";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  try {
    const invoices = await prisma.projectInvoice.findMany({
      where: {
        projectContractId: projectId ? projectId : undefined,
      },
      include: {
        projectContract: {
          select: { companyName: true, projectNumber: true },
        },
      },
    });

    const events = invoices.map((invoice) => {
      let status = invoice.status;
      if (status === "PENDING" && isPast(new Date(invoice.invoiceDate))) {
        status = "OVERDUE";
      }

      return {
        id: invoice.id,
        title: invoice.projectContract.companyName,
        start: invoice.invoiceDate,
        allDay: true,
        extendedProps: {
          projectContractId: invoice.projectContractId, // RENKLENDİRME İÇİN EKLENDİ
          projectNumber: invoice.projectContract.projectNumber,
          amount: invoice.amount,
          status: status,
          fileUrl: invoice.fileUrl,
        },
      };
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Fatura etkinliklerini getirme hatası:", error);
    return new NextResponse(
      JSON.stringify({ error: "Sunucu hatası oluştu." }),
      { status: 500 }
    );
  }
}
