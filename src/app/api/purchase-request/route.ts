import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const {
      birim,
      malzeme,
      malzemeOzellik,
      ihtiyacSebebi,
      miktar,
      kategoriId,
    } = await req.json();

    if (!birim || !malzeme || !ihtiyacSebebi || !miktar || !kategoriId) {
      return NextResponse.json({ error: "Eksik alanlar var" }, { status: 400 });
    }

    const newRequest = await prisma.purchaseRequest.create({
      data: {
        talepEdenId: user.id,
        birim,
        malzeme,
        malzemeOzellik,
        ihtiyacSebebi,
        miktar,
        kategoriId,
      },
    });

    return NextResponse.json({
      message: "Talep oluşturuldu",
      request: newRequest,
    });
  } catch (error) {
    console.error("[PURCHASE_REQUEST_POST]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
