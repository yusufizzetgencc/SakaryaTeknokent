"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  MaintenanceDevice,
  PeriodicControl,
  PeriodicControlLog,
} from "@prisma/client";
import { toast, Toaster } from "sonner";
import Swal from "sweetalert2";
import { differenceInDays, format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShield,
  FiCpu,
  FiPlusSquare,
  FiList,
  FiAlertTriangle,
  FiCheckSquare,
  FiFileText,
  FiLoader,
  FiCalendar,
  FiRefreshCw,
  FiEdit2,
  FiUploadCloud,
} from "react-icons/fi";

// --- FONKSİYONELLİK DEĞİŞMEDİ ---
type PlanWithLogs = PeriodicControl & {
  logs: (PeriodicControlLog & {
    performedBy: { firstName: string; lastName: string } | null;
  })[];
};

const frequencyOptions = [
  { label: "15 Günde 1", value: "FIFTEEN_DAYS" },
  { label: "1 Aylık", value: "MONTHLY" },
  { label: "2 Aylık", value: "TWO_MONTHS" },
  { label: "3 Aylık", value: "QUARTERLY" },
  { label: "4 Aylık", value: "FOUR_MONTHS" },
  { label: "5 Aylık", value: "FIVE_MONTHS" },
  { label: "6 Aylık", value: "SEMI_ANNUALLY" },
  { label: "7 Aylık", value: "SEVEN_MONTHS" },
  { label: "8 Aylık", value: "EIGHT_MONTHS" },
  { label: "9 Aylık", value: "NINE_MONTHS" },
  { label: "10 Aylık", value: "TEN_MONTHS" },
  { label: "11 Aylık", value: "ELEVEN_MONTHS" },
  { label: "12 Aylık", value: "ANNUALLY" },
];

