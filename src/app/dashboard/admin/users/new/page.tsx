"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import {
  FiUserPlus,
  FiUser,
  FiMail,
  FiLock,
  FiShield,
  FiLoader,
} from "react-icons/fi";

// Interface'ler
interface Role {
  id: string;
  name: string;
  description?: string;
}

export default function NewUserPage() {
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    roleId: "",
    approved: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const rolesRes = await fetch("/api/admin/roles");
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
      } catch {
        toast.error("Roller yüklenirken bir hata oluştu.");
      }
    }
    fetchData();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await Swal.fire({
          icon: "success",
          title: "Başarılı!",
          text: "Kullanıcı başarıyla eklendi.",
          background: "#1a1a1a",
          color: "#ffffff",
          confirmButtonColor: "#3b82f6",
          timer: 2000,
          showConfirmButton: false,
        });
        router.push("/dashboard/admin/users");
      } else {
        const data = await res.json();
        toast.error("Hata: " + (data.error || "Bir şeyler yanlış gitti."));
      }
    } catch {
      toast.error("Kullanıcı eklenirken bir sunucu hatası oluştu.");
    }
    setLoading(false);
  }
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";
  const labelBaseClasses = "relative";
  const iconBaseClasses =
    "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500";

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="w-full max-w-lg"
        >
          <h1 className="text-4xl font-bold mb-10 text-center text-white tracking-tight flex items-center justify-center gap-4">
            <FiUserPlus size={32} /> Yeni Kullanıcı Ekle
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className={labelBaseClasses}>
                <FiUser className={iconBaseClasses} />
                <input
                  name="firstName"
                  placeholder="Ad*"
                  className={inputBaseClasses}
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={labelBaseClasses}>
                <FiUser className={iconBaseClasses} />
                <input
                  name="lastName"
                  placeholder="Soyad*"
                  className={inputBaseClasses}
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className={labelBaseClasses}>
              <FiUser className={iconBaseClasses} />
              <input
                name="username"
                placeholder="Kullanıcı Adı*"
                className={inputBaseClasses}
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className={labelBaseClasses}>
              <FiMail className={iconBaseClasses} />
              <input
                type="email"
                name="email"
                placeholder="E-posta*"
                className={inputBaseClasses}
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={labelBaseClasses}>
              <FiLock className={iconBaseClasses} />
              <input
                type="password"
                name="password"
                placeholder="Şifre*"
                className={inputBaseClasses}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className={labelBaseClasses}>
              <FiShield className={iconBaseClasses} />
              <select
                name="roleId"
                value={form.roleId}
                onChange={handleChange}
                required
                className={`${inputBaseClasses} appearance-none`}
              >
                <option value="">Rol Seçiniz*</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.description || role.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center space-x-3 text-white/80 cursor-pointer">
              <input
                type="checkbox"
                name="approved"
                checked={form.approved}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 bg-transparent border-gray-600 rounded text-blue-500 focus:ring-blue-500"
              />
              <span>Hesap Direkt Onaylansın</span>
            </label>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full flex items-center justify-center mt-4 bg-blue-600 text-white py-3.5 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FiLoader className="mr-2 animate-spin" /> Kaydediliyor...
                </>
              ) : (
                <>Kullanıcıyı Kaydet</>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </>
  );
}
