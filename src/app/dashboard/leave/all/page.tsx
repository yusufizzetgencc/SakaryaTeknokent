"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiGrid,
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
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  };
}

// Framer Motion için animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function LeaveAllPage() {
  const router = useRouter();

  // --- FONKSİYONELLİK DEĞİŞMEDİ ---
  const [nameFilterInput, setNameFilterInput] = useState("");
  const [typeFilterInput, setTypeFilterInput] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const onNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setNameFilter(nameFilterInput.trim());
    }
  };

  const onTypeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setTypeFilter(typeFilterInput.trim());
    }
  };

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (nameFilter) params.append("name", nameFilter);
    if (typeFilter) params.append("type", typeFilter);
    if (statusFilter) params.append("status", statusFilter);
    if (sortBy) params.append("sortBy", sortBy);
    if (sortOrder) params.append("sortOrder", sortOrder);
    return params.toString();
  }, [nameFilter, typeFilter, statusFilter, sortBy, sortOrder]);

  const { data, error } = useSWR<LeaveRequest[]>(
    `/api/leave/all?${queryString}`,
    fetcher
  );
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  // Tasarım için ortak sınıflar
  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center text-center p-4">
        <div>
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">
            Veri alınırken bir hata oluştu: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full"
          />
          <p className="text-white/60 text-lg">Veriler Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-6 lg:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-white tracking-tight flex items-center gap-4"
      >
        <FiGrid size={32} />
        Tüm İzin Talepleri Yönetimi
      </motion.h1>

      {/* Filtreler */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <input
            type="text"
            placeholder="İsim ile ara (Enter)"
            value={nameFilterInput}
            onChange={(e) => setNameFilterInput(e.target.value)}
            onKeyDown={onNameKeyDown}
            className={inputBaseClasses}
          />
          <input
            type="text"
            placeholder="İzin Türü ile ara (Enter)"
            value={typeFilterInput}
            onChange={(e) => setTypeFilterInput(e.target.value)}
            onKeyDown={onTypeKeyDown}
            className={inputBaseClasses}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={inputBaseClasses}
          >
            <option value="">Tüm Durumlar</option>
            <option value="pending">Onay Bekliyor</option>
            <option value="approved">Onaylandı</option>
            <option value="rejected">Reddedildi</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={inputBaseClasses}
          >
            <option value="createdAt">Oluşturma Tarihi</option>
            <option value="startDate">Başlangıç Tarihi</option>
            <option value="endDate">Bitiş Tarihi</option>
            <option value="user.firstName">İsme Göre</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className={inputBaseClasses}
          >
            <option value="desc">Azalan</option>
            <option value="asc">Artan</option>
          </select>
        </div>
      </motion.section>

      {/* Liste */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300 min-w-[1000px]">
            <motion.thead
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-white/70 uppercase bg-white/5"
            >
              <tr>
                <th scope="col" className="px-6 py-3">
                  Kullanıcı
                </th>
                <th scope="col" className="px-6 py-3">
                  İzin Türü
                </th>
                <th scope="col" className="px-6 py-3">
                  Başlangıç
                </th>
                <th scope="col" className="px-6 py-3">
                  Bitiş
                </th>
                <th scope="col" className="px-6 py-3">
                  Süre
                </th>
                <th scope="col" className="px-6 py-3">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3">
                  Red Nedeni
                </th>
              </tr>
            </motion.thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-white/60">
                    Filtrelerle eşleşen bir talep bulunamadı.
                  </td>
                </tr>
              ) : (
                data.map((leave) => {
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
                    <motion.tr
                      key={leave.id}
                      variants={itemVariants}
                      className="border-b border-white/10 hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/leave/${leave.id}`)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          router.push(`/dashboard/leave/${leave.id}`);
                      }}
                    >
                      <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                        {leave.user.firstName} {leave.user.lastName}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {leave.leaveType.toLowerCase().replace(/i/g, "İ")}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(leave.startDate).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(leave.endDate).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-6 py-4">{leave.duration}</td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-xs ${statusInfo.classes}`}
                        >
                          {statusInfo.icon}
                          <span>{statusInfo.text}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        {leave.rejectionReason ?? "-"}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </motion.tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
