import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { firmaAdi, yetkiliKisi, telefon, email, puan } =
      await request.json();

    if (!firmaAdi || !yetkiliKisi || !telefon || !email) {
      return NextResponse.json(
        { success: false, error: "Eksik alanlar var" },
        { status: 400 }
      );
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
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

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Tedarikçi silindi" });
  } catch (error) {
    console.error("[SUPPLIER_DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
