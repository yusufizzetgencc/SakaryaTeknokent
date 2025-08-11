import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const requests = await prisma.purchaseRequest.findMany({
      include: {
        user: true,
        kategori: true,
      },
      where: {
        approved: false,
        rejected: false,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("Talep listeleme hatası:", error);
    return NextResponse.json(
      { success: false, error: "Talep alınırken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action, rejectionReason, offers } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: "Eksik veri" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const updated = await prisma.purchaseRequest.update({
        where: { id },
        data: {
          approved: true,
          rejected: false,
          rejectionReason: null,
          offers: offers ?? undefined,
          stage: 3, // BURAYI EKLEDİK
          stageLabel: "Fiyat Araştırma", // (İsteğe bağlı)
        },
      });
      return NextResponse.json({
        success: true,
        message: "Onaylandı",
        updated,
      });
    }

    if (action === "reject") {
      if (!rejectionReason) {
        return NextResponse.json(
          { success: false, error: "Red gerekçesi zorunlu" },
          { status: 400 }
        );
      }
      const updated = await prisma.purchaseRequest.update({
        where: { id },
        data: {
          approved: false,
          rejected: true,
          rejectionReason,
        },
      });
      return NextResponse.json({
        success: true,
        message: "Reddedildi",
        updated,
      });
    }

    if (action === "saveOffers") {
      const updated = await prisma.purchaseRequest.update({
        where: { id },
        data: { offers: offers ?? undefined },
      });
      return NextResponse.json({
        success: true,
        message: "Teklifler kaydedildi",
        updated,
      });
    }

    return NextResponse.json(
      { success: false, error: "Geçersiz işlem" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Talep güncelleme hatası:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
