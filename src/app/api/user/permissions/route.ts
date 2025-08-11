// src/app/api/user/permissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Kullanıcı giriş yapmamış." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const userPermissions = await prisma.userPermission.findMany({
      where: { userId },
      select: {
        permission: {
          select: {
            key: true,
            name: true,
            id: true,
          },
        },
      },
    });

    const permissions = userPermissions.map((up) => up.permission);

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("[GET /api/user/permissions] Error:", error);
    return NextResponse.json(
      { error: "İzinler alınırken hata oluştu." },
      { status: 500 }
    );
  }
}
