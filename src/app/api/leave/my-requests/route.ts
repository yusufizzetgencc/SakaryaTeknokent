import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params;

    if (!roleId) {
      return NextResponse.json(
        { error: "roleId parametresi zorunludur." },
        { status: 400 }
      );
    }

    // Role permissions'ları getir
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
      },
    });

    const permissions = rolePermissions.map((rp) => rp.permission);

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("[ROLE_PERMISSIONS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Role permissions alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params;
    const body = await req.json();
    const { permissionIds } = body;

    if (!roleId) {
      return NextResponse.json(
        { error: "roleId parametresi zorunludur." },
        { status: 400 }
      );
    }

    if (!Array.isArray(permissionIds)) {
      return NextResponse.json(
        { error: "permissionIds array olmalıdır." },
        { status: 400 }
      );
    }

    // Önce mevcut role permissions'ları sil
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Yeni permissions'ları ekle
    if (permissionIds.length > 0) {
      const rolePermissionData = permissionIds.map((permissionId: string) => ({
        roleId,
        permissionId,
      }));

      await prisma.rolePermission.createMany({
        data: rolePermissionData,
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      message: "Role permissions başarıyla güncellendi.",
    });
  } catch (error) {
    console.error("[ROLE_PERMISSIONS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Role permissions güncellenemedi." },
      { status: 500 }
    );
  }
}
