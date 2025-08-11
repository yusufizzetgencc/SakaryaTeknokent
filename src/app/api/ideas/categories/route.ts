import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Yetkiniz yok." }), {
      status: 401,
    });
  }

  const { searchParams } = new URL(request.url);
  const isActive = searchParams.get("active");
  const isFinished = searchParams.get("finished");

  try {
    const where: Prisma.IdeaCategoryWhereInput = {};

    if (isActive === "true") {
      where.submissionEndsAt = { gte: new Date() };
    }

    if (isFinished === "true") {
      where.votingEndsAt = { lt: new Date() };
    }

    const select =
      isActive === "true" || isFinished === "true"
        ? { id: true, name: true }
        : undefined;

    const categories = await prisma.ideaCategory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select,
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error: unknown) {
    console.error("[GET_CATEGORIES] Kategori getirme hatası:", error);
    return new NextResponse(
      JSON.stringify({ error: "Sunucu hatası oluştu." }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new NextResponse(
      JSON.stringify({ error: "Bu işlemi yapmaya yetkiniz yok." }),
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, description, submissionEndsAt, votingEndsAt } = body;

    if (!name || !submissionEndsAt || !votingEndsAt) {
      return new NextResponse(
        JSON.stringify({
          error: "Kategori adı ve bitiş tarihleri zorunludur.",
        }),
        { status: 400 }
      );
    }

    const newCategory = await prisma.ideaCategory.create({
      data: {
        name,
        description,
        submissionEndsAt: new Date(submissionEndsAt),
        votingEndsAt: new Date(votingEndsAt),
        createdById: session.user.id,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST_CATEGORY] Kategori oluşturma hatası:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return new NextResponse(
        JSON.stringify({ error: "Bu isimde bir kategori zaten mevcut." }),
        { status: 409 }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: "Kategori oluşturulurken bir hata oluştu." }),
      { status: 500 }
    );
  }
}
