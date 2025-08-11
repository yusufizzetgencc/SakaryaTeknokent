import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const STAGES: Record<number, string> = {
  1: "İlk Onay",
  2: "İkinci Onay",
  3: "Fiyat Araştırma",
  4: "Üst Yönetim Onayı",
  5: "Sipariş Onayı",
  6: "Kapanış",
};

export async function GET() {
  try {
    const requests = await prisma.purchaseRequest.findMany({
      select: {
        id: true,
        malzeme: true,
        birim: true,
        miktar: true,
        stage: true,
        stageLabel: true,
        rejected: true,
        approved: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true } },
        invoices: { select: { approved: true, supplierRated: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // İşlem: Onaylanmış ve tedarikçi puanlanmış ise ürün geldi sayılır
    const result = requests.map((req) => {
      const hasApprovedInvoice = req.invoices.some((inv) => inv.approved);
      const hasRatedSupplier = req.invoices.some((inv) => inv.supplierRated);
      const productDelivered = hasApprovedInvoice && hasRatedSupplier;

      return {
        ...req,
        stageLabel: req.stageLabel || STAGES[req.stage] || `Aşama ${req.stage}`,
        status: req.rejected
          ? "Reddedildi"
          : req.approved
          ? "Onaylandı"
          : "Devam Ediyor",
        hasApprovedInvoice,
        hasRatedSupplier,
        productDelivered,
      };
    });

    // Basit bildirim: Onay bekleyen ve değerlendirme bekleyen sayısı
    const pendingInvoiceCount = requests.filter((req) =>
      req.invoices.some((inv) => !inv.approved && !req.rejected)
    ).length;
    const pendingRatingCount = requests.filter((req) =>
      req.invoices.some((inv) => inv.approved && !inv.supplierRated)
    ).length;

    return NextResponse.json({
      success: true,
      requests: result,
      notifications: {
        pendingInvoiceCount,
        pendingRatingCount,
      },
      STAGES,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Talep aşamaları alınamadı" },
      { status: 500 }
    );
  }
}
