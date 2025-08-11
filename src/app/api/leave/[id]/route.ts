// src/app/api/leave/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest, // ESLint uyarısı için underscore eklendi
  context: { params: Promise<{ id: string }> } // Next.js 15 için güncellenmiş parametre yapısı
) {
  try {
    // Params'ı await ile resolve ediyoruz
    const { id } = await context.params;

    // İzin talebini user bilgisiyle birlikte getir
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { error: "İzin talebi bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error("[API][GET] /api/leave/[id]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
