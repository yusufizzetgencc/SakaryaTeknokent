// src/app/api/user/update/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Yetkisiz", success: false },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, username, email, newPassword } = body;

    if (!firstName || !lastName || !username || !email) {
      return NextResponse.json(
        { message: "Zorunlu alanlar eksik", success: false },
        { status: 400 }
      );
    }

    let hashedPassword;
    if (newPassword && newPassword.trim() !== "") {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { message: "Şifre en az 6 karakter olmalı", success: false },
          { status: 400 }
        );
      }
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        firstName,
        lastName,
        username,
        email,
        ...(hashedPassword ? { password: hashedPassword } : {}),
      },
    });

    return NextResponse.json({
      message: "Kullanıcı başarıyla güncellendi",
      success: true,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("Kullanıcı güncelleme hatası:", error);
    return NextResponse.json(
      { message: "Sunucu hatası oluştu", success: false },
      { status: 500 }
    );
  }
}
