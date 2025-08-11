import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

// --- YENİ FİKİR OLUŞTUR (POST) ---
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse(
      JSON.stringify({ error: "Fikir göndermek için giriş yapmalısınız." }),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { title, description, categoryId } = body;

    // 1. Girdi Doğrulama
    if (!title || !description || !categoryId) {
      return new NextResponse(
        JSON.stringify({
          error: "Eksik bilgi. Başlık, açıklama ve kategori zorunludur.",
        }),
        { status: 400 }
      );
    }

    // 2. İş Kuralı: Kategori var mı ve hala aktif mi?
    const category = await prisma.ideaCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return new NextResponse(
        JSON.stringify({ error: "Geçersiz kategori seçimi." }),
        { status: 404 }
      );
    }

    if (new Date() > new Date(category.submissionEndsAt)) {
      return new NextResponse(
        JSON.stringify({
          error: "Bu kategori için fikir gönderme süresi dolmuştur.",
        }),
        { status: 403 }
      );
    }

    // 3. Veritabanına Kaydetme
    const newIdea = await prisma.idea.create({
      data: {
        title,
        description,
        categoryId: categoryId,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(newIdea, { status: 201 });
  } catch (error) {
    console.error("Fikir oluşturma hatası:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Fikir oluşturulurken sunucu tarafında bir hata oluştu.",
      }),
      { status: 500 }
    );
  }
}
