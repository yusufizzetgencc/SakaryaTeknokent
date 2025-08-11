import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Sadece admin yetkisi kontrolü
  if (!session || session.user.role !== "admin") {
    return new NextResponse(
      JSON.stringify({ error: "Bu raporu görüntüleme yetkiniz yok." }),
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("categoryId") ?? undefined;
    const authorName = searchParams.get("authorName") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;

    // Prisma where koşulu
    const where: Prisma.IdeaWhereInput = {};

    if (categoryId) where.categoryId = categoryId;

    if (authorName) {
      // Prisma'da mode desteklenmiyor, o yüzden insensitively arama için ilerde raw query gerekebilir
      // Burada basit contains kullanıyoruz, büyük-küçük harf duyarlı olabilir.
      where.OR = [
        { author: { firstName: { contains: authorName } } },
        { author: { lastName: { contains: authorName } } },
      ];
    }

    if (startDate) {
      where.createdAt = {
        ...(where.createdAt as Prisma.DateTimeFilter),
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.createdAt = {
        ...(where.createdAt as Prisma.DateTimeFilter),
        lte: endOfDay,
      };
    }

    // Sorgu
    const reportData = await prisma.idea.findMany({
      where,
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
        category: {
          select: { name: true },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reportData, { status: 200 });
  } catch (error: unknown) {
    console.error("Yönetici raporu oluşturma hatası:", error);
    return new NextResponse(
      JSON.stringify({ error: "Rapor oluşturulurken bir hata oluştu." }),
      { status: 500 }
    );
  }
}
