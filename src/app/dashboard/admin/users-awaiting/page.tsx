"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import {
  FiUserCheck,
  FiUser,
  FiMail,
  FiShield,
  FiCheck,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

// Interface'ler
interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role?: { id: string; name: string; description?: string } | null;
  approved: boolean;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

// Framer Motion için animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100 },
  },
};

export default function PendingUsersPage() {
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [usersRes, rolesRes] = await Promise.all([
          fetch("/api/admin/users-awaiting?approved=false"),
          fetch("/api/admin/roles"),
        ]);
        if (usersRes.ok) setUsers(await usersRes.json());
        else toast.error("Onay bekleyen kullanıcılar yüklenemedi.");
        if (rolesRes.ok) setRoles(await rolesRes.json());
        else toast.error("Roller yüklenemedi.");
      } catch {
        toast.error("Veriler alınırken bir sunucu hatası oluştu.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handleRoleChange(userId: string, value: string) {
    setSelectedRoles((prev) => ({ ...prev, [userId]: value }));
  }

  async function handleApprove(userId: string, roleId: string) {
    if (!roleId) {
      toast.error("Onaylamadan önce lütfen bir rol seçin.");
      return;
    }
    setLoadingIds((prev) => [...prev, userId]);
    try {
      const res = await fetch(`/api/admin/users-awaiting/${userId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      });
      if (res.ok) {
        await Swal.fire({
          icon: "success",
          title: "Onaylandı!",
          text: "Kullanıcı başarıyla onaylandı ve sisteme dahil edildi.",
          background: "#1a1a1a",
          color: "#ffffff",
          confirmButtonColor: "#22c55e",
          timer: 2000,
          showConfirmButton: false,
        });
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } else {
        const data = await res.json();
        toast.error(
          "Hata: " + (data.error || "Onaylama işlemi başarısız oldu.")
        );
      }
    } catch {
      toast.error("Sunucu hatası oluştu.");
    }
    setLoadingIds((prev) => prev.filter((id) => id !== userId));
  }
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="w-10 h-10 animate-spin text-white" />
          <p className="text-white/60 text-lg">Veriler Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-10 text-white tracking-tight flex items-center gap-4"
          >
            <FiUserCheck size={32} /> Onay Bekleyen Kullanıcılar
          </motion.h1>

          {users.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white/5 border border-white/10 rounded-2xl">
              <FiAlertCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white/70 text-lg">
                Onay bekleyen kullanıcı bulunmamaktadır.
              </p>
            </div>
          ) : (
            <motion.ul
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {users.map((user) => (
                <motion.li
                  key={user.id}
                  variants={itemVariants}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-5">
                    {/* Kullanıcı Bilgileri */}
                    <div className="flex-grow">
                      <h2 className="text-xl font-semibold text-white">
                        {user.firstName} {user.lastName}
                      </h2>
                      <div className="mt-2 space-y-1 text-sm text-white/70">
                        <p className="flex items-center gap-2">
                          <FiUser />
                          <span>{user.username}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <FiMail />
                          <span>{user.email}</span>
                        </p>
                      </div>
                    </div>
                    {/* Eylem Alanı */}
                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch gap-3 flex-shrink-0">
                      <div className="relative flex-grow">
                        <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                          value={selectedRoles[user.id] || ""}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          className={`${inputBaseClasses} appearance-none pl-10 w-full`}
                        >
                          <option value="">Rol Seçiniz*</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.description || role.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <motion.button
                        onClick={() =>
                          handleApprove(user.id, selectedRoles[user.id] || "")
                        }
                        disabled={loadingIds.includes(user.id)}
                        whileHover={
                          !loadingIds.includes(user.id) ? { scale: 1.05 } : {}
                        }
                        whileTap={
                          !loadingIds.includes(user.id) ? { scale: 0.95 } : {}
                        }
                        className="flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-5 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
                      >
                        {loadingIds.includes(user.id) ? (
                          <FiLoader className="animate-spin" />
                        ) : (
                          <FiCheck />
                        )}{" "}
                        Onayla
                      </motion.button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </>
  );
}
