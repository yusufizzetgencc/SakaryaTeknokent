"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiSettings,
  FiLogOut,
  FiClipboard,
  FiShoppingCart,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import {
  HiOutlineClipboardList,
  HiOutlineShoppingCart,
  HiOutlineUser,
  HiOutlineSparkles,
} from "react-icons/hi";

type StatsData = {
  totalLeaveRequests: number;
  totalPurchaseRequests: number;
  activeProjectsCount: number;
};

export default function DashboardClient() {
  const { data: session, status } = useSession();

  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userName = session?.user?.name || session?.user?.email || "Kullanıcı";
  const userEmail = session?.user?.email || "";
  const userApproved = session?.user?.approved;

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) throw new Error("İstatistikler alınamadı.");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (status === "loading" || loading)
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full"
          />
          <p className="text-white/60 text-lg font-medium">Yükleniyor...</p>
        </div>
      </div>
    );

  if (!session)
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">
            Giriş yapmanız gerekiyor.
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">Hata: {error}</p>
        </div>
      </div>
    );

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Hoş Geldiniz Bölümü */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col sm:flex-row items-center gap-6 sm:gap-8"
        >
          {/* Kullanıcı Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/20 
                     bg-gradient-to-br from-white/20 to-gray-300/20 backdrop-blur-sm
                     flex items-center justify-center text-white font-bold text-4xl 
                     select-none shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            {userName.charAt(0).toUpperCase()}
          </motion.div>

          {/* Selamlama */}
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2"
            >
              Hoş Geldiniz,{" "}
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {userName}
              </span>
              !
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-white/70 max-w-2xl font-medium"
            >
              Kontrol panelinizde hızlıca işlemlerinizi yönetebilir ve sistem
              durumunu takip edebilirsiniz.
            </motion.p>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="flex items-center space-x-2 mt-4"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/60 text-sm">Sistem Aktif</span>
            </motion.div>
          </div>
        </motion.section>

        {/* İstatistik Kartları */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Toplam İzin Talepleri",
              value: stats?.totalLeaveRequests ?? 0,
              icon: <HiOutlineClipboardList size={28} />,
              gradient: "from-blue-500/20 to-cyan-500/20",
              iconBg: "bg-blue-500/20",
              delay: 0.1,
            },
            {
              title: "Satın Alma Talepleri",
              value: stats?.totalPurchaseRequests ?? 0,
              icon: <HiOutlineShoppingCart size={28} />,
              gradient: "from-purple-500/20 to-pink-500/20",
              iconBg: "bg-purple-500/20",
              delay: 0.2,
            },
            {
              title: "Aktif Projeler",
              value: stats?.activeProjectsCount ?? 0,
              icon: <HiOutlineSparkles size={28} />,
              gradient: "from-emerald-500/20 to-teal-500/20",
              iconBg: "bg-emerald-500/20",
              delay: 0.3,
            },
          ].map((stat) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-sm border border-white/10 
                        rounded-2xl p-6 shadow-2xl hover:border-white/20 transition-all duration-300
                        cursor-pointer group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center
                              group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="text-white">{stat.icon}</span>
                </div>
                <FiTrendingUp className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
              </div>

              <div>
                <p className="text-white/70 text-sm font-medium mb-2">
                  {stat.title}
                </p>
                <p className="text-4xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Profil Durumu */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <HiOutlineUser className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    Profil Durumu
                  </h3>
                  <p className="text-white/60 text-sm">{userEmail}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {userApproved ? (
                  <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30">
                    <FiCheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">
                      Onaylandı
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/30">
                    <FiClock className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">
                      Onay Bekleniyor
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Hızlı İşlemler */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {[
            {
              title: "İzin Talepleri",
              description: "İzin taleplerinizi görüntüleyin ve yönetin",
              icon: <FiClipboard size={24} />,
              href: "/dashboard/leave/my-requests",
              gradient: "from-indigo-500/20 to-blue-500/20",
              delay: 0.5,
            },
            {
              title: "Satın Alma Talepleri",
              description: "Satın alma süreçlerinizi kolayca takip edin",
              icon: <FiShoppingCart size={24} />,
              href: "/dashboard/purchase-requests",
              gradient: "from-violet-500/20 to-purple-500/20",
              delay: 0.6,
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br ${item.gradient} backdrop-blur-sm border border-white/10 
                        rounded-2xl p-8 shadow-2xl hover:border-white/20 transition-all duration-300 
                        group cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center
                              group-hover:bg-white/20 transition-colors duration-300"
                >
                  <span className="text-white">{item.icon}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-white text-xl font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-white/70">{item.description}</p>
              </div>

              <Link
                href={item.href}
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 
                         text-white px-6 py-3 rounded-lg transition-all duration-300
                         border border-white/20 hover:border-white/30 font-medium"
              >
                <span>Görüntüle</span>
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  →
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </section>

        {/* Hesap Ayarları ve Çıkış */}
        <section className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/account"
              className="inline-flex items-center space-x-3 bg-white/10 hover:bg-white/20 
                       text-white px-8 py-4 rounded-xl transition-all duration-300
                       border border-white/20 hover:border-white/30 font-medium
                       backdrop-blur-sm shadow-lg"
            >
              <FiSettings size={20} />
              <span>Hesap Ayarları</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center space-x-3 bg-red-500/20 hover:bg-red-500/30 
                       text-red-300 hover:text-red-200 px-8 py-4 rounded-xl transition-all duration-300
                       border border-red-500/30 hover:border-red-500/40 font-medium
                       backdrop-blur-sm shadow-lg"
            >
              <FiLogOut size={20} />
              <span>Oturumu Kapat</span>
            </button>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
