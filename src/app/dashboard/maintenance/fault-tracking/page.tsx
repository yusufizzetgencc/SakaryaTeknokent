"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { MaintenanceDevice, FaultLog } from "@prisma/client";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTool,
  FiCpu,
  FiList,
  FiPlus,
  FiX,
  FiLoader,
  FiCalendar,
  FiEdit2,
  FiUploadCloud,
  FiFileText,
  FiUser,
} from "react-icons/fi";

// --- FONKSİYONELLİK DEĞİŞMEDİ ---
type FaultLogWithUser = FaultLog & {
  reportedBy: { firstName: string; lastName: string } | null;
};

const FaultTrackingPage = () => {
  const { data: session } = useSession();
  const [devices, setDevices] = useState<MaintenanceDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [faultHistory, setFaultHistory] = useState<FaultLogWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Yeni state: Tamir eden kişinin adı
  const [repairedByName, setRepairedByName] = useState("");

  // --- Form State ---
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downtimeDuration, setDowntimeDuration] = useState(0); // artık string değil number
  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Tarihler değiştikçe sürenin otomatik hesaplanması
  useEffect(() => {
    if (!startDate || !endDate) {
      setDowntimeDuration(0);
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setDowntimeDuration(0);
      return;
    }
    const diffHours = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 3600)
    );
    setDowntimeDuration(diffHours > 0 ? diffHours : 0);
  }, [startDate, endDate]);

  // Cihazları çek
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch("/api/maintenance/devices?active=true");
        if (response.ok) setDevices(await response.json());
        else toast.error("Cihazlar yüklenemedi.");
      } catch {
        toast.error("Cihazları çekerken bir sunucu hatası oluştu.");
      }
    };
    fetchDevices();
  }, []);

  // Arıza geçmişi çek
  useEffect(() => {
    if (!selectedDeviceId) {
      setFaultHistory([]);
      setIsFormVisible(false);
      return;
    }
    const fetchFaultHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/maintenance/faults?deviceId=${selectedDeviceId}`
        );
        if (response.ok) setFaultHistory(await response.json());
        else {
          setFaultHistory([]);
          toast.error("Arıza geçmişi yüklenirken bir hata oluştu.");
        }
      } catch {
        toast.error("Arıza geçmişini çekerken bir sunucu hatası oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaultHistory();
  }, [selectedDeviceId]);

  const resetForm = () => {
    setDescription("");
    setStartDate(new Date().toISOString().substring(0, 16));
    setEndDate("");
    setDowntimeDuration(0);
    setActionTaken("");
    setNotes("");
    setFile(null);
    setRepairedByName("");
    setIsFormVisible(false);
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error("Yeni arıza kaydı için önce giriş yapmalısınız.");
      return;
    }
    if (!description || !actionTaken || !startDate) {
      toast.error(
        "Lütfen zorunlu alanları (Açıklama, Yapılan Müdahale, Başlangıç Tarihi) doldurun."
      );
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("deviceId", selectedDeviceId);
    formData.append("description", description);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("downtimeDuration", downtimeDuration.toString());
    formData.append("downtimeUnit", "HOURS"); // Sabit saat olarak gönderiliyor
    formData.append("actionTaken", actionTaken);
    formData.append("notes", notes);
    formData.append("repairedByName", repairedByName); // Yeni alan form verisine eklendi
    if (file) formData.append("file", file);

    const promise = fetch("/api/maintenance/faults", {
      method: "POST",
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Bir hata oluştu.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Arıza kaydı oluşturuluyor...",
      success: (newFault) => {
        setFaultHistory((prev) => [newFault, ...prev]);
        resetForm();
        return "Arıza başarıyla kaydedildi!";
      },
      error: (err: unknown) => {
        if (err instanceof Error) return err.message;
        return "Bilinmeyen hata oluştu.";
      },
      finally: () => setIsSubmitting(false),
    });
  };
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";
  const iconBaseClasses =
    "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500";
  const fileInputClasses = `${inputBaseClasses.replace(
    "pl-10",
    "px-4"
  )} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700/60 file:text-gray-200 hover:file:bg-gray-600/60`;

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full p-4 sm:p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="w-full max-w-6xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-4">
              <FiTool size={32} /> Arıza Yönetimi
            </h1>
            <p className="text-white/60 mt-2">
              Cihaz arızalarını kaydedin ve geçmiş müdahaleleri görüntüleyin.
            </p>
          </div>
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <FiCpu className={iconBaseClasses} />
              <select
                id="device-select"
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className={`${inputBaseClasses} appearance-none`}
              >
                <option value="">-- Lütfen bir cihaz seçin --</option>
                {devices.map((d) => (
                  <option
                    key={d.id}
                    value={d.id}
                    className="bg-[#1C1C1E] text-white"
                  >
                    {d.name} ({d.deviceCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center text-white/70 py-10">
              <FiLoader className="animate-spin mr-3" /> Yükleniyor...
            </div>
          )}

          {!isLoading && selectedDeviceId && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FiList /> Arıza Geçmişi ({faultHistory.length})
                </h2>
                <motion.button
                  onClick={() => {
                    if (!isFormVisible)
                      setStartDate(new Date().toISOString().substring(0, 16));
                    setIsFormVisible(!isFormVisible);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 font-semibold text-white rounded-lg px-4 py-2 transition-all duration-300 ${
                    isFormVisible
                      ? "bg-red-600/90 hover:bg-red-600"
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  {isFormVisible ? <FiX size={18} /> : <FiPlus size={18} />}
                  {isFormVisible ? "Kapat" : "Yeni Arıza Kaydı"}
                </motion.button>
              </div>

              <AnimatePresence>
                {isFormVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <form
                      onSubmit={handleFormSubmit}
                      className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60 mb-8"
                    >
                      <h3 className="text-xl font-bold text-white mb-6">
                        Yeni Arıza Kayıt Formu
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
                            <FiEdit2 /> Arıza Açıklaması *
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={2}
                            className={`${inputBaseClasses.replace(
                              "pl-10",
                              "px-4"
                            )} resize-y`}
                          />
                        </div>
                        <div className="relative">
                          <FiCalendar className={iconBaseClasses} />
                          <input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            className={inputBaseClasses}
                          />
                        </div>
                        <div className="relative">
                          <FiCalendar className={iconBaseClasses} />
                          <input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={inputBaseClasses}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
                            <FiTool /> Yapılan Müdahale *
                          </label>
                          <textarea
                            value={actionTaken}
                            onChange={(e) => setActionTaken(e.target.value)}
                            required
                            rows={2}
                            className={`${inputBaseClasses.replace(
                              "pl-10",
                              "px-4"
                            )} resize-y`}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
                            <FiEdit2 /> Ek Notlar
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className={`${inputBaseClasses.replace(
                              "pl-10",
                              "px-4"
                            )} resize-y`}
                          />
                        </div>

                        <div className="relative">
                          <FiUser className={iconBaseClasses} />
                          <input
                            type="text"
                            value={repairedByName}
                            onChange={(e) => setRepairedByName(e.target.value)}
                            placeholder="Tamir Eden Kişi"
                            className={inputBaseClasses}
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
                            <FiUploadCloud /> Dosya (Rapor/Fotoğraf)
                          </label>
                          <input
                            type="file"
                            onChange={(e) =>
                              setFile(e.target.files ? e.target.files[0] : null)
                            }
                            className={fileInputClasses}
                          />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                          <motion.button
                            type="button"
                            onClick={resetForm}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="font-semibold text-gray-400 hover:text-white transition-colors"
                          >
                            İptal
                          </motion.button>
                          <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-48 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <>
                                <FiLoader className="animate-spin" />{" "}
                                Kaydediliyor...
                              </>
                            ) : (
                              "Kaydı Oluştur"
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {faultHistory.length > 0 ? (
                  faultHistory.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/5 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-gray-800/60"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-lg font-bold text-white">
                          {log.description}
                        </h3>
                        {log.fileUrl && (
                          <a
                            href={log.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors shrink-0"
                          >
                            <FiFileText /> Rapor
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-white/60 mt-2">
                        <strong>Müdahale:</strong> {log.actionTaken}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 mt-4 pt-4 border-t border-white/10 text-sm text-white/80">
                        <div>
                          <strong className="text-white/60">Başlangıç:</strong>{" "}
                          {new Date(log.startDate).toLocaleString("tr-TR")}
                        </div>
                        {log.endDate && (
                          <div>
                            <strong className="text-white/60">Bitiş:</strong>{" "}
                            {new Date(log.endDate).toLocaleString("tr-TR")}
                          </div>
                        )}
                        <div>
                          <strong className="text-white/60">Süre:</strong>{" "}
                          {log.downtimeDuration || 0} saat
                        </div>
                        {log.repairedByName && (
                          <div>
                            <strong className="text-white/60">
                              Tamir Eden:
                            </strong>{" "}
                            {log.repairedByName}
                          </div>
                        )}
                        {log.reportedBy && (
                          <div>
                            <strong className="text-white/60">Bildiren:</strong>{" "}
                            {`${log.reportedBy.firstName} ${log.reportedBy.lastName}`}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-dashed border-gray-800/60 text-white/50">
                    <p className="font-semibold">
                      Bu cihaz için arıza kaydı bulunmuyor.
                    </p>
                    <p className="mt-1 text-sm">
                      İlk kaydı oluşturmak için yukarıdaki &apos;Yeni Arıza
                      Kaydı&apos; butonunu kullanın.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default FaultTrackingPage;
