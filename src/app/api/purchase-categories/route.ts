import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Kategorileri listele
export async function GET() {
  try {
    const categories = await prisma.purchaseCategory.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// POST: Yeni kategori ekle
export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Kategori adı gerekli" },
        { status: 400 }
      );
    }

    const existing = await prisma.purchaseCategory.findUnique({
      where: { name },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Kategori zaten mevcut" },
        { status: 400 }
      );
    }

    const newCategory = await prisma.purchaseCategory.create({
      data: { name },
    });

    return NextResponse.json({
      message: "Kategori eklendi",
      category: newCategory,
    });
  } catch (error) {
    console.error("[CATEGORY_POST]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// PUT: Kategori güncelle
export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const { params } = await context;
    const id = params.id;
    const { name } = await req.json();

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

// DELETE: Kategori sil
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { params } = await context;
    const id = params.id;

    await prisma.purchaseCategory.delete({ where: { id } });
    return NextResponse.json({ message: "Kategori silindi" });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