const getNextDateInfo = (nextDate: string | Date) => {
  const date = new Date(nextDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Compare dates only
  const daysLeft = differenceInDays(date, today);

  if (daysLeft < 0)
    return {
      text: `${Math.abs(daysLeft)} gün geçti`,
      color: "bg-red-500/20 text-red-300",
    };
  if (daysLeft === 0)
    return { text: "Bugün", color: "bg-orange-500/20 text-orange-300" };
  if (daysLeft <= 7)
    return {
      text: `${daysLeft} gün kaldı`,
      color: "bg-orange-500/20 text-orange-300",
    };
  if (daysLeft <= 30)
    return {
      text: `${daysLeft} gün kaldı`,
      color: "bg-yellow-500/20 text-yellow-300",
    };
  return {
    text: `${daysLeft} gün kaldı`,
    color: "bg-green-500/20 text-green-300",
  };
};

const PeriodicControlPage = () => {
  const { data: session } = useSession();
  const [devices, setDevices] = useState<MaintenanceDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [plan, setPlan] = useState<PlanWithLogs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch("/api/maintenance/devices?active=true");
        if (response.ok) setDevices(await response.json());
        else throw new Error("Aktif cihazlar yüklenemedi.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
      }
    };
    fetchDevices();
  }, []);

  const fetchPlan = useCallback(async () => {
    if (!selectedDeviceId) {
      setPlan(null);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/maintenance/periodic-controls?deviceId=${selectedDeviceId}`
      );
      if (response.status === 404) {
        setPlan(null); // Plan not found is a valid state
      } else if (response.ok) {
        setPlan(await response.json());
      } else {
        throw new Error("Plan bilgisi getirilemedi.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
      setPlan(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    fetchPlan();
  }, [selectedDeviceId, fetchPlan]);

  const handleCreatePlanSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error("Kullanıcı oturumu bulunamadı.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("deviceId", selectedDeviceId);
    formData.append("createdById", session.user.id);

    toast.promise(
      fetch("/api/maintenance/periodic-controls", {
        method: "POST",
        body: formData,
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Plan oluşturulamadı.");
        return data;
      }),
      {
        loading: "Plan oluşturuluyor...",
        success: (data) => {
          setPlan(data);
          return "Plan başarıyla oluşturuldu!";
        },
        error: (err) => err.message,
        finally: () => setIsSubmitting(false),
      }
    );
  };

  const handleLogNewControl = async () => {
    if (!plan || !session?.user?.id) {
      toast.error("Gerekli bilgiler eksik.");
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: "Yeni Kontrolü Kaydet",
      html: `
        <div class="space-y-4 text-left">
          <input type="date" id="swal-controlDate" class="swal2-input !w-full" value="${
            new Date().toISOString().split("T")[0]
          }">
          <input type="file" id="swal-file" class="swal2-file !w-full" required>
          <textarea id="swal-notes" class="swal2-textarea !w-full" placeholder="Kontrol notları..."></textarea>
        </div>
      `,
      confirmButtonText: "Kaydet",
      showCancelButton: true,
      cancelButtonText: "İptal",
      focusConfirm: false,
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#4b5563",
      preConfirm: () => ({
        controlDate: (
          document.getElementById("swal-controlDate") as HTMLInputElement
        ).value,
        notes: (document.getElementById("swal-notes") as HTMLTextAreaElement)
          .value,
        file: (document.getElementById("swal-file") as HTMLInputElement)
          .files?.[0],
      }),
    });

    if (formValues && formValues.controlDate && formValues.file) {
      const formData = new FormData();
      formData.append("controlPlanId", plan.id);
      formData.append("controlDate", formValues.controlDate);
      formData.append("notes", formValues.notes);
      formData.append("file", formValues.file);
      formData.append("performedById", session.user.id);

      toast.promise(
        fetch("/api/maintenance/periodic-controls/log", {
          method: "POST",
          body: formData,
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Log kaydedilemedi.");
          return data;
        }),
        {
          loading: "Kontrol kaydı oluşturuluyor...",
          success: () => {
            fetchPlan(); // Re-fetch plan to update logs and next date
            return "Yeni kontrol başarıyla kaydedildi!";
          },
          error: (err) => err.message,
        }
      );
    }
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
              <FiShield size={32} /> Periyodik Kontrol
            </h1>
            <p className="text-white/60 mt-2">
              Cihazların periyodik kontrol planlarını oluşturun ve takip edin.
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

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center text-white/70 py-10"
              >
                <FiLoader className="animate-spin mr-3" /> Yükleniyor...
              </motion.div>
            ) : (
              selectedDeviceId &&
              (plan ? (
                <motion.div
                  key="plan-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-5 gap-8"
                >
                  <div className="lg:col-span-3 bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
                      <FiList /> Kontrol Geçmişi
                    </h2>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {plan.logs.length > 0 ? (
                        plan.logs.map((log) => (
                          <div
                            key={log.id}
                            className="bg-black/20 p-4 rounded-lg border border-gray-700/60"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <p className="font-semibold text-white">
                                  {format(
                                    new Date(log.controlDate),
                                    "dd MMMM yyyy",
                                    { locale: tr }
                                  )}
                                </p>
                                <p className="text-sm text-white/60">
                                  Yapan:{" "}
                                  {log.performedBy
                                    ? `${log.performedBy.firstName} ${log.performedBy.lastName}`
                                    : "Bilinmiyor"}
                                </p>
                              </div>
                              <a
                                href={log.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <FiFileText /> Rapor
                              </a>
                            </div>
                            {log.notes && (
                              <p className="text-sm text-white/80 mt-2 pt-2 border-t border-white/10">
                                {log.notes}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-white/50 py-10">
                          Henüz kontrol kaydı yok.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60 flex flex-col">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
                      <FiShield /> Plan Durumu
                    </h2>
                    <div className="space-y-4 text-white/90 grow">
                      <p>
                        <strong>Sıklık:</strong>{" "}
                        {frequencyOptions.find(
                          (f) => f.value === plan.frequency
                        )?.label || plan.frequency}
                      </p>
                      <div className="border-t border-white/10 pt-4 mt-4">
                        <p className="font-semibold text-white">
                          Sonraki Kontrol Tarihi
                        </p>
                        <p className="text-2xl font-bold">
                          {format(
                            new Date(plan.nextControlDate),
                            "dd MMMM yyyy"
                          )}
                        </p>
                        <span
                          className={`text-sm font-semibold px-2.5 py-1 rounded-full mt-3 inline-flex items-center gap-2 ${
                            getNextDateInfo(plan.nextControlDate).color
                          }`}
                        >
                          <FiAlertTriangle size={14} />{" "}
                          {getNextDateInfo(plan.nextControlDate).text}
                        </span>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleLogNewControl}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20"
                    >
                      <FiCheckSquare /> Yeni Kontrolü Kaydet
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="create-plan"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <form
                    onSubmit={handleCreatePlanSubmit}
                    className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60 max-w-3xl mx-auto"
                  >
                    <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-3 mb-2">
                      <FiPlusSquare /> Yeni Kontrol Planı Oluştur
                    </h2>
                    <p className="text-white/60 text-center mb-8">
                      Bu cihaz için bir plan bulunamadı. İlk kontrolü kaydederek
                      planı başlatın.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <FiRefreshCw className={iconBaseClasses} />
                        <select
                          name="frequency"
                          required
                          className={`${inputBaseClasses} appearance-none`}
                        >
                          {frequencyOptions.map(({ label, value }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="relative">
                        <FiCalendar className={iconBaseClasses} />
                        <input
                          type="date"
                          name="firstControlDate"
                          required
                          className={inputBaseClasses}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
                          <FiUploadCloud /> Kontrol Raporu *
                        </label>
                        <input
                          type="file"
                          name="file"
                          required
                          className={fileInputClasses}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
                          <FiEdit2 /> Açıklama
                        </label>
                        <textarea
                          name="notes"
                          rows={3}
                          className={`${inputBaseClasses.replace(
                            "pl-10",
                            "px-4"
                          )} resize-y`}
                        ></textarea>
                      </div>
                      <div className="md:col-span-2">
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-8 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <FiLoader className="animate-spin" />{" "}
                              Oluşturuluyor...
                            </>
                          ) : (
                            <>
                              <FiPlusSquare /> Plan Oluştur ve Kaydet
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default PeriodicControlPage;
