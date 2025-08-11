import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface Offer {
  supplierId: string;
  supplierName: string;
  price: number;
  status?: string;
}

// GET: 3. aşamadaki veya 2'de onaylanıp 3'e geçenler
export async function GET() {
  try {
    const requests = await prisma.purchaseRequest.findMany({
      where: {
        OR: [
          { stage: 3, rejected: false },
          { stage: 2, approved: true },
          { stage: 3, rejected: true },
        ],
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
      { success: false, error: "Talepler alınamadı" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, action, rejectionReason, selectedOfferIndex, newOffers } =
      await request.json();

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: "Eksik bilgi" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const talep = await prisma.purchaseRequest.findUnique({ where: { id } });
      if (!talep?.offers || !Array.isArray(talep.offers)) {
        return NextResponse.json(
          { success: false, error: "Teklif bulunamadı" },
          { status: 400 }
        );
      }
      // <-- HATA BURADAYDI
      const offers = talep.offers as unknown as Offer[];
      const selectedOffer = offers[selectedOfferIndex];
      if (!selectedOffer) {
        return NextResponse.json(
          { success: false, error: "Teklif seçimi hatalı" },
          { status: 400 }
        );
      }
      const updatedOffers = offers.map((offer, idx) => ({
        ...offer, // << burada object garanti!
        status: idx === selectedOfferIndex ? "accepted" : "rejected",
      }));
      const updated = await prisma.purchaseRequest.update({
        where: { id },
        data: {
          offers: updatedOffers as unknown as Prisma.InputJsonValue,
          selectedOffer: selectedOffer as unknown as Prisma.InputJsonValue,
          approved: true,
          rejected: false,
          rejectionReason: null,
          stage: 4,
          stageLabel: "Üst Yönetim Onayı",
        },
      });
      return NextResponse.json({ success: true, updated });
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
          stage: 3,
        },
      });
      return NextResponse.json({ success: true, updated });
    }

    if (action === "newOffer") {
      if (!Array.isArray(newOffers) || !newOffers.length) {
        return NextResponse.json(
          { success: false, error: "En az bir teklif girilmeli" },
          { status: 400 }
        );
      }
      const updated = await prisma.purchaseRequest.update({
        where: { id },
        data: {
          offers: newOffers,
          approved: false,
          rejected: false,
          rejectionReason: null,
        },
      });
      return NextResponse.json({ success: true, updated });
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
