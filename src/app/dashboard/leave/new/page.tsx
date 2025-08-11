"use client";

import { useEffect, useState, useRef } from "react";
import { toast, Toaster } from "sonner";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiFileText,
  FiUsers,
  FiMail,
  FiClipboard,
  FiArrowLeft,
  FiSend,
  FiLoader,
} from "react-icons/fi";

export default function NewLeavePage() {
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---
  const [form, setForm] = useState({
    startDateTime: "",
    endDateTime: "",
    leaveType: "HASTALIK",
    durationValue: "",
    explanation: "",
    unit: "",
    contactInfo: "",
    file: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!form.startDateTime || !form.endDateTime) {
      setForm((prev) => ({ ...prev, durationValue: "" }));
      return;
    }
    const start = new Date(form.startDateTime);
    const end = new Date(form.endDateTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setForm((prev) => ({ ...prev, durationValue: "" }));
      return;
    }
    let diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) {
      setForm((prev) => ({ ...prev, durationValue: "" }));
      return;
    }
    const msInHour = 1000 * 60 * 60;
    const msInDay = msInHour * 24;
    const days = Math.floor(diffMs / msInDay);
    diffMs -= days * msInDay;
    const hours = Math.floor(diffMs / msInHour);
    let durationText = "";
    if (days > 0) {
      durationText = `${days} gün`;
      if (hours > 0) {
        durationText += ` ${hours} saat`;
      }
    } else {
      durationText = `${hours} saat`;
    }
    setForm((prev) => ({ ...prev, durationValue: durationText }));
  }, [form.startDateTime, form.endDateTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.startDateTime ||
      !form.endDateTime ||
      !form.leaveType ||
      !form.durationValue ||
      !form.unit ||
      !form.contactInfo
    ) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }
    const start = new Date(form.startDateTime);
    const end = new Date(form.endDateTime);
    if (start >= end) {
      toast.error("İzin başlangıç tarihi, bitiş tarihinden önce olmalıdır.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      // Form verilerini FormData'ya ekle
      // 'file' dahil tüm alanlar
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value as string | Blob);
        }
      });

      // ARTIK TEK BİR API ÇAĞRISI YAPIYORUZ
      const res = await fetch("/api/leave", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // BAŞARILI İSE API'DEN PDF BLOB'U GELİYOR
        await Swal.fire({
          icon: "success",
          title: "Başarılı!",
          text: "İzin talebiniz alındı ve belgeniz oluşturuldu.",
          background: "#1a1a1a",
          color: "#ffffff",
          confirmButtonColor: "#3b82f6",
          timer: 2000,
          showConfirmButton: false,
        });

        const blob = await res.blob();
        setPreviewUrl(URL.createObjectURL(blob));
      } else {
        // HATA DURUMUNU İŞLE
        const data = await res.json();
        toast.error(data.error || "Bir hata oluştu.");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Sunucuya bağlanırken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";
  const labelBaseClasses =
    "flex items-center gap-2.5 mb-2 text-gray-300 font-medium";

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!previewUrl ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full max-w-3xl"
            >
              <h1 className="text-4xl font-bold mb-10 text-center text-white tracking-tight flex items-center justify-center gap-4">
                <FiClipboard size={32} />
                Yeni İzin Talebi Oluştur
              </h1>
              <form
                onSubmit={handleSubmit}
                className="space-y-7 bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60"
              >
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-7">
                  <div>
                    <label className={labelBaseClasses}>
                      <FiCalendar className="text-gray-500" />
                      İzin Başlangıç{" "}
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={form.startDateTime}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e) =>
                        setForm({ ...form, startDateTime: e.target.value })
                      }
                      className={inputBaseClasses}
                    />
                  </div>
                  <div>
                    <label className={labelBaseClasses}>
                      <FiCalendar className="text-gray-500" />
                      İzin Bitiş{" "}
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={form.endDateTime}
                      onChange={(e) =>
                        setForm({ ...form, endDateTime: e.target.value })
                      }
                      className={inputBaseClasses}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelBaseClasses}>
                    <FiClipboard className="text-gray-500" />
                    İzin Türü <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    value={form.leaveType}
                    onChange={(e) =>
                      setForm({ ...form, leaveType: e.target.value })
                    }
                    className={`${inputBaseClasses} appearance-none`}
                  >
                    <option value="YILLIK">Yıllık</option>
                    <option value="MAZERET">Mazeret</option>
                    <option value="HASTALIK">Hastalık</option>
                    <option value="UCRETSIZ">Ücretsiz</option>
                    <option value="IDARI">İdari</option>
                  </select>
                </div>
                <div>
                  <label className={labelBaseClasses}>
                    <FiClock className="text-gray-500" />
                    Hesaplanan Süre
                  </label>
                  <input
                    type="text"
                    value={form.durationValue}
                    readOnly
                    className={`${inputBaseClasses} bg-black/50 text-gray-400 cursor-not-allowed border-gray-800`}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-7">
                  <div>
                    <label className={labelBaseClasses}>
                      <FiUsers className="text-gray-500" />
                      Görevli Birim{" "}
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.unit}
                      onChange={(e) =>
                        setForm({ ...form, unit: e.target.value })
                      }
                      className={inputBaseClasses}
                    />
                  </div>
                  <div>
                    <label className={labelBaseClasses}>
                      <FiMail className="text-gray-500" />
                      İletişim Bilgisi{" "}
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.contactInfo}
                      onChange={(e) =>
                        setForm({ ...form, contactInfo: e.target.value })
                      }
                      className={inputBaseClasses}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelBaseClasses}>
                    <FiFileText className="text-gray-500" />
                    Açıklama (Opsiyonel)
                  </label>
                  <textarea
                    value={form.explanation}
                    onChange={(e) =>
                      setForm({ ...form, explanation: e.target.value })
                    }
                    rows={3}
                    className={`${inputBaseClasses} resize-y`}
                  />
                </div>
                <div>
                  <label className={labelBaseClasses}>
                    <FiFileText className="text-gray-500" />
                    Rapor / Dosya Yükle (Opsiyonel)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      setForm({ ...form, file: e.target.files?.[0] || null })
                    }
                    className={`${inputBaseClasses} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700/60 file:text-gray-200 hover:file:bg-gray-600/60`}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={
                    !submitting
                      ? { scale: 1.02, backgroundColor: "#2563eb" }
                      : {}
                  }
                  whileTap={!submitting ? { scale: 0.98 } : {}}
                  className="w-full flex items-center justify-center mt-4 bg-blue-600 text-white py-3.5 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FiLoader className="mr-2 animate-spin" /> Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <FiSend className="mr-2" /> Talebi Onaya Gönder
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <FiFileText size={28} />
                  İzin Belgesi Önizleme
                </h2>
                <motion.button
                  onClick={() => {
                    setPreviewUrl(null);
                    setForm({
                      startDateTime: "",
                      endDateTime: "",
                      leaveType: "HASTALIK",
                      durationValue: "",
                      explanation: "",
                      unit: "",
                      contactInfo: "",
                      file: null,
                    });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl transition-all duration-300 border border-white/20 font-medium"
                >
                  <FiArrowLeft />
                  <span>Yeni Talep Oluştur</span>
                </motion.button>
              </div>
              <iframe
                src={previewUrl}
                className="w-full h-[80vh] border border-white/10 rounded-2xl shadow-2xl bg-white"
                title="İzin Belgesi"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
