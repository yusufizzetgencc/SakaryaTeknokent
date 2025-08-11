import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { firmaAdi: "asc" },
    });
    return NextResponse.json({ success: true, suppliers }); // success ekledik!
  } catch (error) {
    console.error("[SUPPLIER_GET]", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { firmaAdi, yetkiliKisi, telefon, email } = await req.json();

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

export async function PUT(req: Request, { params }: Params) {
  try {
    const { firmaAdi, yetkiliKisi, telefon, email, puan } = await req.json();

    if (!firmaAdi || !yetkiliKisi || !telefon || !email) {
      return NextResponse.json({ error: "Eksik alanlar var" }, { status: 400 });
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id: params.id },
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

export async function DELETE(req: Request, { params }: Params) {
  try {
    await prisma.supplier.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Tedarikçi silindi" });
  } catch (error) {
    console.error("[SUPPLIER_DELETE]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
