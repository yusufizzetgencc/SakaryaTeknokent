import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Sadece 4. aşamadaki ve rejected=false olan talepler listelenir.
export async function GET() {
  try {
    const requests = await prisma.purchaseRequest.findMany({
      where: {
        stage: 4,
        rejected: false,
      },
      include: {
        user: true,
        kategori: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, requests });
  } catch {
    return NextResponse.json(
      { success: false, error: "Finans talepleri alınamadı" },
      { status: 500 }
    );
  }
}

// Onay veya Bekletme işlemi
export async function PUT(request: Request) {
  try {
    const { id, action } = await request.json();
    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: "Eksik bilgi" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Onaylandı: 5. aşamaya geçsin (ör: Sipariş Onayı)
      const updated = await prisma.purchaseRequest.update({
        where: { id },
        data: {
          stage: 5,
          stageLabel: "Sipariş Onayı", // isteğe göre
        },
      });
      return NextResponse.json({
        success: true,
        updated,
        message: "Onaylandı",
      });
    }

    if (action === "hold") {
      // Beklet: aşama 4'te kalır, bir flag set edebilirsin (örn. beklemede=true)
      const updated = await prisma.purchaseRequest.update({
        where: { id },
        data: {
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({
        success: true,
        updated,
        message: "Bekletildi",
      });
    }

    return NextResponse.json(
      { success: false, error: "Geçersiz işlem" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
