import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { firmaAdi, yetkiliKisi, telefon, email, puan } = await req.json();

    if (!firmaAdi || !yetkiliKisi || !telefon || !email) {
      return NextResponse.json(
        { success: false, error: "Eksik alanlar var" },
        { status: 400 }
      );
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id: params.id },
      data: { firmaAdi, yetkiliKisi, telefon, email, puan },
    });

    return NextResponse.json({
      success: true,
      message: "Tedarikçi güncellendi",
      supplier: updatedSupplier,
    });
  } catch (error) {
    console.error("[SUPPLIER_PUT]", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await prisma.supplier.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Tedarikçi silindi" });
  } catch (error) {
    console.error("[SUPPLIER_DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
