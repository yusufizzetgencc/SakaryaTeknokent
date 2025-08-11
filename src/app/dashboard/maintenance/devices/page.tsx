"use client";

import { useState, useEffect } from "react";
import {
  MaintenanceDevice,
  MaintenanceCategory,
  DeviceImage,
} from "@prisma/client";
import {
  FiPlus,
  FiChevronRight,
  FiPower,
  FiTrash2,
  FiCpu,
  FiLoader,
  FiAlertTriangle,
} from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// --- FONKSİYONELLİK DEĞİŞMEDİ ---
type DeviceWithDetails = MaintenanceDevice & {
  category: MaintenanceCategory;
  addedBy: { firstName: string; lastName: string };
  images: DeviceImage[];
};

const DevicesListPage = () => {
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [selectedDevice, setSelectedDevice] =
    useState<DeviceWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false); // For button loading states
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/maintenance/devices");
      if (!response.ok) throw new Error("Cihazlar getirilemedi.");
      const data = await response.json();
      setDevices(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bir hata oluştu.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    // If the selected device is updated in the main list, update the selection
    if (selectedDevice) {
      const updatedDevice = devices.find((d) => d.id === selectedDevice.id);
      setSelectedDevice(updatedDevice || null);
    }
  }, [devices, selectedDevice]);

  const handleToggleStatus = async () => {
    if (!selectedDevice || isActionLoading) return;

    const actionText = selectedDevice.isActive
      ? "pasifleştirmek"
      : "aktifleştirmek";
    const confirmButtonColor = selectedDevice.isActive ? "#f59e0b" : "#22c55e";

    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: `'${selectedDevice.name}' cihazını ${actionText} istiyor musunuz?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: confirmButtonColor,
      cancelButtonColor: "#4b5563",
    });

    if (!result.isConfirmed) return;

    setIsActionLoading(true);
    try {
      const response = await fetch(
        `/api/maintenance/devices/${selectedDevice.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !selectedDevice.isActive }),
        }
      );
      if (!response.ok) throw new Error("Durum güncellenemedi.");
      toast.success("Cihaz durumu başarıyla güncellendi.");
      await fetchDevices(); // Fetches all devices to get updated list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteDevice = async () => {
    if (!selectedDevice || isActionLoading) return;

    const result = await Swal.fire({
      title: "Kalıcı olarak silinecek!",
      text: `'${selectedDevice.name}' adlı cihaz geri alınamaz şekilde silinecektir. Onaylıyor musunuz?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, Sil",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#4b5563",
    });

    if (!result.isConfirmed) return;

    setIsActionLoading(true);
    try {
      const response = await fetch(
        `/api/maintenance/devices/${selectedDevice.id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Cihaz silinemedi.");
      toast.success("Cihaz başarıyla silindi.");
      setSelectedDevice(null); // Close detail view after deletion
      await fetchDevices();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsActionLoading(false);
    }
  };
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="flex flex-col md:flex-row gap-8 w-full max-w-7xl mx-auto"
        >
          {/* Sol Sütun: Cihaz Listesi */}
          <div className="flex-1 md:max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <FiCpu /> Cihazlar
                </h1>
                <p className="text-white/60 mt-1">
                  Sistemdeki envanteri yönetin.
                </p>
              </div>
              <Link href="/dashboard/maintenance/technical-equipment-add">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/20"
                  title="Yeni Cihaz Ekle"
                >
                  <FiPlus size={20} />
                </motion.div>
              </Link>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-gray-800/60 min-h-[60vh] max-h-[75vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-white/70">
                  <FiLoader className="animate-spin mr-3" /> Yükleniyor...
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-red-400/80 p-4 text-center">
                  <FiAlertTriangle size={32} className="mb-3" />
                  <p className="font-semibold">Bir Hata Oluştu</p>
                  <p className="text-sm text-red-400/60">{error}</p>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center text-white/50 py-10">
                  Kayıtlı cihaz bulunamadı.
                </div>
              ) : (
                <div className="space-y-2">
                  {devices.map((device) => (
                    <motion.div
                      key={device.id}
                      onClick={() => setSelectedDevice(device)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 select-none border-l-4
                        ${
                          selectedDevice?.id === device.id
                            ? "bg-blue-500/20 border-blue-500"
                            : `bg-white/5 hover:bg-white/10 border-transparent`
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ring-2 ${
                            device.isActive
                              ? "bg-green-500 ring-green-500/30"
                              : "bg-red-500 ring-red-500/30"
                          }`}
                        />
                        <div>
                          <p className="font-semibold text-white">
                            {device.name}
                          </p>
                          <p className="text-sm text-white/60">
                            {device.deviceCode}
                          </p>
                        </div>
                      </div>
                      <FiChevronRight className="text-white/50" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sağ Sütun: Cihaz Detayları */}
          <div className="flex-[2_2_0%]">
            <AnimatePresence>
              {selectedDevice && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="sticky top-8 bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-800/60"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        {selectedDevice.name}
                      </h2>
                      <span
                        className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full
                        ${
                          selectedDevice.isActive
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {selectedDevice.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        onClick={handleToggleStatus}
                        disabled={isActionLoading}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-3 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedDevice.isActive
                            ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300"
                            : "bg-green-500/20 hover:bg-green-500/30 text-green-300"
                        }`}
                        title={
                          selectedDevice.isActive
                            ? "Cihazı Pasif Yap"
                            : "Cihazı Aktif Yap"
                        }
                      >
                        <FiPower size={18} />
                      </motion.button>
                      <motion.button
                        onClick={handleDeleteDevice}
                        disabled={isActionLoading}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cihazı Sil"
                      >
                        <FiTrash2 size={18} />
                      </motion.button>
                    </div>
                  </div>

                  {selectedDevice.images.length > 0 && (
                    <div className="mt-6 relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-700/80">
                      <Image
                        src={selectedDevice.images[0].url}
                        alt={`Görsel: ${selectedDevice.name}`}
                        layout="fill"
                        objectFit="cover"
                        priority
                      />
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 text-sm">
                    <DetailItem
                      label="Cihaz Kodu"
                      value={selectedDevice.deviceCode}
                    />
                    <DetailItem
                      label="Seri No"
                      value={selectedDevice.serialNumber}
                    />
                    <DetailItem
                      label="Kategori"
                      value={selectedDevice.category.name}
                    />
                    <DetailItem label="Marka" value={selectedDevice.brand} />
                    <DetailItem label="Model" value={selectedDevice.model} />
                    <DetailItem
                      label="Bulunduğu Bina"
                      value={selectedDevice.building}
                    />
                    <DetailItem
                      label="Bulunduğu Alan"
                      value={selectedDevice.location}
                    />
                    <div className="lg:col-span-3">
                      <DetailItem
                        label="Açıklama"
                        value={selectedDevice.description}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!selectedDevice && !isLoading && (
              <div className="flex flex-col items-center justify-center text-center h-[75vh] bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-dashed border-gray-800/60">
                <FiCpu size={48} className="text-white/20 mb-4" />
                <h3 className="text-xl font-bold text-white/80">
                  Detayları Görüntüle
                </h3>
                <p className="text-white/50 mt-2 max-w-xs">
                  Soldaki listeden bir cihaz seçerek bilgilerine ve yönetim
                  seçeneklerine buradan ulaşabilirsiniz.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

// Detayları göstermek için yardımcı bir bileşen
const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => (
  <div>
    <p className="font-semibold text-white/90">{label}</p>
    <p className="text-white/60">{value || "Belirtilmemiş"}</p>
  </div>
);

export default DevicesListPage;
