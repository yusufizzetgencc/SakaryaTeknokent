"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Toaster, toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { MaintenanceReportItem } from "@/app/api/maintenance/reports/route";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFileText,
  FiFilter,
  FiPrinter,
  FiList,
  FiLoader,
  FiTool,
  FiAlertTriangle,
  FiCheckSquare,
  FiCpu,
  FiChevronDown,
  FiCalendar,
  FiHash,
} from "react-icons/fi";

// --- FONKSİYONELLİK DEĞİŞMEDİ ---
type Device = {
  id: string;
  name: string;
  deviceCode: string;
};

const MaintenanceReportsPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [reportData, setReportData] = useState<MaintenanceReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(true);

  const [filters, setFilters] = useState({
    type: "tumu",
    startDate: "",
    endDate: "",
    deviceId: "",
    deviceCode: "",
    isActive: "true",
  });

  useEffect(() => {
    const fetchDevices = async () => {
      const response = await fetch("/api/maintenance/devices");
      if (response.ok) setDevices(await response.json());
    };
    fetchDevices();
  }, []);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFetchReports = async (e?: FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    try {
      const response = await fetch(
        `/api/maintenance/reports?${params.toString()}`
      );
      if (!response.ok) throw new Error("Raporlar getirilemedi.");

      const data = await response.json();
      setReportData(data);
      if (data.length === 0) {
        toast.info("Belirtilen kriterlere uygun kayıt bulunamadı.");
      } else {
        toast.success(`${data.length} kayıt başarıyla getirildi.`);
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // İcon tipini React.ReactNode yaptık (JSX.Element yerine)
  const ReportTypeIcon = ({ type }: { type: string }) => {
    const iconMap: { [key: string]: { icon: React.ReactNode; style: string } } =
      {
        Bakım: { icon: <FiTool />, style: "bg-green-500/20 text-green-300" },
        Arıza: {
          icon: <FiAlertTriangle />,
          style: "bg-red-500/20 text-red-300",
        },
        Kontrol: {
          icon: <FiCheckSquare />,
          style: "bg-yellow-500/20 text-yellow-300",
        },
      };
    const { icon, style } = iconMap[type] || { icon: null, style: "" };
    return (
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${style}`}
      >
        {icon}
      </div>
    );
  };

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";
  const iconBaseClasses =
    "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500";

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area,
          .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 2rem;
          }
          .print-hide {
            display: none !important;
          }
          .report-card {
            background: white !important;
            border: 1px solid #ccc !important;
            color: black !important;
          }
          .report-card * {
            color: black !important;
          }
          .report-card-header {
            border-bottom: 1px solid #ccc !important;
          }
        }
      `}</style>

      <div className="min-h-screen w-full p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="w-full max-w-7xl mx-auto"
        >
          <div className="text-center mb-10 print-hide">
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-4">
              <FiFileText size={32} /> Raporlama
            </h1>
            <p className="text-white/60 mt-2">
              Kriterlere göre bakım, arıza ve kontrol kayıtlarını listeleyin ve
              yazdırın.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-800/60 mb-8 print-hide">
            <div
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className="flex justify-between items-center cursor-pointer"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <FiFilter /> Filtreleme Seçenekleri
              </h2>
              <motion.div
                animate={{ rotate: isFilterVisible ? 0 : -180 }}
                transition={{ duration: 0.3 }}
              >
                <FiChevronDown />
              </motion.div>
            </div>
            <AnimatePresence>
              {isFilterVisible && (
                <motion.div
                  key="filter-form"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: "2rem" }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <form
                    onSubmit={handleFetchReports}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
                    <div className="relative">
                      <FiList className={iconBaseClasses} />
                      <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className={`${inputBaseClasses} appearance-none`}
                      >
                        <option value="tumu">Tüm Kayıt Türleri</option>
                        <option value="bakim">Bakım</option>
                        <option value="ariza">Arıza</option>
                        <option value="kontrol">Kontrol</option>
                      </select>
                    </div>
                    <div className="relative">
                      <FiCalendar className={iconBaseClasses} />
                      <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className={inputBaseClasses}
                      />
                    </div>
                    <div className="relative">
                      <FiCalendar className={iconBaseClasses} />
                      <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className={inputBaseClasses}
                      />
                    </div>
                    <div className="relative">
                      <FiCpu className={iconBaseClasses} />
                      <select
                        name="deviceId"
                        value={filters.deviceId}
                        onChange={handleFilterChange}
                        className={`${inputBaseClasses} appearance-none`}
                      >
                        <option value="">Tüm Cihazlar</option>
                        {devices.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.deviceCode})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="relative">
                      <FiHash className={iconBaseClasses} />
                      <input
                        type="text"
                        name="deviceCode"
                        value={filters.deviceCode}
                        onChange={handleFilterChange}
                        className={inputBaseClasses}
                        placeholder="Cihaz Kodu ile Ara..."
                      />
                    </div>
                    <div className="relative">
                      <FiCheckSquare className={iconBaseClasses} />
                      <select
                        name="isActive"
                        value={filters.isActive}
                        onChange={handleFilterChange}
                        className={`${inputBaseClasses} appearance-none`}
                      >
                        <option value="true">Aktif Cihazlar</option>
                        <option value="false">Pasif Cihazlar</option>
                      </select>
                    </div>
                    <div className="lg:col-span-2 flex items-end">
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white h-[52px] rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <FiLoader className="animate-spin" /> Rapor
                            Getiriliyor...
                          </>
                        ) : (
                          "Raporları Getir"
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="printable-area">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">
                Rapor Sonuçları ({reportData.length})
              </h2>
              <motion.button
                onClick={handlePrint}
                disabled={reportData.length === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 font-semibold text-gray-300 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed print-hide"
              >
                <FiPrinter /> Yazdır
              </motion.button>
            </div>

            <div className="space-y-4">
              {reportData.length > 0 ? (
                reportData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/5 p-5 rounded-xl border border-gray-800/60 report-card"
                  >
                    <div className="flex justify-between items-start gap-4 pb-4 report-card-header">
                      <div className="flex items-center gap-4">
                        <ReportTypeIcon type={item.type} />
                        <div>
                          <p className="font-bold text-lg text-white">
                            {item.description}
                          </p>
                          <p className="text-sm text-white/60">
                            {item.device.name} (
                            <span className="font-mono">
                              {item.device.deviceCode}
                            </span>
                            )
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-white/60 shrink-0">
                        {format(new Date(item.date), "dd.MM.yyyy HH:mm", {
                          locale: tr,
                        })}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                      <p className="text-sm text-white/80 max-w-4xl">
                        {item.details || "Ek detay belirtilmemiş."}
                      </p>
                      {item.fileUrl && (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-400 hover:underline shrink-0"
                        >
                          Dosyayı Gör
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-right text-white/50 mt-4">
                      İşlemi Yapan: {item.user || "Bilinmiyor"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-gray-800/60 text-white/50 print-hide">
                  <p className="font-semibold">
                    Gösterilecek rapor sonucu bulunamadı.
                  </p>
                  <p className="mt-1 text-sm">
                    Lütfen yukarıdaki filtreleri kullanarak bir arama yapın.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default MaintenanceReportsPage;
