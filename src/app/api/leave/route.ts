import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { fillPdfFromTemplate } from "@/lib/fillPdfFromTemplate";

const UPLOADS_DIR = path.join(
  process.cwd(),
  "private_uploads",
  "leave_uploads"
);
const FORMS_DIR = path.join(process.cwd(), "private_uploads", "leave_forms");

const ensureDirExists = async (dir: string) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

export async function POST(req: NextRequest) {
  try {
    await ensureDirExists(UPLOADS_DIR);
    await ensureDirExists(FORMS_DIR);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, approved: true, firstName: true, lastName: true },
    });

    if (!user || !user.approved) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı veya onaylı değil" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    const leaveDataFromForm = {
      leaveType: formData.get("leaveType")?.toString() ?? "",
      startDateTime: formData.get("startDateTime")?.toString() ?? "",
      endDateTime: formData.get("endDateTime")?.toString() ?? "",
      durationValue: formData.get("durationValue")?.toString() ?? "",
      unit: formData.get("unit")?.toString() ?? "",
      contactInfo: formData.get("contactInfo")?.toString() ?? "",
      explanation: formData.get("explanation")?.toString() ?? "",
    };

    let uploadedFilePath: string | null = null;
    if (file && file.size > 0) {
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/\s+/g, "-");
      const fileName = `${timestamp}-${user.id}-${safeFileName}`;
      const filePath = path.join(UPLOADS_DIR, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      uploadedFilePath = `leave_uploads/${fileName}`;
    }

    const newLeaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: user.id,
        leaveType: leaveDataFromForm.leaveType,
        startDate: new Date(leaveDataFromForm.startDateTime),
        endDate: new Date(leaveDataFromForm.endDateTime),
        duration: leaveDataFromForm.durationValue,
        unit: leaveDataFromForm.unit,
        contactInfo: leaveDataFromForm.contactInfo,
        explanation: leaveDataFromForm.explanation,
        uploadedFileUrl: uploadedFilePath,
      },
    });

    const pdfData = {
      firstName: user.firstName,
      lastName: user.lastName,
      contactInfo: leaveDataFromForm.contactInfo,
      unit: leaveDataFromForm.unit,
      startDate: leaveDataFromForm.startDateTime
        ? new Date(leaveDataFromForm.startDateTime).toISOString()
        : new Date().toISOString(),
      endDate: leaveDataFromForm.endDateTime
        ? new Date(leaveDataFromForm.endDateTime).toISOString()
        : new Date().toISOString(),
      duration: leaveDataFromForm.durationValue,
      leaveType: leaveDataFromForm.leaveType,
      explanation: leaveDataFromForm.explanation,
    };

    const pdfBuffer = await fillPdfFromTemplate(pdfData);

    const generatedPdfFileName = `izin-formu-${newLeaveRequest.id}.pdf`;
    const generatedPdfPath = path.join(FORMS_DIR, generatedPdfFileName);
    await fs.writeFile(generatedPdfPath, pdfBuffer);

    const generatedFormRelativePath = `leave_forms/${generatedPdfFileName}`;

    await prisma.leaveRequest.update({
      where: { id: newLeaveRequest.id },
      data: {
        generatedFormUrl: generatedFormRelativePath,
      },
    });

    return new Response(new Uint8Array(pdfBuffer), {
      headers: { "Content-Type": "application/pdf" },
      status: 200,
    });
  } catch (error) {
    console.error("[API][POST] /api/leave", error);
    const errorMessage =
      error instanceof Error ? error.message : "Bilinmeyen sunucu hatası";
    return NextResponse.json(
      { error: "Sunucu hatası: " + errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }
    const leaves = await prisma.leaveRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    return NextResponse.json(leaves);
  } catch (error) {
    console.error("[API][GET] /api/leave", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
