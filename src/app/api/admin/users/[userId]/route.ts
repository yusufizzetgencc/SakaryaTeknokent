import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Next.js 15 App Router'da dinamik route handler'lar için güncellenmiş parametre yapısı
export async function DELETE(
  // 1. parametre: request objesi. Kullanılmadığı için '_request' olarak isimlendirildi.
  _request: NextRequest,
  // 2. parametre: Next.js 15'te değişen context yapısı - promise olarak gelir
  context: { params: Promise<{ userId: string }> }
) {
  // Params'ı await ile resolve ediyoruz
  const { userId } = await context.params;

  try {
    // Belirtilen ID'ye sahip kullanıcıyı veritabanından sil
    await prisma.user.delete({
      where: { id: userId },
    });

    // İşlem başarılı olursa, 200 OK durumu ile başarı mesajı döndür
    return NextResponse.json(
      { message: "Kullanıcı başarıyla silindi." },
      { status: 200 }
    );
  } catch (error) {
    // Hata bir Prisma hatasıysa ve kayıt bulunamadıysa (P2025), 404 döndür
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: `Silinmek istenen kullanıcı (ID: ${userId}) bulunamadı.` },
        { status: 404 }
      );
    }

    // Diğer tüm beklenmedik hatalar için 500 sunucu hatası döndür
    console.error("Kullanıcı silinirken hata:", error);
    return NextResponse.json(
      { error: "Kullanıcı silinirken sunucu tarafında bir hata oluştu." },
      { status: 500 }
    );
  }
}
