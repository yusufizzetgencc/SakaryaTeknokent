// src/app/api/admin/roles/[roleId]/permissions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface PermissionUpdateBody {
  permissionIds: string[];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;

  if (!roleId) {
    return NextResponse.json(
      { error: "roleId parametresi zorunludur." },
      { status: 400 }
    );
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      return NextResponse.json({ error: "Rol bulunamadı." }, { status: 404 });
    }

    const permissions = role.rolePermissions.map((rp) => rp.permission);

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Rol yetkileri alınırken hata:", error);
    return NextResponse.json(
      { error: "Rol yetkileri alınamadı." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;

  try {
    const body: PermissionUpdateBody = await req.json();

    if (
      !body.permissionIds ||
      !Array.isArray(body.permissionIds) ||
      !body.permissionIds.every((id) => typeof id === "string")
    ) {
      return NextResponse.json(
        { error: "Yetki listesi geçersiz veya izin verilen formatta değil." },
        { status: 400 }
      );
    }

    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    if (body.permissionIds.length > 0) {
      const createData = body.permissionIds
        .filter((id) => id != null)
        .map((id) => ({
          roleId,
          permissionId: id,
        }));

      await prisma.rolePermission.createMany({
        data: createData,
        skipDuplicates: true,
      });
    }

    const updatedRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });

    if (!updatedRole) {
      return NextResponse.json({ error: "Rol bulunamadı." }, { status: 404 });
    }

    const updatedPermissions = updatedRole.rolePermissions.map(
      (rp) => rp.permission
    );

    return NextResponse.json({
      message: "Yetkiler başarıyla güncellendi.",
      permissions: updatedPermissions,
    });
  } catch (error) {
    console.error("[PUT /api/admin/roles/[roleId]/permissions] Error:", error);
    return NextResponse.json(
      { error: "Yetkiler güncellenemedi." },
      { status: 500 }
    );
  }
}
