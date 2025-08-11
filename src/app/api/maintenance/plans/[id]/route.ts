import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, MaintenanceStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { completedDate, completionNotes, completedById } = body;

    if (!completedDate || !completedById) {
      return NextResponse.json(
        { error: "Tamamlanma Tarihi ve Tamamlayan Kişi zorunludur." },
        { status: 400 }
      );
    }

    // Tamamlayan kullanıcının varlığını kontrol et
    const user = await prisma.user.findUnique({ where: { id: completedById } });
    if (!user) {
      return NextResponse.json(
        { error: "Tamamlayan kullanıcı bulunamadı." },
        { status: 400 }
      );
    }

    // Bakım planını güncelle
    const updatedPlan = await prisma.maintenancePlan.update({
      where: { id },
      data: {
        completedDate: new Date(completedDate),
        completionNotes: completionNotes || null,
        completedById,
        status: MaintenanceStatus.COMPLETED,
      },
      include: {
        plannedBy: { select: { firstName: true, lastName: true } },
        completedBy: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("Bakım planı güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
