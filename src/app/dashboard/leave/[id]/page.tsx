"use client";

import { useState, useEffect, use } from "react";
import {
  FiFileText,
  FiXCircle,
  FiArrowLeft,
  FiUser,
  FiClipboard,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiDownload,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: string;
  approved: boolean;
  rejected: boolean;
  rejectionReason?: string | null;
  unit?: string | null;
  contactInfo?: string | null;
  explanation?: string | null;
  fileUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function LeaveDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  // --- FONKSİYONELLİK DEĞİŞMEDİ ---
  const [leave, setLeave] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);

  useEffect(() => {
    async function fetchLeave() {
      try {
        const res = await fetch(`/api/leave/${id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error ?? "İzin talebi bulunamadı");
        }
        const data: LeaveRequest = await res.json();
        setLeave(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Bilinmeyen hata");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchLeave();
  }, [id]);
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full"
          />
          <p className="text-white/60 text-lg">Detaylar Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !leave) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center text-center">
        <div>
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">
            Hata: {error || "İzin talebi bulunamadı"}
          </p>
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.05 }}
            className="mt-6 inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl transition-all duration-300 border border-white/20 font-medium"
          >
            <FiArrowLeft />
            <span>Geri Dön</span>
          </motion.button>
        </div>
      </div>
    );
  }

  const statusInfo = leave.approved
    ? {
        text: "Onaylandı",
        classes: "bg-green-500/20 text-green-300",
        icon: <FiCheckCircle />,
      }
    : leave.rejected
    ? {
        text: "Reddedildi",
        classes: "bg-red-500/20 text-red-300",
        icon: <FiXCircle />,
      }
    : {
        text: "Onay Bekliyor",
        classes: "bg-yellow-500/20 text-yellow-300",
        icon: <FiClock />,
      };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 mb-6 text-white/70 hover:text-white font-semibold transition-colors group"
            aria-label="Geri Dön"
          >
            <FiArrowLeft
              className="group-hover:-translate-x-1 transition-transform"
              size={20}
            />
            Geri Dön
          </button>
          <h1 className="text-4xl font-bold mb-8 text-white tracking-tight">
            İzin Talebi Detayı
          </h1>
        </motion.div>

        <div className="space-y-6">
          {/* Kullanıcı ve İzin Detayları Kartı */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Kullanıcı Bilgileri */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-3">
                  <FiUser /> Kullanıcı Bilgileri
                </h2>
                <div className="space-y-2 text-sm">
                  <p className="text-white/70">
                    <strong>İsim Soyisim:</strong>{" "}
                    <span className="text-white/90">
                      {leave.user.firstName} {leave.user.lastName}
                    </span>
                  </p>
                  <p className="text-white/70">
                    <strong>Email:</strong>{" "}
                    <a
                      href={`mailto:${leave.user.email}`}
                      className="text-blue-400 hover:underline"
                    >
                      {leave.user.email}
                    </a>
                  </p>
                  <p className="text-white/70">
                    <strong>Kullanıcı Adı:</strong>{" "}
                    <span className="text-white/90">{leave.user.username}</span>
                  </p>
                </div>
              </div>
              {/* İzin Durumu */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-3">
                  {statusInfo.icon} Durum
                </h2>
                <div
                  className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full font-semibold text-sm select-none ${statusInfo.classes}`}
                >
                  <span>{statusInfo.text}</span>
                </div>
                {leave.rejectionReason && (
                  <div className="mt-3 text-sm text-red-300/80 bg-red-500/10 p-3 rounded-lg">
                    <strong>Red Nedeni: </strong>
                    <p className="whitespace-pre-wrap mt-1 text-red-300/90">
                      {leave.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* İzin Detayları ve Dosya */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-3">
              <FiClipboard /> İzin Detayları
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <p className="text-white/70">
                <strong>İzin Türü:</strong>{" "}
                <span className="capitalize text-white/90">
                  {leave.leaveType.toLowerCase().replace(/i/g, "İ")}
                </span>
              </p>
              <p className="text-white/70">
                <strong>Süre:</strong>{" "}
                <span className="text-white/90">{leave.duration}</span>
              </p>
              <p className="text-white/70">
                <strong>Başlangıç:</strong>{" "}
                <span className="text-white/90">
                  {new Date(leave.startDate).toLocaleString("tr-TR")}
                </span>
              </p>
              <p className="text-white/70">
                <strong>Bitiş:</strong>{" "}
                <span className="text-white/90">
                  {new Date(leave.endDate).toLocaleString("tr-TR")}
                </span>
              </p>
              <p className="text-white/70">
                <strong>Birim:</strong>{" "}
                <span className="text-white/90">{leave.unit ?? "-"}</span>
              </p>
              <p className="text-white/70">
                <strong>İletişim:</strong>{" "}
                <span className="text-white/90">
                  {leave.contactInfo ?? "-"}
                </span>
              </p>
              <div className="md:col-span-2 text-white/70">
                <strong>Açıklama:</strong>
                <p className="whitespace-pre-wrap mt-1 text-white/90 bg-black/20 p-3 rounded-lg">
                  {leave.explanation || "Açıklama belirtilmemiş."}
                </p>
              </div>
            </div>

            {/* Dosya Bölümü */}
            {leave.fileUrl && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FiFileText />
                  Ekli Dosya
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilePreview(!showFilePreview)}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    {showFilePreview ? <FiXCircle /> : <FiFileText />}
                    {showFilePreview ? "Önizlemeyi Kapat" : "Önizle"}
                  </button>
                  <a
                    href={leave.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <FiDownload /> İndir
                  </a>
                </div>
              </div>
            )}
          </motion.section>

          {/* Önizleme iframe'i */}
          <AnimatePresence>
            {showFilePreview && leave.fileUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "600px" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <iframe
                  src={leave.fileUrl}
                  className="w-full h-full rounded-2xl border border-white/10"
                  title="Dosya Önizleme"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
