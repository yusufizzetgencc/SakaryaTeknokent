import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "Bu işlemi görüntüleme yetkiniz yok." }),
      { status: 401 }
    );
  }

  const categoryId = params.id;
  if (!categoryId) {
    return new NextResponse(
      JSON.stringify({ error: "Geçerli bir kategori ID'si belirtilmelidir." }),
      { status: 400 }
    );
  }

  try {
    const category = await prisma.ideaCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return new NextResponse(
        JSON.stringify({ error: "Kategori bulunamadı." }),
        { status: 404 }
      );
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error: unknown) {
    console.error("[GET_CATEGORY_ID] Kategori getirme hatası:", error);
    return new NextResponse(
      JSON.stringify({ error: "Sunucuda bir hata oluştu." }),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new NextResponse(
      JSON.stringify({ error: "Bu işlemi yapmaya yetkiniz yok." }),
      { status: 403 }
    );
  }

  const categoryId = params.id;

  try {
    const body = await request.json();
    const { name, description, submissionEndsAt, votingEndsAt } = body;

    const updatedCategoryData: Prisma.IdeaCategoryUpdateInput = {
      name,
      description,
      submissionEndsAt: submissionEndsAt
        ? new Date(submissionEndsAt)
        : undefined,
      votingEndsAt: votingEndsAt ? new Date(votingEndsAt) : undefined,
    };

    const updatedCategory = await prisma.ideaCategory.update({
      where: { id: categoryId },
      data: updatedCategoryData,
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error: unknown) {
    console.error("[PUT_CATEGORY_ID] Kategori güncelleme hatası:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return new NextResponse(
        JSON.stringify({ error: "Güncellenecek kategori bulunamadı." }),
        { status: 404 }
      );
    }
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
      JSON.stringify({ error: "Kategori güncellenirken bir hata oluştu." }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new NextResponse(
      JSON.stringify({ error: "Bu işlemi yapmaya yetkiniz yok." }),
      { status: 403 }
    );
  }

  const categoryId = params.id;

  try {
    const ideasInCategory = await prisma.idea.count({
      where: { categoryId },
    });

    if (ideasInCategory > 0) {
      return new NextResponse(
        JSON.stringify({
          error: `Bu kategoriye ait ${ideasInCategory} adet fikir bulunduğu için silinemez.`,
        }),
        { status: 409 }
      );
    }

    await prisma.ideaCategory.delete({
      where: { id: categoryId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("[DELETE_CATEGORY_ID] Kategori silme hatası:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return new NextResponse(
        JSON.stringify({ error: "Silinecek kategori bulunamadı." }),
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify({ error: "Kategori silinirken bir hata oluştu." }),
      { status: 500 }
    );
  }
}
