"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import {
  FiBox,
  FiTag,
  FiLayers,
  FiClipboard,
  FiFileText,
  FiCalendar,
  FiShoppingCart,
  FiAlertCircle,
} from "react-icons/fi";
import { motion, Variants } from "framer-motion";

interface PurchaseRequest {
  id: string;
  birim: string;
  malzeme: string;
  malzemeOzellik?: string | null;
  ihtiyacSebebi: string;
  miktar: number;
  kategori: { id: string; name: string } | null;
  createdAt: string;
}

// Framer Motion için animasyon varyantları (tip uyumlu şekilde)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const, // literal tip olarak belirtildi
      stiffness: 100,
    },
  },
};

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/purchase-request/me");
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Satın alma talepleri yüklenemedi.");
          setRequests([]);
        } else {
          setRequests(data.purchaseRequests);
        }
      } catch {
        toast.error("Sunucu hatası. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full"
          />
          <p className="text-white/60 text-lg">Talepler Yükleniyor...</p>
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
            <FiShoppingCart size={32} />
            Satın Alma Taleplerim
          </motion.h1>

          {requests.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white/5 border border-white/10 rounded-2xl">
              <FiAlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-white/70 text-lg">
                Henüz oluşturulmuş bir satın alma talebiniz bulunmamaktadır.
              </p>
            </div>
          ) : (
            <motion.ul
              className="space-y-5"
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
                  {/* Kart Başlığı */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/10">
                    <div>
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <FiBox /> {req.malzeme}
                      </h2>
                      <p className="text-sm text-white/70 flex items-center gap-2 mt-1">
                        <FiTag /> {req.kategori?.name || "Belirtilmemiş"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-400">
                        {req.miktar}
                      </p>
                      <p className="text-xs text-white/60">Adet</p>
                    </div>
                  </div>

                  {/* Kart İçeriği */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 text-white/80">
                      <FiLayers className="mt-1 flex-shrink-0" />
                      <div>
                        <strong>Birim:</strong>
                        <span className="ml-2 text-white/90">{req.birim}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-white/80">
                      <FiFileText className="mt-1 flex-shrink-0" />
                      <div>
                        <strong>Malzeme Özellikleri:</strong>
                        <p className="text-white/90 mt-1">
                          {req.malzemeOzellik || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-white/80">
                      <FiClipboard className="mt-1 flex-shrink-0" />
                      <div>
                        <strong>İhtiyaç Sebebi:</strong>
                        <p className="text-white/90 mt-1">
                          {req.ihtiyacSebebi}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Kart Alt Bilgisi */}
                  <div className="mt-5 pt-3 border-t border-white/10 text-right text-xs text-white/60 select-none">
                    <FiCalendar className="inline mr-1.5" />
                    Talep Tarihi:{" "}
                    {new Date(req.createdAt).toLocaleString("tr-TR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
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
