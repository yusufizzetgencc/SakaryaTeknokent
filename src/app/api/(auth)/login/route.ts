import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Kullanıcı adı/e-posta ve şifre gereklidir." },
        { status: 400 }
      );
    }

    // Kullanıcı adı veya e-posta ile kullanıcıyı bul
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 401 }
      );
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
    }

    if (!user.approved) {
      return NextResponse.json(
        { error: "Hesabınız henüz onaylanmadı.", approved: false },
        { status: 403 }
      );
    }

    // Başarılıysa kullanıcıyı ve onay bilgisini döndür
    return NextResponse.json(
      {
        message: "Giriş başarılı",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: `${user.firstName} ${user.lastName}`,
          approved: user.approved,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
