// app/api/private-file/[...slug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import mime from "mime-types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // 1. KULLANICI GİRİŞ YAPMIŞ MI?
    if (!session?.user?.id) {
      return new NextResponse("Yetkisiz", { status: 401 });
    }

    const { slug } = await context.params;
    const requestedPath = slug.join("/");

    // 2. GÜVENLİK: Path Traversal saldırılarını önle
    if (requestedPath.includes("..")) {
      return new NextResponse("Geçersiz dosya yolu", { status: 400 });
    }

    // 3. YETKİLENDİRME: Kullanıcı bu dosyayı görmeye yetkili mi?
    const fileName = slug[slug.length - 1]; // Örn: izin-formu-abc123.pdf

    if (requestedPath.startsWith("leave_forms/")) {
      const leaveRequestId = fileName
        .replace("izin-formu-", "")
        .replace(".pdf", "");
      if (leaveRequestId) {
        const leaveRequest = await prisma.leaveRequest.findFirst({
          where: {
            id: leaveRequestId,
            userId: session.user.id,
          },
        });
        if (!leaveRequest) {
          return new NextResponse("Erişim Reddedildi", { status: 403 });
        }
      }
    } else if (requestedPath.startsWith("leave_uploads/")) {
      // Dosya adı formatımız: `${timestamp}-${userId}-${safeFileName}`
      const fileUserId = fileName.split("-")[1];
      if (fileUserId !== session.user.id) {
        return new NextResponse("Erişim Reddedildi", { status: 403 });
      }
    }

    // 4. DOSYAYI SUNMA
    const filePath = path.join(process.cwd(), "private_uploads", requestedPath);

    const fileBuffer = await fs.readFile(filePath);
    const mimeType = mime.lookup(filePath) || "application/octet-stream";

    const headers = new Headers();
    headers.set("Content-Type", mimeType);

    return new Response(new Uint8Array(fileBuffer), { status: 200, headers });
  } catch (error) {
    console.error("Dosya sunma hatası:", error);
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return new NextResponse("Dosya bulunamadı", { status: 404 });
    }
    return new NextResponse("Dosya sunucusu hatası", { status: 500 });
  }
}
