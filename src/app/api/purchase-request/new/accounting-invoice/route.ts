import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface UpdateInvoicePayload {
  invoiceId: string;
  kdvRate: number; // yüzde olarak (ör: 18)
  kdvAmount: number; // tutar
  totalAmount: number; // toplam
}

export async function GET() {
  try {
    // Onaylanmış faturalar + ilgili satın alma talebi + kullanıcı + kategori çekilecek
    const invoices = await prisma.invoice.findMany({
      where: {
        approved: true,
      },
      include: {
        purchase: {
          include: {
            user: true,
            kategori: true,
          },
        },
        uploadedBy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, invoices });
  } catch {
    return NextResponse.json(
      { success: false, error: "Faturalar getirilemedi." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body: UpdateInvoicePayload = await request.json();
    const { invoiceId, kdvRate, kdvAmount, totalAmount } = body;

    if (
      !invoiceId ||
      kdvRate == null ||
      kdvAmount == null ||
      totalAmount == null
    ) {
      return NextResponse.json(
        { success: false, error: "Eksik bilgi" },
        { status: 400 }
      );
    }

    // Güncelleme yap
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        // Varsayalım Invoice modeline aşağıdaki alanları ekleyeceğiz (yeni alanlar):
        kdvOrani: kdvRate,
        kdvTutari: kdvAmount,
        toplamTutar: totalAmount,
      },
    });

    return NextResponse.json({ success: true, message: "Fatura güncellendi." });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Sunucu hatası",
        detail: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
