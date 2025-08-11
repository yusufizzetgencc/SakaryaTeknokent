import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const category = await prisma.maintenanceCategory.findUnique({
      where: { id },
    });
    if (!category)
      return NextResponse.json(
        { error: "Kategori bulunamadı." },
        { status: 404 }
      );
    return NextResponse.json(category);
  } catch {
    return NextResponse.json(
      { error: "Kategori alınırken hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { error: "Kategori adı zorunludur." },
        { status: 400 }
      );
    }
    const updatedCategory = await prisma.maintenanceCategory.update({
      where: { id },
      data: { name: body.name },
    });
    return NextResponse.json(updatedCategory);
  } catch {
    return NextResponse.json(
      { error: "Kategori güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    await prisma.maintenanceCategory.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Kategori silinirken hata oluştu." },
      { status: 500 }
    );
  }
}
