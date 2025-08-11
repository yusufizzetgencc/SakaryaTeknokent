import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ControlFrequency } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";
import { addMonths, addDays } from "date-fns";

const prisma = new PrismaClient();

const calculateNextDate = (
  startDate: Date,
  frequency: ControlFrequency | string
): Date => {
  switch (frequency) {
    case ControlFrequency.FIFTEEN_DAYS:
      return addDays(startDate, 15);
    case ControlFrequency.MONTHLY:
      return addMonths(startDate, 1);
    case ControlFrequency.TWO_MONTHS:
      return addMonths(startDate, 2);
    case ControlFrequency.QUARTERLY:
      return addMonths(startDate, 3);
    case ControlFrequency.FOUR_MONTHS:
      return addMonths(startDate, 4);
    case ControlFrequency.FIVE_MONTHS:
      return addMonths(startDate, 5);
    case ControlFrequency.SEMI_ANNUALLY:
      return addMonths(startDate, 6);
    case ControlFrequency.SEVEN_MONTHS:
      return addMonths(startDate, 7);
    case ControlFrequency.EIGHT_MONTHS:
      return addMonths(startDate, 8);
    case ControlFrequency.NINE_MONTHS:
      return addMonths(startDate, 9);
    case ControlFrequency.TEN_MONTHS:
      return addMonths(startDate, 10);
    case ControlFrequency.ELEVEN_MONTHS:
      return addMonths(startDate, 11);
    case ControlFrequency.ANNUALLY:
      return addMonths(startDate, 12);
    default:
      return addMonths(startDate, 1);
  }
};

function isPrismaError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const deviceId = formData.get("deviceId") as string;
  const frequency = formData.get("frequency") as ControlFrequency;
  const firstControlDateStr = formData.get("firstControlDate") as string;
  const notes = formData.get("notes") as string | null;
  const createdById = formData.get("createdById") as string;
  const file = formData.get("file") as File;

  if (
    !deviceId ||
    !frequency ||
    !firstControlDateStr ||
    !createdById ||
    !file ||
    file.size === 0
  ) {
    return NextResponse.json(
      { error: "Tüm zorunlu alanlar ve dosya gereklidir." },
      { status: 400 }
    );
  }

  // Kullanıcı var mı kontrol et
  const userExists = await prisma.user.findUnique({
    where: { id: createdById },
  });
  if (!userExists) {
    return NextResponse.json(
      { error: "Geçersiz kullanıcı ID'si: createdById bulunamadı." },
      { status: 400 }
    );
  }

  const firstControlDate = new Date(firstControlDateStr);
  const nextControlDate = calculateNextDate(firstControlDate, frequency);

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");
  const filePath = path.join(
    process.cwd(),
    "public/uploads/controls/" + filename
  );
  await writeFile(filePath, buffer);
  const fileUrl = `/uploads/controls/${filename}`;

  try {
    const newPlan = await prisma.periodicControl.create({
      data: {
        deviceId,
        frequency,
        nextControlDate,
        createdById,
        logs: {
          create: {
            controlDate: firstControlDate,
            fileUrl,
            notes,
            performedById: createdById,
          },
        },
      },
      include: { logs: true },
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error: unknown) {
    if (isPrismaError(error) && error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu cihazın zaten bir periyodik kontrol planı var." },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Plan oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("deviceId");
  if (!deviceId)
    return NextResponse.json(
      { error: "Cihaz ID'si gerekli." },
      { status: 400 }
    );

  const plan = await prisma.periodicControl.findUnique({
    where: { deviceId },
    include: {
      logs: {
        orderBy: { controlDate: "desc" },
        include: {
          performedBy: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  return NextResponse.json(plan);
}
