import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json(
      { error: "Yetki ID belirtilmeli." },
      { status: 400 }
    );
  }

  try {
    // Önce yetkinin varlığını kontrol et
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      return NextResponse.json({ error: "Yetki bulunamadı." }, { status: 404 });
    }

    // Yetkiyi sil
    await prisma.permission.delete({ where: { id } });

    return NextResponse.json({ message: "Yetki başarıyla silindi." });
  } catch (error) {
    console.error("[DELETE /api/admin/permissions/[id]] Error:", error);
    return NextResponse.json(
      { error: "Yetki silinirken hata oluştu." },
      { status: 500 }
    );
  }
}
