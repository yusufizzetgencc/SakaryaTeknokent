import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface InvoiceCheckPayload {
  id: string; // PurchaseRequest id
  invoiceId: string;
  action: "approve" | "reject";
  rejectionReason?: string;
  supplierRating?: number; // 1-5 arası, onay sonrası
}

interface InvoiceUpdateData {
  approved?: boolean;
  rejectionReason?: string | null;
  supplierRated?: boolean;
}

export async function GET() {
  try {
    const requests = await prisma.purchaseRequest.findMany({
      where: {
        stage: { gte: 5 },
        rejected: false,
      },
      include: {
        invoices: {
          select: {
            id: true,
            fileUrl: true,
            amount: true,
            approved: true,
            rejectionReason: true,
            supplierRated: true,
          },
        },
        user: true,
        kategori: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, requests });
  } catch {
    return NextResponse.json(
      { success: false, error: "Satın alma talepleri getirilemedi" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body: InvoiceCheckPayload = await request.json();
    const { id, invoiceId, action, rejectionReason, supplierRating } = body;

    if (!id || !invoiceId || !action) {
      return NextResponse.json(
        { success: false, error: "Eksik bilgi" },
        { status: 400 }
      );
    }

    const invoiceUpdateData: InvoiceUpdateData = {
      approved: action === "approve",
      rejectionReason: action === "reject" ? rejectionReason : null,
    };

    if (action === "approve" && supplierRating !== undefined) {
      invoiceUpdateData.supplierRated = true;
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: invoiceUpdateData,
    });

    const updatedPurchaseRequest = await prisma.purchaseRequest.update({
      where: { id },
      data: {
        stage: action === "approve" ? 6 : 5,
        stageLabel:
          action === "approve"
            ? "Fatura Fiyat Kontrolü Onaylandı"
            : "Fatura Fiyat Kontrolü Reddedildi",
        approved: action === "approve",
        rejected: action === "reject",
        rejectionReason: action === "reject" ? rejectionReason : null,
      },
      include: { invoices: true, user: true },
    });

    if (
      action === "approve" &&
      supplierRating !== undefined &&
      supplierRating >= 1 &&
      supplierRating <= 5
    ) {
      let supplierId: string | undefined;

      if (updatedPurchaseRequest.selectedOffer) {
        try {
          const offer = JSON.parse(
            updatedPurchaseRequest.selectedOffer as unknown as string
          );
          supplierId = offer.supplierId;
        } catch {
          supplierId = undefined;
        }
      }

      if (supplierId) {
        const supplier = await prisma.supplier.findUnique({
          where: { id: supplierId },
        });

        if (supplier) {
          const totalPoints = (supplier.puan ?? 0) * (supplier.puanSayisi ?? 0);
          const newCount = (supplier.puanSayisi ?? 0) + 1;
          const newAvg = (totalPoints + supplierRating) / newCount;

          await prisma.supplier.update({
            where: { id: supplierId },
            data: {
              puan: newAvg,
              puanSayisi: newCount,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedPurchaseRequest,
    });
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
