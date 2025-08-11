import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

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
    const addedById = formData.get("addedById") as string;

    const imageFile = formData.get("image") as File | null; // TEK FOTOĞRAF

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

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uniqueSuffix = randomUUID();
      const filename =
        uniqueSuffix + "_" + imageFile.name.replace(/\s+/g, "_").toLowerCase();
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      imageUrls.push(`/uploads/devices/${filename}`);
    }

    // Kullanıcı kontrolü
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
          create: imageUrls.length > 0 ? [{ url: imageUrls[0] }] : [],
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
