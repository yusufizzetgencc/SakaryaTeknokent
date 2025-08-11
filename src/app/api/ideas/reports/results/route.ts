import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "Bu raporu görüntüleme yetkiniz yok." }),
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  if (!categoryId) {
    return new NextResponse(
      JSON.stringify({ error: "Kategori ID'si gereklidir." }),
      { status: 400 }
    );
  }

  try {
    // 1. Kategori var mı ve oylama süresi bitmiş mi diye kontrol et
    const category = await prisma.ideaCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category || new Date() < new Date(category.votingEndsAt)) {
      return new NextResponse(
        JSON.stringify({
          error: "Bu kategorinin oylama süresi henüz dolmadı.",
        }),
        { status: 403 }
      );
    }

    // 2. Fikirleri oy sayıları ile birlikte al ve sırala
    const results = await prisma.idea.findMany({
      where: {
        categoryId: categoryId,
        // Onaylama adımı olsaydı status: 'APPROVED' eklenirdi.
      },
      select: {
        id: true,
        title: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    });

    // 3. Veriyi frontend için işle: _count.votes'u voteCount'a dönüştür ve sırala
    const processedResults = results
      .map((idea) => ({
        id: idea.id,
        title: idea.title,
        author: idea.author,
        voteCount: idea._count.votes,
      }))
      .sort((a, b) => b.voteCount - a.voteCount); // Çoktan aza doğru sırala

    return NextResponse.json(processedResults, { status: 200 });
  } catch (error) {
    console.error("Sonuç raporu oluşturma hatası:", error);
    return new NextResponse(
      JSON.stringify({ error: "Rapor oluşturulurken bir hata oluştu." }),
      { status: 500 }
    );
  }
}
