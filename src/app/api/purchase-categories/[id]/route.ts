import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Kategori adı gerekli" },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.purchaseCategory.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({
      message: "Kategori güncellendi",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("[CATEGORY_PUT]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.purchaseCategory.delete({ where: { id } });
    return NextResponse.json({ message: "Kategori silindi" });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
