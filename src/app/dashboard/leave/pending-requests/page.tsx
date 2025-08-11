"use client";

import { useState } from "react";
import useSWR from "swr";
import Swal from "sweetalert2";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiSend,
} from "react-icons/fi";
import { useSession } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface LeaveRequest {
  id: string;
  user: User;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: string;
  rejected: boolean;
  rejectionReason?: string | null;
}

interface ApiResponse {
  leaves?: LeaveRequest[];
  [key: string]: unknown;
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

export default function PendingLeaveRequests() {
  const { data: session, status } = useSession();
  const { data, error, mutate } = useSWR<ApiResponse>(
    status === "authenticated" ? "/api/leave/pending" : null,
    fetcher
  );

  const [rejectReason, setRejectReason] = useState<string>("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: "Onaylamak istediğinize emin misiniz?",
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
      const res = await fetch(`/api/leave/approve/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Onaylama sırasında hata oluştu");
      }
      await mutate();
      await Swal.fire({
        title: "Başarılı!",
        text: "İzin talebi onaylandı.",
        icon: "success",
        background: "#1a1a1a",
        color: "#ffffff",
        confirmButtonColor: "#22c55e",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bilinmeyen hata");
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Lütfen red nedenini giriniz.");
      return;
    }
    try {
      const res = await fetch(`/api/leave/approve/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: rejectReason }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Reddetme sırasında hata oluştu");
      }
      setRejectReason("");
      setRejectingId(null);
      await mutate();
      toast.success("İzin talebi reddedildi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bilinmeyen hata");
    }
  };

  if (status === "loading" || (status === "authenticated" && !data && !error)) {
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

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center text-center">
        <div>
          <FiAlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">
            Bu sayfayı görüntülemek için giriş yapmalısınız.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center text-center">
        <div>
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">
            Veri alınırken bir hata oluştu.
          </p>
        </div>
      </div>
    );
  }

  const leaves: LeaveRequest[] = (data?.leaves ?? []).filter(
    (l) => !l.rejected && l.user.id !== session?.user.id
  );

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-10 text-white tracking-tight flex items-center gap-4">
            <FiClock size={32} />
            Onay Bekleyen İzin Talepleri
          </h1>

          {leaves.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-white/70 text-lg">
                Onayınızda bekleyen bir talep bulunmamaktadır.
              </p>
            </div>
          ) : (
            <motion.ul
              className="space-y-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {leaves.map((leave) => (
                <motion.li
                  key={leave.id}
                  variants={itemVariants}
                  layout
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5">
                    <div className="flex-grow">
                      <p className="text-xl font-semibold text-white">
                        {leave.user.firstName} {leave.user.lastName}
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-white/70">
                        <p>
                          <strong>İzin Türü:</strong>{" "}
                          <span className="capitalize text-white/90">
                            {leave.leaveType.toLowerCase().replace(/i/g, "İ")}
                          </span>
                        </p>
                        <p>
                          <strong>Tarih:</strong>{" "}
                          <span className="text-white/90">
                            {new Date(leave.startDate).toLocaleDateString(
                              "tr-TR"
                            )}{" "}
                            -{" "}
                            {new Date(leave.endDate).toLocaleDateString(
                              "tr-TR"
                            )}
                          </span>
                        </p>
                        <p>
                          <strong>Süre:</strong>{" "}
                          <span className="text-white/90">
                            {leave.duration}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(leave.id)}
                        className="inline-flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <FiCheckCircle /> Onayla
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setRejectingId(
                            rejectingId === leave.id ? null : leave.id
                          )
                        }
                        className="inline-flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <FiXCircle /> Reddet
                      </motion.button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {rejectingId === leave.id && (
                      <motion.div
                        layout
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          marginTop: "20px",
                        }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{
                          type: "spring" as const,
                          duration: 0.5,
                          bounce: 0.3,
                        }}
                      >
                        <textarea
                          className="w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg p-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 shadow-inner"
                          placeholder="Red nedenini bu alana yazınız..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-3 justify-end mt-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReject(leave.id)}
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors shadow-lg shadow-red-500/20"
                          >
                            <FiSend /> Reddi Gönder
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setRejectingId(null)}
                            className="bg-gray-700/60 hover:bg-gray-600/60 text-gray-200 px-5 py-2 rounded-lg font-semibold transition-colors"
                          >
                            İptal
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.div>
      </div>
    </>
  );
}
