import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });

    // İstersen izinleri kolay erişim için key dizisi yapabilirsin:
    const rolesWithPermissions = roles.map((role) => ({
      ...role,
      permissions: role.rolePermissions.map((rp) => rp.permission),
    }));

    return NextResponse.json(rolesWithPermissions);
  } catch (error) {
    console.error("[GET /api/admin/roles] Error fetching roles:", error);
    return NextResponse.json(
      { error: "Roller alınırken hata oluştu." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Rol ismi zorunludur." },
        { status: 400 }
      );
    }

    // Aynı isimde rol var mı kontrol et
    const existingRole = await prisma.role.findUnique({ where: { name } });
    if (existingRole) {
      return NextResponse.json(
        { error: "Bu isimde bir rol zaten mevcut." },
        { status: 409 }
      );
    }

    // Yeni rol oluştur
    const newRole = await prisma.role.create({
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/roles] Error creating role:", error);
    return NextResponse.json(
      { error: "Rol oluşturulurken hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Rol ID zorunludur." },
        { status: 400 }
      );
    }
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Rol ismi zorunludur." },
        { status: 400 }
      );
    }

    // Aynı isimde farklı bir rol var mı kontrol et
    const existingRole = await prisma.role.findFirst({
      where: { name, NOT: { id } },
    });
    if (existingRole) {
      return NextResponse.json(
        { error: "Bu isimde başka bir rol zaten mevcut." },
        { status: 409 }
      );
    }

    // Rolü güncelle
    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error("[PUT /api/admin/roles] Error updating role:", error);
    return NextResponse.json(
      { error: "Rol güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Rol ID belirtilmeli." },
        { status: 400 }
      );
    }

    // Önce rolün varlığını kontrol et
    const existingRole = await prisma.role.findUnique({ where: { id } });
    if (!existingRole) {
      return NextResponse.json({ error: "Rol bulunamadı." }, { status: 404 });
    }

    // Rolü sil
    await prisma.role.delete({ where: { id } });

    return NextResponse.json({ message: "Rol başarıyla silindi." });
  } catch (error) {
    console.error("[DELETE /api/admin/roles] Error deleting role:", error);
    return NextResponse.json(
      { error: "Rol silinirken hata oluştu." },
      { status: 500 }
    );
  }
}
