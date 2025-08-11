// src/app/api/suppliers/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { firmaAdi: "asc" },
    });
    return NextResponse.json({ success: true, suppliers });
  } catch (error) {
    console.error("[SUPPLIER_GET]", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { firmaAdi, yetkiliKisi, telefon, email } = await request.json();

    if (!firmaAdi || !yetkiliKisi || !telefon || !email) {
      return NextResponse.json({ error: "Eksik alanlar var" }, { status: 400 });
    }

    const newSupplier = await prisma.supplier.create({
      data: { firmaAdi, yetkiliKisi, telefon, email },
    });

    return NextResponse.json({
      message: "Tedarikçi eklendi",
      supplier: newSupplier,
    });
  } catch (error) {
    console.error("[SUPPLIER_POST]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // URL'den ID'yi alıyoruz
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "ID bulunamadı" }, { status: 400 });
    }

    const { firmaAdi, yetkiliKisi, telefon, email, puan } =
      await request.json();

    if (!firmaAdi || !yetkiliKisi || !telefon || !email) {
      return NextResponse.json({ error: "Eksik alanlar var" }, { status: 400 });
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: { firmaAdi, yetkiliKisi, telefon, email, puan },
    });

    return NextResponse.json({
      message: "Tedarikçi güncellendi",
      supplier: updatedSupplier,
    });
  } catch (error) {
    console.error("[SUPPLIER_PUT]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "ID bulunamadı" }, { status: 400 });
    }

    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ message: "Tedarikçi silindi" });
  } catch (error) {
    console.error("[SUPPLIER_DELETE]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
