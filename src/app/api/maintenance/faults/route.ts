import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // DİKKAT: Bu dosya yolunu kendi projenizdeki authOptions yoluna göre düzenleyin.

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // OTURUM BİLGİSİNİ AL
    const session = await getServerSession(authOptions);

    // OTURUM KONTROLÜ
    if (!session?.user?.id) {
      return new NextResponse("Yetkisiz işlem veya kullanıcı ID bulunamadı.", {
        status: 401,
      });
    }

    const userId = session.user.id; // Gerçek kullanıcı ID'sini al

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    const data = {
      deviceId: formData.get("deviceId") as string,
      startDate: formData.get("startDate") as string,
      endDate: (formData.get("endDate") as string) || null,
      description: formData.get("description") as string,
      actionTaken: formData.get("actionTaken") as string,
      downtimeDuration: parseInt(
        (formData.get("downtimeDuration") as string) || "0",
        10
      ),
      downtimeUnit:
        (formData.get("downtimeUnit") as "HOURS" | "DAYS") || "HOURS",
      notes: (formData.get("notes") as string) || null,
      repairedByName: formData.get("repairedByName") as string | null,
    };

    if (
      !data.deviceId ||
      !data.startDate ||
      !data.description ||
      !data.actionTaken
    ) {
      return new NextResponse("Eksik alanlar mevcut.", { status: 400 });
    }

    let fileUrl: string | undefined = undefined;

    if (file && file.size > 0) {
      const uploadsDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "faults"
      );
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/\s+/g, "_");
      const fileName = `${timestamp}_${safeFileName}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/faults/${fileName}`;
    }

    // Kayıt oluştur
    const newFaultLog = await prisma.faultLog.create({
      data: {
        deviceId: data.deviceId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description,
        actionTaken: data.actionTaken,
        downtimeDuration: data.downtimeDuration,
        downtimeUnit: data.downtimeUnit,
        notes: data.notes,
        fileUrl,
        reportedById: userId, // GERÇEK KULLANICI ID'SİNİ KULLAN
        repairedByName: data.repairedByName,
      },
      include: {
        // Başarılı yanıt için kullanıcı bilgisini de döndürelim
        reportedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(newFaultLog, { status: 201 });
  } catch (error) {
    console.error("[FAULTS_POST_FORM]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// GET fonksiyonunda bir değişiklik yapmaya gerek yok, o doğru çalışıyor.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("deviceId");

  if (!deviceId) {
    return new NextResponse("Cihaz ID eksik", { status: 400 });
  }

  try {
    const faultLogs = await prisma.faultLog.findMany({
      where: { deviceId },
      orderBy: { startDate: "desc" },
      include: {
        reportedBy: {
          select: { firstName: true, lastName: true },
        },
      },
    });
    return NextResponse.json(faultLogs);
  } catch (error) {
    console.error("[FAULTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
