import fs from "fs";
import path from "path";
import { fillPdfFromTemplate } from "@/lib/fillPdfFromTemplate";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    console.log("[generate-pdf] Gelen Veri:", data);

    // NextAuth session'dan kullanıcı bilgisi al
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new Response("Kullanıcı oturumu bulunamadı", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { firstName: true, lastName: true },
    });

    if (!user) {
      return new Response("Kullanıcı bulunamadı", { status: 404 });
    }

    const templatePath = path.join(
      process.cwd(),
      "public",
      "templates",
      "izin-formu.pdf"
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`PDF şablonu bulunamadı: ${templatePath}`);
    }

    const customFontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "OpenSans-Regular.ttf"
    );
    if (!fs.existsSync(customFontPath)) {
      throw new Error(`Font dosyası bulunamadı: ${customFontPath}`);
    }

    const leaveData = {
      contactInfo: String(data.contactInfo ?? "").trim(),
      unit: String(data.unit ?? "").trim(),
      leaveType: String(data.leaveType ?? "")
        .trim()
        .toUpperCase(),
      startDate: new Date(data.startDateTime).toISOString(),
      endDate: new Date(data.endDateTime).toISOString(),
      duration: String(data.duration ?? "").trim(),
      explanation: String(data.explanation ?? "").trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
    };

    const pdfBuffer = await fillPdfFromTemplate(leaveData);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf; charset=utf-8",
        "Content-Disposition": "attachment; filename=izin-formu.pdf",
      },
    });
  } catch (error: unknown) {
    const err =
      error instanceof Error ? error : new Error("Bilinmeyen hata oluştu");
    console.error("[GENERATE_PDF]", err);
    return new Response(`PDF oluşturulamadı: ${err.message}`, {
      status: 500,
    });
  }
}
