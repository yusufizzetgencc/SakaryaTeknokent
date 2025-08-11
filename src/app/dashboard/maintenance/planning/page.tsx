"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { MaintenanceDevice, MaintenancePlan } from "@prisma/client";
import { toast, Toaster } from "sonner";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCpu,
  FiCalendar,
  FiPlusSquare,
  FiList,
  FiCheckCircle,
  FiEdit2,
  FiTool,
  FiLoader,
  FiInfo,
} from "react-icons/fi";

// --- FONKSİYONELLİK DEĞİŞMEDİ ---
type PlanWithDetails = MaintenancePlan & {
  plannedBy: { firstName: string; lastName: string };
  completedBy: { firstName: string; lastName: string } | null;
};

const MaintenancePlanningPage = () => {
  const { data: session } = useSession();

  const [devices, setDevices] = useState<MaintenanceDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [plans, setPlans] = useState<PlanWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Controlled form state
  const [plannedDate, setPlannedDate] = useState("");
  const [planningNotes, setPlanningNotes] = useState("");

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch("/api/maintenance/devices");
        if (!response.ok) throw new Error("Cihazlar yüklenemedi.");
        setDevices(await response.json());
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu."
        );
      }
    };
    fetchDevices();
  }, []);

  const fetchPlans = useCallback(async () => {
    if (!selectedDeviceId) {
      setPlans([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/maintenance/plans?deviceId=${selectedDeviceId}`
      );
      if (!response.ok) throw new Error("Bakım planları getirilemedi.");
      setPlans(await response.json());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handlePlanSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error("Lütfen giriş yapınız.");
      return;
    }
    if (!plannedDate) {
      toast.error("Planlanan bakım tarihi zorunludur.");
      return;
    }

    setIsSubmitting(true);
    toast.promise(
      fetch("/api/maintenance/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: selectedDeviceId,
          plannedDate,
          planningNotes,
          plannedById: session.user.id,
        }),
      }).then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.error || "Plan oluşturulamadı.");
          });
        }
        return res.json();
      }),
      {
        loading: "Bakım planı kaydediliyor...",
        success: () => {
          setPlannedDate("");
          setPlanningNotes("");
          fetchPlans();
          return "Bakım başarıyla planlandı!";
        },
        error: (err) => err.message,
        finally: () => setIsSubmitting(false),
      }
    );
  };

  const handleCompletePlan = async (plan: PlanWithDetails) => {
    if (!session?.user?.id) {
      toast.error("Lütfen giriş yapınız.");
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: "Bakım İşlemini Tamamla",
      html: `
        <div class="space-y-4">
          <input type="date" id="swal-completedDate" class="swal2-input !w-full" value="${
            new Date().toISOString().split("T")[0]
          }">
          <textarea id="swal-completionNotes" class="swal2-textarea !w-full" placeholder="Yapılan işlemler ve bakım notları..."></textarea>
        </div>
      `,
      confirmButtonText: "Kaydet ve Tamamla",
      showCancelButton: true,
      cancelButtonText: "İptal",
      focusConfirm: false,
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#4b5563",
      preConfirm: () => ({
        completedDate: (
          document.getElementById("swal-completedDate") as HTMLInputElement
        ).value,
        completionNotes: (
          document.getElementById("swal-completionNotes") as HTMLTextAreaElement
        ).value,
      }),
    });

    if (formValues && formValues.completedDate) {
      toast.promise(
        fetch(`/api/maintenance/plans/${plan.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formValues,
            completedById: session.user.id,
          }),
        }).then((res) => {
          if (!res.ok) throw new Error("İşlem tamamlanamadı.");
          return res.json();
        }),
        {
          loading: "İşlem kaydediliyor...",
          success: "Bakım başarıyla tamamlandı!",
          error: (err) => err.message,
          finally: () => fetchPlans(),
        }
      );
    }
  };
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";
  const labelBaseClasses = "relative";
  const iconBaseClasses =
    "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500";

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
              <FiTool size={32} /> Bakım Planlama
            </h1>
            <p className="text-white/60 mt-2">
              Cihaz seçerek bakım planlayın veya mevcut planları yönetin.
            </p>
          </div>

          <div className="max-w-xl mx-auto mb-10">
            <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
              <FiCpu /> Cihaz Seçin
            </label>
            <div className="relative">
              <FiCpu className={iconBaseClasses} />
              <select
                id="device-select"
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className={`${inputBaseClasses} appearance-none`}
              >
                <option value="">-- Lütfen bir cihaz seçin --</option>
                {devices.map((device) => (
                  <option
                    key={device.id}
                    value={device.id}
                    disabled={!device.isActive}
                    className="bg-[#1C1C1E] text-white disabled:text-gray-500"
                  >
                    {device.name} ({device.deviceCode}){" "}
                    {!device.isActive && "[PASİF]"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <AnimatePresence>
            {selectedDeviceId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-8"
              >
                {/* Sol Kart: Planlama Formu */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
                    <FiPlusSquare /> Yeni Bakım Planı
                  </h2>

                  {selectedDevice && (
                    <div className="mb-6 pb-6 border-b border-white/10 text-sm">
                      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <FiInfo /> Cihaz Bilgileri
                      </h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-white/70">
                        <p>
                          <strong>Marka:</strong> {selectedDevice.brand || "-"}
                        </p>
                        <p>
                          <strong>Model:</strong> {selectedDevice.model || "-"}
                        </p>
                        <p>
                          <strong>Bina:</strong>{" "}
                          {selectedDevice.building || "-"}
                        </p>
                        <p>
                          <strong>Alan:</strong>{" "}
                          {selectedDevice.location || "-"}
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handlePlanSubmit} className="space-y-6">
                    <div className={labelBaseClasses}>
                      <FiCalendar className={iconBaseClasses} />
                      <input
                        type="date"
                        name="plannedDate"
                        value={plannedDate}
                        onChange={(e) => setPlannedDate(e.target.value)}
                        required
                        className={inputBaseClasses}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
                        <FiEdit2 /> Planlama Notu
                      </label>
                      <textarea
                        name="planningNotes"
                        value={planningNotes}
                        onChange={(e) => setPlanningNotes(e.target.value)}
                        rows={3}
                        placeholder="Örn: Yıllık filtre değişimi..."
                        className={`${inputBaseClasses.replace(
                          "pl-10",
                          "px-4"
                        )} resize-y`}
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <FiLoader className="animate-spin" /> Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <FiPlusSquare /> Planı Kaydet
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>

                {/* Sağ Kart: Bakım Geçmişi */}
                <div className="lg:col-span-3 bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
                    <FiList /> Bakım Geçmişi
                  </h2>
                  {isLoading ? (
                    <div className="flex items-center justify-center text-white/70 py-10">
                      <FiLoader className="animate-spin mr-3" /> Yükleniyor...
                    </div>
                  ) : plans.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {plans.map((plan) => (
                        <div
                          key={plan.id}
                          className="bg-black/20 p-4 rounded-lg border border-gray-700/60"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="font-bold text-white flex items-center gap-2">
                                <FiCalendar size={14} />
                                {new Date(plan.plannedDate).toLocaleDateString(
                                  "tr-TR"
                                )}
                              </p>
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block ${
                                  plan.status === "COMPLETED"
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-yellow-500/20 text-yellow-300"
                                }`}
                              >
                                {plan.status === "COMPLETED"
                                  ? "Tamamlandı"
                                  : "Planlandı"}
                              </span>
                            </div>
                            {plan.status === "PLANNED" && (
                              <motion.button
                                onClick={() => handleCompletePlan(plan)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-sm font-semibold bg-green-600/20 hover:bg-green-600/30 text-green-300 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
                              >
                                <FiCheckCircle size={14} /> Tamamla
                              </motion.button>
                            )}
                          </div>
                          {plan.planningNotes && (
                            <p className="text-sm text-white/70 mt-3 pt-3 border-t border-white/10">
                              <strong>Plan Notu:</strong> {plan.planningNotes}
                            </p>
                          )}
                          {plan.status === "COMPLETED" && (
                            <div className="text-sm text-white/70 mt-3 pt-3 border-t border-white/10 space-y-1">
                              <p>
                                <strong>Tamamlanma T.:</strong>{" "}
                                {new Date(
                                  plan.completedDate!
                                ).toLocaleDateString("tr-TR")}
                              </p>
                              {plan.completionNotes && (
                                <p>
                                  <strong>Bakım Notu:</strong>{" "}
                                  {plan.completionNotes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-white/50 py-10">
                      Bu cihaz için planlanmış bakım bulunmuyor.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default MaintenancePlanningPage;
