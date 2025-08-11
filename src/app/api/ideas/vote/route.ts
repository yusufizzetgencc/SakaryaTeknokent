import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse(
      JSON.stringify({ error: "Oy vermek için giriş yapmalısınız." }),
      { status: 401 }
    );
  }

  try {
    const { ideaId } = await request.json();
    if (!ideaId) {
      return new NextResponse(
        JSON.stringify({ error: "Fikir ID'si gerekli." }),
        { status: 400 }
      );
    }

    // 1. Fikrin ve kategorisinin bilgilerini al
    const ideaToVote = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: { category: true },
    });

    if (!ideaToVote) {
      return new NextResponse(
        JSON.stringify({ error: "Oy verilecek fikir bulunamadı." }),
        { status: 404 }
      );
    }

    // 2. İş Kuralları Kontrolü
    // Kendine oy veremez
    if (ideaToVote.authorId === session.user.id) {
      return new NextResponse(
        JSON.stringify({ error: "Kendi fikrinize oy veremezsiniz." }),
        { status: 403 }
      );
    }
    // Oylama süresi geçmiş mi?
    if (new Date() > new Date(ideaToVote.category.votingEndsAt)) {
      return new NextResponse(
        JSON.stringify({ error: "Bu kategori için oylama süresi dolmuştur." }),
        { status: 403 }
      );
    }
    // Kullanıcı bu kategoride daha önce oy kullanmış mı?
    const existingVote = await prisma.ideaVote.findFirst({
      where: {
        userId: session.user.id,
        idea: { categoryId: ideaToVote.categoryId },
      },
    });
    if (existingVote) {
      return new NextResponse(
        JSON.stringify({ error: "Bu kategoride zaten oy kullandınız." }),
        { status: 409 }
      );
    }

    // 3. Oy'u Veritabanına Kaydet
    await prisma.ideaVote.create({
      data: {
        userId: session.user.id,
        ideaId: ideaId,
      },
    });

    return new NextResponse(null, { status: 201 });
  } catch (error) {
    console.error("Oy verme hatası:", error);
    return new NextResponse(
      JSON.stringify({ error: "Oy verilirken bir hata oluştu." }),
      { status: 500 }
    );
  }
}
