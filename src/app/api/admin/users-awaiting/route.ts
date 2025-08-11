// src/app/api/admin/users-awaiting/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const approved = url.searchParams.get("approved");

    const where = approved === "false" ? { approved: false } : {};

    const users = await prisma.user.findMany({
      where,
      include: { role: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[GET /api/admin/users-awaiting] Error:", error);
    return NextResponse.json(
      { error: "Kullanıcılar alınamadı." },
      { status: 500 }
    );
  }
}
