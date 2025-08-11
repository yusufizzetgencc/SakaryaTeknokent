import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Giriş yapılmamış kullanıcılar erişebilir
const PUBLIC_PATHS = ["/login", "/register", "/onay-bekleniyor", "/api/auth"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Giriş yoksa ve sayfa public değilse login'e gönder
  if (!token) {
    const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
    return isPublic
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", req.url));
  }

  // Token varsa ama approved false ise (zorunlu değil, ama ekstra güvenlik)
  if (token && token.approved === false) {
    if (!pathname.startsWith("/onay-bekleniyor")) {
      return NextResponse.redirect(new URL("/onay-bekleniyor", req.url));
    }
    return NextResponse.next();
  }

  // Girişli ve onaylı kullanıcı izinli
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|images|fonts).*)"],
};
