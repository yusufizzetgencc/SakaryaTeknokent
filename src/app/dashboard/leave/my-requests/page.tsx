"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import {
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: string;
  approved: boolean;
  rejected: boolean;
  rejectionReason?: string | null;
}

// Framer Motion için animasyon varyantları
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
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

export default function MyLeaveRequests() {
  const { status } = useSession();
  const { data, error } = useSWR<LeaveRequest[]>(
    status === "authenticated" ? "/api/leave/my-requests" : null,
    fetcher
  );

  const router = useRouter();

  // Yüklenme, Hata ve Oturum durumları için modernleştirilmiş gösterim
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-10 text-white tracking-tight flex items-center gap-4">
          <FiFileText size={32} />
          İzin Taleplerim
        </h1>

        {data?.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-white/70 text-lg">
              Henüz oluşturulmuş bir izin talebiniz bulunmamaktadır.
            </p>
          </div>
        ) : (
          <motion.ul
            className="space-y-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {data?.map((leave) => {
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
                <motion.li
                  key={leave.id}
                  variants={itemVariants}
                  onClick={() => router.push(`/dashboard/leave/${leave.id}`)}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 
                             hover:bg-white/10 hover:border-white/20 transition-all duration-300 
                             cursor-pointer shadow-lg"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      router.push(`/dashboard/leave/${leave.id}`);
                    }
                  }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-grow">
                      <p className="text-lg font-semibold text-white capitalize">
                        {leave.leaveType.toLowerCase().replace(/i/g, "İ")} İzni
                      </p>
                      <p className="text-white/70 text-sm mt-1">
                        Tarih Aralığı:{" "}
                        <span className="font-medium text-white/90">
                          {new Date(leave.startDate).toLocaleDateString(
                            "tr-TR"
                          )}{" "}
                          -{" "}
                          {new Date(leave.endDate).toLocaleDateString("tr-TR")}
                        </span>
                      </p>
                      <p className="text-white/70 text-sm">
                        Süre:{" "}
                        <span className="font-medium text-white/90">
                          {leave.duration}
                        </span>
                      </p>
                      {leave.rejected && leave.rejectionReason && (
                        <p className="text-red-400 font-medium mt-2 text-sm">
                          Red Nedeni: {leave.rejectionReason}
                        </p>
                      )}
                    </div>

                    <div
                      className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full font-semibold text-sm select-none ${statusInfo.classes}`}
                    >
                      {statusInfo.icon}
                      <span>{statusInfo.text}</span>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </motion.div>
    </div>
  );
}
