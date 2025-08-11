import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import SidebarClient from "./SidebarClient";
import { Toaster } from "sonner";

interface Permission {
  key: string;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- SUNUCU TARAFI MANTIĞI DEĞİŞTİRİLMEDİ ---
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user && session.user.approved === false)
    redirect("/onay-bekleniyor");

  const rawPermissions =
    (session.user?.permissions as Permission[] | undefined) ?? [];

  const permissions: string[] = rawPermissions.map((p) => p.key);
  // --- SUNUCU TARAFI MANTIĞI DEĞİŞTİRİLMEDİ ---

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar'da bir değişiklik yapılmadı */}
      <SidebarClient session={session} permissions={permissions} />

      {/* Ana içerik alanı, standartlaştırılmış arka plan stili ile güncellendi */}
      <main
        className="
          flex-grow min-h-screen from-black via-gray-900 to-black
          bg-gradient-to-b 
          relative
          before:absolute before:inset-0
          before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-white/5
          before:backdrop-blur-xl before:-z-10
        "
      >
        {children}

        {/* Toaster, diğer sayfalarla tutarlı olması için dark theme ile güncellendi */}
        <Toaster position="top-right" richColors theme="dark" />
      </main>
    </div>
  );
}
