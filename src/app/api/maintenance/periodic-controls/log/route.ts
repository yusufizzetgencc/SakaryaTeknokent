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

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const controlPlanId = formData.get("controlPlanId") as string;
  const controlDateStr = formData.get("controlDate") as string;
  const notes = formData.get("notes") as string | null;
  const performedById = formData.get("performedById") as string;
  const file = formData.get("file") as File;

  if (
    !controlPlanId ||
    !controlDateStr ||
    !performedById ||
    !file ||
    file.size === 0
  ) {
    return NextResponse.json(
      { error: "Tüm zorunlu alanlar ve dosya gereklidir." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");
  const filePath = path.join(
    process.cwd(),
    "public/uploads/controls/" + filename
  );
  await writeFile(filePath, buffer);
  const fileUrl = `/uploads/controls/${filename}`;

  const controlDate = new Date(controlDateStr);

  try {
    const updatedPlan = await prisma.$transaction(async (tx) => {
      await tx.periodicControlLog.create({
        data: { controlPlanId, controlDate, fileUrl, notes, performedById },
      });

      const plan = await tx.periodicControl.findUnique({
        where: { id: controlPlanId },
      });
      if (!plan) throw new Error("Plan bulunamadı.");
      const nextControlDate = calculateNextDate(controlDate, plan.frequency);

      return tx.periodicControl.update({
        where: { id: controlPlanId },
        data: { nextControlDate },
      });
    });

    return NextResponse.json(updatedPlan, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Yeni kontrol logu eklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
