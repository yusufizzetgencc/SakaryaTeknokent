import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: "Yetkiniz yok." }), {
      status: 401,
    });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  if (!categoryId) {
    return new NextResponse(
      JSON.stringify({ error: "Kategori ID'si gerekli." }),
      { status: 400 }
    );
  }

  try {
    // 1. Kategori bilgilerini ve süreleri kontrol et
    const category = await prisma.ideaCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return new NextResponse(
        JSON.stringify({ error: "Kategori bulunamadı." }),
        { status: 404 }
      );
    }

    const now = new Date();
    // Fikir gönderim süresi bitmeden veya oylama süresi bittikten sonra fikirleri gösterme
    if (now < category.submissionEndsAt || now > category.votingEndsAt) {
      return NextResponse.json({ ideas: [], userVote: null });
    }

    // 2. Bu kategorideki fikirleri al
    // Not: Orijinal planda "onaylama" adımı yoktu, bu yüzden PENDING dışındakileri alabiliriz.
    // Eğer onaylama eklenirse, burası status: 'APPROVED' olarak güncellenmeli.
    const ideas = await prisma.idea.findMany({
      where: { categoryId: categoryId },
      select: { id: true, title: true, description: true, authorId: true },
    });

    // 3. Kullanıcının bu kategorideki mevcut oyunu bul
    const userVote = await prisma.ideaVote.findFirst({
      where: {
        userId: session.user.id,
        idea: {
          categoryId: categoryId,
        },
      },
      select: { ideaId: true },
    });

    // 4. Frontend için veriyi işle: Her fikir için kullanıcının sahip olup olmadığını ekle
    const processedIdeas = ideas.map((idea) => ({
      ...idea,
      isOwner: idea.authorId === session.user.id,
    }));

    return NextResponse.json(
      {
        ideas: processedIdeas,
        userVote: userVote?.ideaId || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Oylanabilir fikirleri getirme hatası:", error);
    return new NextResponse(
      JSON.stringify({ error: "Sunucu hatası oluştu." }),
      { status: 500 }
    );
  }
}
