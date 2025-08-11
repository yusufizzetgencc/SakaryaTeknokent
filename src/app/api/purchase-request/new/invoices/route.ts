import { NextRequest, NextResponse } from "next/server";
import path from "path";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import fs from "fs";

// This is crucial for Next.js App Router
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Yetkilendirme hatası" },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Content-Type multipart/form-data olmalı" },
        { status: 400 }
      );
    }

    // Get URL parameters (purchaseId and amount from query string)
    const url = new URL(request.url);
    const purchaseId = url.searchParams.get("purchaseId");
    const amountRaw = url.searchParams.get("amount");

    // Parse the form data using the built-in FormData API
    const formData = await request.formData();
    const file = formData.get("file") as File;

    const amount = amountRaw ? parseFloat(amountRaw) : NaN;

    if (!purchaseId || isNaN(amount)) {
      return NextResponse.json(
        { success: false, error: "purchaseId ve amount zorunlu" },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Sadece PDF, JPG, JPEG ve PNG dosyaları kabul edilir",
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Dosya boyutu 10MB'den küçük olmalıdır" },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_"); // sanitize filename
    const fileName = `${timestamp}-${originalName}`;
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/uploads/${fileName}`;

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Create invoice record
    await prisma.invoice.create({
      data: {
        purchaseId,
        fileUrl,
        amount,
        uploadedById: user.id,
        approved: false,
        rejectionReason: null,
      },
    });

    return NextResponse.json({ success: true, fileUrl });
  } catch (error) {
    console.error("Invoice yükleme hatası:", error);
    return NextResponse.json(
      { success: false, error: "Dosya yüklenemedi" },
      { status: 500 }
    );
  }
}
