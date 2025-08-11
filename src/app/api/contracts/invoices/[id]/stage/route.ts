import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Prisma, InvoiceStatus } from "@prisma/client"; // InvoiceStatus enum'u import edildi

type AllowedStatus = "ISSUED" | "RECEIVED" | "PAID_OUT";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> } // Next.js 15 için güncellenmiş parametre yapısı
) {
  const session = await getServerSession(authOptions);
  // Yetki kontrolünü daha güvenli hale getirelim (örneğin 'admin' rolünü içerip içermediğine bakalım)
  if (!session?.user?.role || !session.user.role.includes("admin")) {
    return new NextResponse(JSON.stringify({ error: "Yetkiniz yok." }), {
      status: 403,
    });
  }

  try {
    // Params'ı await ile resolve ediyoruz
    const { id } = await context.params;

    const body = await request.json();
    const { status: nextStatus, date } = body as {
      status: AllowedStatus;
      date: string;
    };

    if (!date) {
      return new NextResponse(
        JSON.stringify({ error: "Tarih alanı zorunludur." }),
        { status: 400 }
      );
    }

    const invoice = await prisma.projectInvoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return new NextResponse(JSON.stringify({ error: "Fatura bulunamadı." }), {
        status: 404,
      });
    }

    // Prisma.ProjectInvoiceUpdateInput tipine uygun bir obje oluşturalım.
    let updateData: Prisma.ProjectInvoiceUpdateInput = {};
    const currentStatus = invoice.status;

    switch (nextStatus) {
      case "ISSUED":
        // DÜZELTME: Karşılaştırma, string yerine InvoiceStatus enum'u ile yapıldı.
        if (currentStatus === InvoiceStatus.PENDING) {
          // DÜZELTME: Atama, string yerine InvoiceStatus enum'u ile yapıldı.
          updateData = {
            status: InvoiceStatus.ISSUED,
            issuedDate: new Date(date),
          };
        } else {
          throw new Error(
            `Geçersiz durum geçişi: ${currentStatus} -> ${nextStatus}`
          );
        }
        break;

      case "RECEIVED":
        // DÜZELTME: Karşılaştırma, string yerine InvoiceStatus enum'u ile yapıldı.
        if (currentStatus === InvoiceStatus.ISSUED) {
          // DÜZELTME: Atama, string yerine InvoiceStatus enum'u ile yapıldı.
          updateData = {
            status: InvoiceStatus.RECEIVED,
            paymentReceivedDate: new Date(date),
          };
        } else {
          throw new Error(
            `Geçersiz durum geçişi: ${currentStatus} -> ${nextStatus}`
          );
        }
        break;

      case "PAID_OUT":
        // DÜZELTME: Karşılaştırma, string yerine InvoiceStatus enum'u ile yapıldı.
        if (currentStatus === InvoiceStatus.RECEIVED) {
          // DÜZELTME: Atama, string yerine InvoiceStatus enum'u ile yapıldı.
          updateData = {
            status: InvoiceStatus.PAID_OUT,
            academicianPaidDate: new Date(date),
          };
        } else {
          throw new Error(
            `Geçersiz durum geçişi: ${currentStatus} -> ${nextStatus}`
          );
        }
        break;

      default:
        throw new Error(`Bilinmeyen veya desteklenmeyen durum: ${nextStatus}`);
    }

    const updatedInvoice = await prisma.projectInvoice.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("Fatura durum güncelleme hatası:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}
