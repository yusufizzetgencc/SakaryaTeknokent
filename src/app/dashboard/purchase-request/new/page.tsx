"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiShoppingCart,
  FiArchive,
  FiTag,
  FiMessageSquare,
  FiHash,
  FiBox,
  FiSend,
  FiLoader,
} from "react-icons/fi";

interface PurchaseCategory {
  id: string;
  name: string;
}

export default function NewPurchaseRequestPage() {
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---
  const [birim, setBirim] = useState("");
  const [malzeme, setMalzeme] = useState("");
  const [malzemeOzellik, setMalzemeOzellik] = useState("");
  const [ihtiyacSebebi, setIhtiyacSebebi] = useState("");
  const [miktar, setMiktar] = useState<number | "">("");
  const [kategoriOptions, setKategoriOptions] = useState<PurchaseCategory[]>(
    []
  );
  const [kategori, setKategori] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchKategoriOptions();
  }, []);

  async function fetchKategoriOptions() {
    try {
      const res = await fetch("/api/purchase-categories");
      const data = await res.json();
      if (res.ok) {
        setKategoriOptions(data.categories);
      } else {
        toast.error(data.error || "Kategoriler yüklenemedi");
      }
    } catch {
      toast.error("Sunucu hatası");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birim || !malzeme || !ihtiyacSebebi || !miktar || !kategori) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/purchase-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birim,
          malzeme,
          malzemeOzellik,
          ihtiyacSebebi,
          miktar,
          kategoriId: kategori,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Bir hata oluştu.");
      } else {
        toast.success("Satın alma talebi başarıyla oluşturuldu!");
        setBirim("");
        setMalzeme("");
        setMalzemeOzellik("");
        setIhtiyacSebebi("");
        setMiktar("");
        setKategori("");
        router.refresh();
      }
    } catch {
      toast.error("Sunucu hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  // Tasarım için ortak sınıflar
  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";
  const labelBaseClasses =
    "flex items-center gap-2.5 mb-2 text-gray-300 font-medium";

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="w-full max-w-3xl"
        >
          <h1 className="text-4xl font-bold mb-10 text-center text-white tracking-tight flex items-center justify-center gap-4">
            <FiShoppingCart size={32} />
            Yeni Satın Alma Talebi
          </h1>
          <form
            onSubmit={handleSubmit}
            className="space-y-7 bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60"
          >
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-7">
              <div>
                <label htmlFor="birim" className={labelBaseClasses}>
                  <FiArchive className="text-gray-500" /> Birim{" "}
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="birim"
                  type="text"
                  value={birim}
                  onChange={(e) => setBirim(e.target.value)}
                  required
                  className={inputBaseClasses}
                />
              </div>
              <div>
                <label htmlFor="malzeme" className={labelBaseClasses}>
                  <FiBox className="text-gray-500" /> Malzeme{" "}
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="malzeme"
                  type="text"
                  value={malzeme}
                  onChange={(e) => setMalzeme(e.target.value)}
                  required
                  className={inputBaseClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="malzemeOzellik" className={labelBaseClasses}>
                <FiMessageSquare className="text-gray-500" /> Malzeme
                Özellikleri
              </label>
              <textarea
                id="malzemeOzellik"
                value={malzemeOzellik}
                onChange={(e) => setMalzemeOzellik(e.target.value)}
                rows={3}
                className={`${inputBaseClasses} resize-y`}
              />
            </div>

            <div>
              <label htmlFor="ihtiyacSebebi" className={labelBaseClasses}>
                <FiMessageSquare className="text-gray-500" /> İhtiyaç Sebebi{" "}
                <span className="text-red-500 font-bold">*</span>
              </label>
              <textarea
                id="ihtiyacSebebi"
                value={ihtiyacSebebi}
                onChange={(e) => setIhtiyacSebebi(e.target.value)}
                rows={3}
                required
                className={`${inputBaseClasses} resize-y`}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-x-6 gap-y-7">
              <div>
                <label htmlFor="miktar" className={labelBaseClasses}>
                  <FiHash className="text-gray-500" /> Miktar{" "}
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="miktar"
                  type="number"
                  value={miktar}
                  onChange={(e) => setMiktar(Number(e.target.value))}
                  min={1}
                  required
                  className={inputBaseClasses}
                />
              </div>
              <div>
                <label htmlFor="kategori" className={labelBaseClasses}>
                  <FiTag className="text-gray-500" /> Kategori{" "}
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  id="kategori"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  required
                  className={`${inputBaseClasses} appearance-none`}
                >
                  <option value="">Kategori seçiniz...</option>
                  {kategoriOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full flex items-center justify-center mt-4 bg-blue-600 text-white py-3.5 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <motion.div
                    className="mr-2"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <FiLoader />
                  </motion.div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <FiSend className="mr-2" />
                  Talep Oluştur
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </>
  );
}
