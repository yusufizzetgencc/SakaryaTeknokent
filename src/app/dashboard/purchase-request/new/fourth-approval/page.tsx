"use client";

import React, { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import Swal from "sweetalert2";
import { motion, Variants } from "framer-motion";
import {
  FiCheck,
  FiPauseCircle,
  FiLoader,
  FiAlertCircle,
  FiBox,
  FiUser,
  FiTag,
  // FiStamp yok, kaldırdım
} from "react-icons/fi";

// Interface'ler
interface PurchaseRequest {
  id: string;
  malzeme: string;
  birim: string;
  miktar: number;
  kategori?: { name: string };
  user: { firstName: string; lastName: string };
  approved?: boolean;
  rejected?: boolean;
  stage?: number;
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

export default function FourthApprovalPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/purchase-request/new/fourth-approval");
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      } else {
        toast.error("Talepler yüklenirken bir hata oluştu.");
      }
    } catch {
      toast.error("Sunucu ile bağlantı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (id: string) => {
    const result = await Swal.fire({
      title: "Talebi Onayla",
      text: "Bu talep onaylanıp bir sonraki aşamaya geçirilecektir. Emin misiniz?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet, Onayla",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#4b5563",
    });
    if (!result.isConfirmed) return;

    const res = await fetch("/api/purchase-request/new/fourth-approval", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "approve" }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Talep onaylandı ve sonraki aşamaya geçti.");
      fetchData();
    } else {
      toast.error(data.error || "Hata oluştu.");
    }
  };

  const handleHold = async (id: string) => {
    const result = await Swal.fire({
      title: "Talebi Beklet",
      text: "Talep, finansal karar için beklemeye alınacaktır. Emin misiniz?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Evet, Beklet",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#4b5563",
    });
    if (!result.isConfirmed) return;

    const res = await fetch("/api/purchase-request/new/fourth-approval", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "hold" }),
    });
    const data = await res.json();
    if (data.success) {
      toast.info("Talep beklemeye alındı.");
      fetchData();
    } else {
      toast.error(data.error || "Hata oluştu.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="w-10 h-10 animate-spin text-white" />
          <p className="text-white/60 text-lg">Finans Onayları Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-10 text-white tracking-tight flex items-center gap-4"
          >
            {/* İkon olarak FiBox kullandım, FiStamp yok */}
            <FiBox size={32} /> Finans Onayları
          </motion.h1>

          {requests.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white/5 border border-white/10 rounded-2xl">
              <FiAlertCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white/70 text-lg">
                Onayınızda bekleyen bir finansal talep bulunmamaktadır.
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
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg"
                >
                  {/* Kart Bilgileri */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                        <FiBox /> {req.malzeme}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-white/70">
                        <span className="flex items-center gap-2">
                          <FiUser /> {req.user.firstName} {req.user.lastName}
                        </span>
                        <span className="flex items-center gap-2">
                          <FiTag /> {req.kategori?.name || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="text-left md:text-right flex-shrink-0">
                      <p className="text-lg font-bold text-blue-400">
                        {req.miktar}
                      </p>
                      <p className="text-xs text-white/60">{req.birim}</p>
                    </div>
                  </div>

                  {/* Eylem Butonları */}
                  <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <motion.button
                      onClick={() => handleHold(req.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-5 py-2.5 rounded-lg font-semibold transition-colors"
                    >
                      <FiPauseCircle /> Finansal Karar İçin Beklet
                    </motion.button>
                    <motion.button
                      onClick={() => handleApprove(req.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-5 py-2.5 rounded-lg font-semibold transition-colors"
                    >
                      <FiCheck /> Onayla ve Sonraki Aşamaya Geçir
                    </motion.button>
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
