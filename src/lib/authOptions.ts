import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

// User tipini genişletme
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string | null; // role string olarak
    approved: boolean;
    permissions?: string[]; // string[] tipinde, sadece key dizisi
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string | null;
      approved: boolean;
      permissions?: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string | null;
    approved: boolean;
    permissions?: string[];
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};

        if (!email || !password) {
          throw new Error("Kullanıcı adı/e-posta ve şifre zorunludur.");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: email.toLowerCase() }, { username: email }],
          },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
            userPermissions: {
              include: {
                permission: true,
              },
            },
          },
        });

        if (!user || !user.password) {
          throw new Error("Kullanıcı bulunamadı.");
        }

        const isValid = await compare(password, user.password);
        if (!isValid) {
          throw new Error("Şifre hatalı.");
        }

        if (!user.approved) {
          throw new Error("Hesabınız henüz onaylanmadı.");
        }

        // Rolün permissions ve kullanıcının bireysel permissions'ını birleştir
        const rolePermissions =
          user.role?.rolePermissions?.map((rp) => rp.permission.key) || [];
        const userPermissions =
          user.userPermissions?.map((up) => up.permission.key) || [];
        const combinedPermissions = Array.from(
          new Set([...rolePermissions, ...userPermissions])
        );

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role?.name || null,
          approved: user.approved,
          permissions: combinedPermissions,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          role: null,
          approved: false,
          permissions: [],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || null;
        token.approved = user.approved;
        token.permissions = user.permissions || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.approved = token.approved;
        session.user.permissions = token.permissions || [];
      }
      return session;
    },
  },
};
