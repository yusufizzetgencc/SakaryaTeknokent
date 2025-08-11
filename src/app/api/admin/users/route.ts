import { NextResponse, NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get("roleId");

    if (!roleId) {
      return NextResponse.json(
        { error: "roleId query parametresi zorunludur." },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: { roleId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[USER_LIST_ERROR]", error);
    return NextResponse.json(
      { error: "Kullanıcılar alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, username, email, password, roleId, approved } =
      body;

    // Validation
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !username?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !roleId?.trim()
    ) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur ve boş olmamalıdır." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçersiz e-posta formatı." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() },
          { username: username.trim() },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email veya kullanıcı adı zaten kayıtlı." },
        { status: 409 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await hash(password, 10);

    // Rolün permissions'larını ara tablodan çek (id listesi)
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: roleId.trim() },
      select: { permissionId: true },
    });

    // Kullanıcı oluştur
    const newUser = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        roleId: roleId.trim(),
        approved: typeof approved === "boolean" ? approved : false,
      },
    });

    // Kullanıcının permissions ilişkisini ara tabloya ekle
    if (rolePermissions.length > 0) {
      const userPermissionCreates = rolePermissions.map((rp) => ({
        userId: newUser.id,
        permissionId: rp.permissionId,
      }));

      await prisma.userPermission.createMany({
        data: userPermissionCreates,
        skipDuplicates: true,
      });
    }

    // Parolayı gizle
    const { password: _password, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("[USER_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Sunucu hatası, kullanıcı oluşturulamadı." },
      { status: 500 }
    );
  }
}
