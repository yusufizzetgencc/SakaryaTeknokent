import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse(
      JSON.stringify({
        error: "Bu sayfayı görüntülemek için giriş yapmalısınız.",
      }),
      { status: 401 }
    );
  }

  try {
    const myIdeas = await prisma.idea.findMany({
      where: {
        authorId: session.user.id, // Sadece bu kullanıcının fikirlerini bul
      },
      include: {
        category: {
          // Fikrin ait olduğu kategori bilgisini de al
          select: {
            name: true,
            votingEndsAt: true, // Durum bilgisi için oylama bitiş tarihini al
          },
        },
        _count: {
          // Oy sayısını al
          select: {
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // En son gönderdiği fikir en üstte olsun
      },
    });

    return NextResponse.json(myIdeas, { status: 200 });
  } catch (error) {
    console.error("Kullanıcının fikirlerini getirme hatası:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Fikirleriniz getirilirken bir sunucu hatası oluştu.",
      }),
      { status: 500 }
    );
  }
}
