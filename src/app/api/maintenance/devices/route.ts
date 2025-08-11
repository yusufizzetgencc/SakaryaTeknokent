// src/app/api/maintenance/devices/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const devices = await prisma.maintenanceDevice.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true, // Kategori adını göstermek için
        addedBy: {
          // Ekleyen kullanıcı adını göstermek için
          select: {
            firstName: true,
            lastName: true,
          },
        },
        images: true, // Cihaz görsellerini almak için
      },
    });
    return NextResponse.json(devices);
  } catch (error) {
    console.error("Cihaz listeleme hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası: Cihazlar listelenemedi." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const deviceCode = formData.get("deviceCode") as string;
    const name = formData.get("name") as string;
    const brand = formData.get("brand") as string | null;
    const model = formData.get("model") as string | null;
    const serialNumber = formData.get("serialNumber") as string;
    const building = formData.get("building") as string | null;
    const location = formData.get("location") as string | null;
    const categoryId = formData.get("categoryId") as string;
    const description = formData.get("description") as string | null;

    // Artık client’tan eklenen user ID yerine, session veya JWT'den alınması gerekiyor.
    // Burada sadece örnek olarak formData’dan alıyoruz.
    const addedById = formData.get("addedById") as string;

    const images = formData.getAll("images") as File[];

    if (!deviceCode || !name || !serialNumber || !categoryId || !addedById) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/devices");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {}

    const imageUrls: string[] = [];

    if (images && images.length > 0) {
      for (const file of images) {
        if (file.size === 0) continue;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename =
          Date.now() + "_" + file.name.replace(/\s+/g, "_").toLowerCase();
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        imageUrls.push(`/uploads/devices/${filename}`);
      }
    }

    // Kullanıcının gerçekten veritabanında olup olmadığını kontrol etmek faydalı:
    const userExists = await prisma.user.findUnique({
      where: { id: addedById },
    });
    if (!userExists) {
      return NextResponse.json(
        { error: "Geçersiz kullanıcı." },
        { status: 400 }
      );
    }

    const newDevice = await prisma.maintenanceDevice.create({
      data: {
        deviceCode,
        name,
        brand: brand ?? "",
        model: model ?? "",
        serialNumber,
        building: building ?? "",
        location: location ?? "",
        description,
        categoryId,
        addedById,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json(newDevice, { status: 201 });
  } catch (error) {
    console.error("Cihaz ekleme hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
