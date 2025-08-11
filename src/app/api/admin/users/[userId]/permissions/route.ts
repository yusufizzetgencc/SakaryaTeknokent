// src/app/api/admin/users/[userId]/permissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: { userId: string } }
) {
  const { params } = await context;
  const userId = params.userId;

  if (!userId) {
    return NextResponse.json(
      { error: "userId parametresi zorunludur." },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userPermissions: { include: { permission: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    const permissions = user.userPermissions.map((up) => ({
      id: up.permission.id,
      key: up.permission.key,
      name: up.permission.name,
    }));

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Kullanıcı izinleri alınırken hata:", error);
    return NextResponse.json(
      { error: "Kullanıcı izinleri alınamadı." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const { params } = context;
  const userId = params.userId;

  try {
    const { permissionIds } = await request.json();

    if (!Array.isArray(permissionIds)) {
      return NextResponse.json(
        { error: "Yetki listesi geçersiz." },
        { status: 400 }
      );
    }

    const validPermissionIds = permissionIds.filter(
      (id) => id != null && id !== ""
    );

    await prisma.userPermission.deleteMany({
      where: { userId },
    });

    if (validPermissionIds.length > 0) {
      const createData = validPermissionIds.map((id: string) => ({
        userId,
        permissionId: id,
      }));

      await prisma.userPermission.createMany({
        data: createData,
        skipDuplicates: true,
      });
    }

    const updatedUserPermissions = await prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });

    const updatedPermissions = updatedUserPermissions.map((up) => ({
      id: up.permission.id,
      key: up.permission.key,
      name: up.permission.name,
    }));

    return NextResponse.json({
      message: "Yetkiler başarıyla güncellendi.",
      permissions: updatedPermissions,
    });
  } catch (error) {
    console.error("[PUT /api/admin/users/[userId]/permissions] Error:", error);
    return NextResponse.json(
      { error: "Yetkiler güncellenemedi." },
      { status: 500 }
    );
  }
}
