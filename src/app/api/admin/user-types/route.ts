// src/app/api/admin/user-types/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" }, // isteğe bağlı sıralama
    });
    return NextResponse.json(roles);
  } catch (error) {
    console.error("[GET /api/admin/roles] Error fetching roles:", error);
    return NextResponse.json(
      { error: "Roller alınırken hata oluştu." },
      { status: 500 }
    );
  }
}
