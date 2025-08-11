import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(req: Request, context: RouteContext) {
  try {
    const { params } = context;
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

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { params } = context;
    const id = params.id;

    await prisma.purchaseCategory.delete({ where: { id } });
    return NextResponse.json({ message: "Kategori silindi" });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
