import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(permissions);
  } catch (error) {
    console.error("[GET /api/admin/permissions] Error:", error);
    return NextResponse.json(
      { error: "Yetkiler alınırken hata oluştu." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, name } = body;

    if (!key || !name || typeof key !== "string" || typeof name !== "string") {
      return NextResponse.json(
        {
          error:
            "Yetki anahtarı (key) ve ismi (name) zorunludur ve string olmalıdır.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.permission.findUnique({ where: { key } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu anahtara sahip bir yetki zaten mevcut." },
        { status: 409 }
      );
    }

    const newPermission = await prisma.permission.create({
      data: { key, name },
    });

    return NextResponse.json(newPermission, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/permissions] Error:", error);
    return NextResponse.json(
      { error: "Yetki oluşturulurken sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
