// /app/api/supplier/rate/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { supplierId, rating } = await request.json();

    if (!supplierId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Eksik veya geçersiz bilgi" },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: "Tedarikçi bulunamadı" },
        { status: 404 }
      );
    }

    // Basit ortalama güncellemesi (puanSayisi alanı yoksa)
    const newScore = supplier.puan ? (supplier.puan + rating) / 2 : rating;

    await prisma.supplier.update({
      where: { id: supplierId },
      data: { puan: newScore },
    });

    return NextResponse.json({ success: true, newScore });
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
