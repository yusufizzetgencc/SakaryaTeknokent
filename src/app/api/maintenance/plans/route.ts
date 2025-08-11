import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, MaintenanceStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, plannedDate, planningNotes, plannedById } = body;

    if (!deviceId || !plannedDate || !plannedById) {
      return NextResponse.json(
        { error: "Cihaz, Planlama Tarihi ve Planlayan Kişi zorunludur." },
        { status: 400 }
      );
    }

    // Planlayan kullanıcının varlığını doğrula
    const user = await prisma.user.findUnique({ where: { id: plannedById } });
    if (!user) {
      return NextResponse.json(
        { error: "Planlayan kullanıcı bulunamadı." },
        { status: 400 }
      );
    }

    // Yeni plan oluştur
    const newPlan = await prisma.maintenancePlan.create({
      data: {
        deviceId,
        plannedDate: new Date(plannedDate),
        planningNotes: planningNotes || null,
        plannedById,
        status: MaintenanceStatus.PLANNED,
      },
      include: {
        plannedBy: { select: { firstName: true, lastName: true } },
        completedBy: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error("Bakım planı oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("deviceId");

  if (!deviceId) {
    return NextResponse.json(
      { error: "Cihaz ID'si gereklidir." },
      { status: 400 }
    );
  }

  try {
    const plans = await prisma.maintenancePlan.findMany({
      where: { deviceId },
      orderBy: { plannedDate: "desc" },
      include: {
        plannedBy: { select: { firstName: true, lastName: true } },
        completedBy: { select: { firstName: true, lastName: true } },
      },
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Planları listeleme hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
