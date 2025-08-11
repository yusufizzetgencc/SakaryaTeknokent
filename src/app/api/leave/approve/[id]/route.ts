import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // Next.js 15 için güncellenmiş parametre yapısı
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    // Params'ı await ile resolve ediyoruz
    const { id } = await context.params;
    const body = await req.json();
    const { action, reason } = body as { action: string; reason?: string };

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { error: "İzin talebi bulunamadı" },
        { status: 404 }
      );
    }

    // Kendi talebini onaylayamaz veya reddedemez
    if (leaveRequest.userId === user.id) {
      return NextResponse.json(
        { error: "Kendi izin talebinizi onaylayamaz veya reddedemezsiniz" },
        { status: 403 }
      );
    }

    if (action === "approve") {
      await prisma.leaveRequest.update({
        where: { id },
        data: {
          approved: true,
          rejected: false,
          rejectionReason: null,
        },
      });
      return NextResponse.json({ success: true, message: "İzin onaylandı" });
    } else if (action === "reject") {
      if (!reason || reason.trim() === "") {
        return NextResponse.json(
          { error: "Red nedeni zorunludur" },
          { status: 400 }
        );
      }
      await prisma.leaveRequest.update({
        where: { id },
        data: {
          approved: false,
          rejected: true,
          rejectionReason: reason.trim(),
        },
      });
      return NextResponse.json({ success: true, message: "İzin reddedildi" });
    } else {
      return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
    }
  } catch (error) {
    console.error("[API][PUT] /api/leave/approve/[id]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
