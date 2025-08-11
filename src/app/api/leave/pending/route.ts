import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Onaylanmamış izin taleplerini çek (approved = false)
    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: { approved: false },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true, // EKLENDİ
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ leaves: pendingLeaves });
  } catch (error) {
    console.error("[API][GET] /api/leave/pending", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
