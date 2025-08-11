// src/app/api/maintenance/devices/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { unlink } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// Cihaz durumunu güncelleme (Aktif/Pasif)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "Geçersiz 'isActive' değeri." },
        { status: 400 }
      );
    }

    const updatedDevice = await prisma.maintenanceDevice.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error("Cihaz durumu güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

// Cihazı silme
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Önce cihazı ve ilişkili resimlerini bul
    const deviceToDelete = await prisma.maintenanceDevice.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!deviceToDelete) {
      return NextResponse.json({ error: "Cihaz bulunamadı." }, { status: 404 });
    }

    // İlişkili resim dosyalarını sunucudan sil
    if (deviceToDelete.images && deviceToDelete.images.length > 0) {
      for (const image of deviceToDelete.images) {
        try {
          const filePath = path.join(process.cwd(), "public", image.url);
          await unlink(filePath);
        } catch (fileError) {
          console.error(`Dosya silinemedi: ${image.url}`, fileError);
          // Dosya silinemese bile işleme devam et, veritabanı bütünlüğü daha önemli.
        }
      }
    }

    // Veritabanından cihazı sil (ilişkili resim kayıtları 'onDelete: Cascade' ile silinecek)
    await prisma.maintenanceDevice.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // Başarılı silme
  } catch (error) {
    console.error("Cihaz silme hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
