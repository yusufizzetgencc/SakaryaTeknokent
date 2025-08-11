import { NextResponse, NextRequest } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Raporlama için birleşik tip tanımı
export type MaintenanceReportItem = {
  id: string;
  type: "Bakım" | "Arıza" | "Kontrol";
  date: Date;
  description: string;
  details: string | null;
  fileUrl: string | null;
  user: string | null;
  device: {
    id: string;
    name: string;
    deviceCode: string;
  };
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Filtreleri al
    const type = searchParams.get("type"); // 'bakim', 'ariza', 'kontrol', 'tumu'
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const deviceId = searchParams.get("deviceId");
    const deviceCode = searchParams.get("deviceCode");
    const isActive = searchParams.get("isActive"); // 'true', 'false'

    // Cihaz için WHERE koşulu oluştur
    const deviceWhere: Prisma.MaintenanceDeviceWhereInput = {};
    if (deviceId) deviceWhere.id = deviceId;
    if (deviceCode) deviceWhere.deviceCode = { contains: deviceCode };
    if (isActive) deviceWhere.isActive = isActive === "true";

    // Tarih aralığı koşulu
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      // Bitiş tarihini gün sonu olarak al
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.lte = endOfDay;
    }

    const reportItems: MaintenanceReportItem[] = [];

    // 1. Bakım Kayıtlarını Çek (Tamamlanmış olanlar)
    if (type === "bakim" || type === "tumu") {
      const maintenancePlans = await prisma.maintenancePlan.findMany({
        where: {
          status: "COMPLETED",
          completedDate:
            dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
          device: deviceWhere,
        },
        include: {
          device: true,
          completedBy: { select: { firstName: true, lastName: true } },
        },
      });

      reportItems.push(
        ...maintenancePlans.map((p) => ({
          id: p.id,
          type: "Bakım" as const,
          date: p.completedDate!,
          description: p.planningNotes || "Planlı bakım",
          details: p.completionNotes,
          fileUrl: null, // Bakım planında dosya yok
          user: p.completedBy
            ? `${p.completedBy.firstName} ${p.completedBy.lastName}`
            : "Bilinmiyor",
          device: {
            id: p.device.id,
            name: p.device.name,
            deviceCode: p.device.deviceCode,
          },
        }))
      );
    }

    // 2. Arıza Kayıtlarını Çek
    if (type === "ariza" || type === "tumu") {
      const faultLogs = await prisma.faultLog.findMany({
        where: {
          startDate: dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
          device: deviceWhere,
        },
        include: {
          device: true,
          reportedBy: { select: { firstName: true, lastName: true } },
        },
      });

      reportItems.push(
        ...faultLogs.map((f) => ({
          id: f.id,
          type: "Arıza" as const,
          date: f.startDate,
          description: f.description,
          details: f.actionTaken,
          fileUrl: f.fileUrl,
          user: f.reportedBy
            ? `${f.reportedBy.firstName} ${f.reportedBy.lastName}`
            : "Bilinmiyor",
          device: {
            id: f.device.id,
            name: f.device.name,
            deviceCode: f.device.deviceCode,
          },
        }))
      );
    }

    // 3. Periyodik Kontrol Kayıtlarını Çek
    if (type === "kontrol" || type === "tumu") {
      const controlLogs = await prisma.periodicControlLog.findMany({
        where: {
          controlDate:
            dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
          controlPlan: {
            device: deviceWhere,
          },
        },
        include: {
          controlPlan: { include: { device: true } },
          performedBy: { select: { firstName: true, lastName: true } },
        },
      });

      reportItems.push(
        ...controlLogs.map((c) => ({
          id: c.id,
          type: "Kontrol" as const,
          date: c.controlDate,
          description: "Periyodik kontrol yapıldı",
          details: c.notes,
          fileUrl: c.fileUrl,
          user: c.performedBy
            ? `${c.performedBy.firstName} ${c.performedBy.lastName}`
            : "Bilinmiyor",
          device: {
            id: c.controlPlan.device.id,
            name: c.controlPlan.device.name,
            deviceCode: c.controlPlan.device.deviceCode,
          },
        }))
      );
    }

    // Tüm sonuçları tarihe göre en yeniden eskiye sırala
    reportItems.sort((a, b) => b.date.getTime() - a.date.getTime());

    return NextResponse.json(reportItems);
  } catch (error) {
    console.error("[MAINTENANCE_REPORTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
