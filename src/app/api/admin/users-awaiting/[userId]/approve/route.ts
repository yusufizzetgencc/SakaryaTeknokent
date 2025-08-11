// src/app/api/admin/users-awaiting/[userId]/approve/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { roleId } = await req.json();

    if (!roleId) {
      return NextResponse.json({ error: "Rol seçilmedi." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // Güncelle: roleId ve approved
    await prisma.user.update({
      where: { id: userId },
      data: {
        roleId,
        approved: true,
      },
    });

    return NextResponse.json({ message: "Kullanıcı onaylandı." });
  } catch (error) {
    console.error(
      "[POST /api/admin/users-awaiting/[userId]/approve] Error:",
      error
    );
    return NextResponse.json({ error: "Onaylama başarısız." }, { status: 500 });
  }
}
