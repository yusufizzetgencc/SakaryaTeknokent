import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.approved) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı veya onaylı değil" },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const leaveType = formData.get("leaveType")?.toString() ?? "";
    const startDateTime = formData.get("startDateTime")?.toString() ?? "";
    const endDateTime = formData.get("endDateTime")?.toString() ?? "";
    const durationValue = formData.get("durationValue")?.toString() ?? "";
    const unit = formData.get("unit")?.toString() ?? "";
    const contactInfo = formData.get("contactInfo")?.toString() ?? "";
    const explanation = formData.get("explanation")?.toString() ?? "";

    const file = formData.get("file") as File | null;

    let fileUrl: string | null = null;

    if (file && file.size > 0) {
      // Yeni klasör: public/uploads/leave
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "leave");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Dosya adını benzersiz yap (timestamp + orijinal isim)
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/\s+/g, "-");
      const fileName = `${timestamp}-${safeFileName}`;

      const filePath = path.join(uploadsDir, fileName);

      // Dosya bufferını al
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Dosyayı yaz
      await fs.promises.writeFile(filePath, buffer);

      // URL olarak kaydet (public/uploads/leave/...)
      fileUrl = `/uploads/leave/${fileName}`;
    }

    const newLeave = await prisma.leaveRequest.create({
      data: {
        userId: user.id,
        leaveType,
        startDate: new Date(startDateTime),
        endDate: new Date(endDateTime),
        duration: durationValue,
        unit,
        contactInfo,
        explanation,
        fileUrl,
        approved: false,
        rejected: false,
      },
    });

    return NextResponse.json({ success: true, leave: newLeave });
  } catch (error) {
    console.error("[API][POST] /api/leave", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    return NextResponse.json(leaves);
  } catch (error) {
    console.error("[API][GET] /api/leave", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
