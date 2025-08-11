// app/dashboard/admin/users/AdminUsersClient.tsx

"use client";

import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import { toast, Toaster } from "sonner";
import {
  FiTrash2,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
} from "react-icons/fi";

// Interface'ler
interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  approved: boolean;
  role?: {
    name: string;
    description?: string | null;
  } | null;
}

interface AdminUsersClientProps {
  initialUsers: User[];
}

const roleTurkishNames: Record<string, string> = {
  admin: "Genel Müdür",
  assistant: "Genel Müdür Yardımcısı",
  manager: "Yönetici",
  employee: "Çalışan",
};

export default function AdminUsersClient({
  initialUsers,
}: AdminUsersClientProps) {
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState<"firstName" | "email">("firstName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredSortedUsers = useMemo(() => {
    let filtered = users;
    if (filterName.trim())
      filtered = filtered.filter((u) =>
        `${u.firstName} ${u.lastName}`
          .toLowerCase()
          .includes(filterName.trim().toLowerCase())
      );
    if (filterEmail.trim())
      filtered = filtered.filter((u) =>
        u.email.toLowerCase().includes(filterEmail.trim().toLowerCase())
      );
    if (filterRole.trim())
      filtered = filtered.filter((u) =>
        (roleTurkishNames[u.role?.name ?? ""] ?? u.role?.description ?? "")
          .toLowerCase()
          .includes(filterRole.trim().toLowerCase())
      );
    if (filterStatus)
      filtered = filtered.filter((u) =>
        filterStatus === "approved" ? u.approved : !u.approved
      );
    filtered.sort((a, b) => {
      const aVal =
        sortBy === "firstName"
          ? a.firstName.toLowerCase()
          : a.email.toLowerCase();
      const bVal =
        sortBy === "firstName"
          ? b.firstName.toLowerCase()
          : b.email.toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [
    users,
    filterName,
    filterEmail,
    filterRole,
    filterStatus,
    sortBy,
    sortOrder,
  ]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu kullanıcı kalıcı olarak silinecektir!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, Sil!",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#4b5563",
    });
    if (!result.isConfirmed) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Silme işlemi başarısız oldu.");
      }
      setUsers(users.filter((user) => user.id !== id));
      toast.success("Kullanıcı başarıyla silindi.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoadingId(null);
    }
  };
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 sm:p-4">
        {/* Filtre ve Sıralama */}
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
            <FiFilter />
            Filtrele ve Sırala
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Ad Soyad ile ara..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className={inputBaseClasses}
            />
            <input
              type="text"
              placeholder="Email ile ara..."
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className={inputBaseClasses}
            />
            <input
              type="text"
              placeholder="Rol ile ara..."
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className={inputBaseClasses}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`${inputBaseClasses} appearance-none`}
            >
              <option value="">Tüm Durumlar</option>
              <option value="approved">Onaylı</option>
              <option value="pending">Beklemede</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "firstName" | "email")
              }
              className={`${inputBaseClasses} w-auto appearance-none`}
            >
              <option value="firstName">İsme Göre Sırala</option>
              <option value="email">Email&apos;e Göre Sırala</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className={`${inputBaseClasses} w-auto appearance-none`}
            >
              <option value="asc">Artan (A-Z)</option>
              <option value="desc">Azalan (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Kullanıcı Tablosu */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300 min-w-[1000px]">
            <thead className="text-xs text-white/70 uppercase bg-white/5">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Ad Soyad
                </th>
                <th scope="col" className="px-6 py-3">
                  Kullanıcı Adı
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Rol
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Onay
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-white/60">
                    Filtrelerle eşleşen kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredSortedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/10 hover:bg-white/10 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4">{user.username}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      {roleTurkishNames[user.role?.name ?? ""] ??
                        user.role?.description ??
                        "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.approved ? (
                        <FiCheckCircle
                          className="mx-auto h-5 w-5 text-green-400"
                          title="Onaylı"
                        />
                      ) : (
                        <FiXCircle
                          className="mx-auto h-5 w-5 text-yellow-400"
                          title="Onay Bekliyor"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        disabled={loadingId === user.id}
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors disabled:opacity-50"
                        title="Kullanıcıyı Sil"
                      >
                        {loadingId === user.id ? (
                          <FiLoader className="animate-spin" />
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
