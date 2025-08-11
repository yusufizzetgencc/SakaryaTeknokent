import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, username, email, password, roleId, approved } =
      await req.json();

    // Basic validation for required fields
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !roleId
    ) {
      return NextResponse.json(
        { error: "Tüm alanları doldurun." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçersiz e-posta formatı." },
        { status: 400 }
      );
    }

    // Check if user with same email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email veya kullanıcı adı zaten kayıtlı." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Ensure 'approved' is boolean, default to false if undefined
    const isApproved = typeof approved === "boolean" ? approved : false;

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        roleId,
        approved: isApproved,
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("[USER_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
