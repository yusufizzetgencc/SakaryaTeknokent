"use client";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { motion, Variants } from "framer-motion";
import {
  FiGitMerge,
  FiFileText,
  FiStar,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiBox,
  FiTruck,
} from "react-icons/fi";

// Interface'ler
interface RequestStage {
  id: string;
  malzeme: string;
  birim: string;
  miktar: number;
  stage: number;
  stageLabel: string;
  status: string;
  user: { firstName: string; lastName: string };
  hasApprovedInvoice: boolean;
  hasRatedSupplier: boolean;
  productDelivered: boolean;
}

// Framer Motion için animasyon varyantları (tip uyumlu)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100 },
  },
};

export default function RequestStagesPage() {
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---
  const [requests, setRequests] = useState<RequestStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    pendingInvoiceCount: 0,
    pendingRatingCount: 0,
  });

  useEffect(() => {
    fetchStages();
  }, []);

  async function fetchStages() {
    setLoading(true);
    try {
      const res = await fetch("/api/purchase-request/stages");
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
        setNotifications(data.notifications);
      } else {
        toast.error("Aşama bilgileri yüklenemedi.");
      }
    } catch {
      toast.error("Sunucu ile bağlantı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="w-10 h-10 animate-spin text-white" />
          <p className="text-white/60 text-lg">Aşama Bilgileri Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-8 text-white tracking-tight flex items-center gap-4"
          >
            <FiGitMerge size={32} />
            Taleplerin Aşamaları
          </motion.h1>

          {/* Bildirimler */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
          >
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {notifications.pendingInvoiceCount}
                </p>
                <p className="text-sm text-yellow-300/80">
                  Onay Bekleyen Fatura
                </p>
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <FiStar className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {notifications.pendingRatingCount}
                </p>
                <p className="text-sm text-blue-300/80">
                  Değerlendirme Bekleyen Tedarikçi
                </p>
              </div>
            </div>
          </motion.div>

          {/* Talepler Listesi */}
          {requests.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white/5 border border-white/10 rounded-2xl">
              <FiAlertCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white/70 text-lg">
                Takip edilecek bir talep bulunmamaktadır.
              </p>
            </div>
          ) : (
            <motion.ul
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {requests.map((req) => (
                <motion.li
                  key={req.id}
                  variants={itemVariants}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg space-y-5"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                        <FiBox /> {req.malzeme} ({req.miktar} {req.birim})
                      </h2>
                      <p className="text-sm text-white/70 mt-1">
                        Talep Eden: {req.user.firstName} {req.user.lastName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-sm font-semibold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full">
                        {req.stageLabel}
                      </div>
                      <div
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          req.status === "Reddedildi"
                            ? "bg-red-500/20 text-red-300"
                            : req.status === "Onaylandı"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {req.status}
                      </div>
                    </div>
                  </div>

                  {/* İlerleme Çubukları */}
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <ProgressItem
                      label="Fatura Onayı"
                      isDone={req.hasApprovedInvoice}
                    />
                    <ProgressItem
                      label="Tedarikçi Değerlendirmesi"
                      isDone={req.hasRatedSupplier}
                    />
                    <ProgressItem
                      label="Ürün Teslimatı"
                      isDone={req.productDelivered}
                      icon={<FiTruck />}
                    />
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

// Yardımcı Component
const ProgressItem = ({
  label,
  isDone,
  icon,
}: {
  label: string;
  isDone: boolean;
  icon?: React.ReactNode;
}) => {
  const Icon = isDone ? FiCheckCircle : FiXCircle;
  const color = isDone ? "text-green-400" : "text-red-400";
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {icon ? icon : <Icon className={color} />}
        <span className="text-white/80">{label}</span>
      </div>
      <div className="w-1/2 h-2 bg-black/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            isDone ? "bg-green-500" : "bg-red-500"
          }`}
          style={{ width: isDone ? "100%" : "10%" }}
        ></div>
      </div>
    </div>
  );
};
