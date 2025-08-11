import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
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

    const purchaseRequests = await prisma.purchaseRequest.findMany({
      where: { talepEdenId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        birim: true,
        malzeme: true,
        malzemeOzellik: true,
        ihtiyacSebebi: true,
        miktar: true,
        kategori: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    return NextResponse.json({ purchaseRequests });
  } catch (error) {
    console.error("[PURCHASE_REQUEST_GET]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
