import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } } // params.userId olarak değişti
) {
  const userId = params.userId;

  if (!userId) {
    return NextResponse.json(
      { error: "userId parametresi zorunludur." },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Kullanıcı başarıyla silindi." });
  } catch (error) {
    console.error("Kullanıcı silinirken hata:", error);
    return NextResponse.json(
      { error: "Kullanıcı silinirken hata oluştu veya kullanıcı bulunamadı." },
      { status: 500 }
    );
  }
}
