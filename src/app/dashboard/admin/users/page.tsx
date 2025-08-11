// app/dashboard/admin/users/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminUsersClient from "./AdminUsersClient";
import { FiUsers, FiPlus } from "react-icons/fi";

// Interface'ler sunucu ve istemci arasında tutarlı olmalı
interface Role {
  id: string;
  name: string;
  description?: string | null;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  approved: boolean;
  role?: Role | null;
}

export default async function AdminUsersPage() {
  const users: User[] = await prisma.user.findMany({
    include: {
      role: true,
    },
  });

  return (
    // Ana sayfa düzeni koyu tema ile güncellendi
    <main className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-4">
            <FiUsers size={32} />
            Kullanıcı Yönetimi
          </h1>
          <Link
            href="/dashboard/admin/users/new"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20"
          >
            <FiPlus />
            Yeni Kullanıcı Ekle
          </Link>
        </div>

        {/* Client bileşenine başlangıç verilerini props olarak geçiyoruz */}
        <AdminUsersClient initialUsers={users} />
      </div>
    </main>
  );
}
