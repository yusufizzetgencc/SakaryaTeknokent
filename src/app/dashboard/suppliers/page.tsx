"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import {
  FiBriefcase,
  FiStar,
  FiPlusCircle,
  FiList,
  FiLoader,
} from "react-icons/fi";

interface Supplier {
  id: string;
  firmaAdi: string;
  yetkiliKisi: string;
  telefon: string;
  email: string;
  puan: number | null;
}

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function SuppliersPage() {
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [firmaAdi, setFirmaAdi] = useState("");
  const [yetkiliKisi, setYetkiliKisi] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    setLoading(true);
    try {
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Tedarikçi listesi yüklenemedi.");
        setSuppliers([]);
      } else {
        setSuppliers(data.suppliers);
      }
    } catch {
      toast.error("Sunucu hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firmaAdi || !yetkiliKisi || !telefon || !email) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmaAdi, yetkiliKisi, telefon, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Tedarikçi eklenemedi.");
      } else {
        toast.success("Tedarikçi başarıyla eklendi.");
        setFirmaAdi("");
        setYetkiliKisi("");
        setTelefon("");
        setEmail("");
        fetchSuppliers(); // Listeyi yenile
      }
    } catch {
      toast.error("Sunucu hatası. Lütfen tekrar deneyin.");
    } finally {
      setFormLoading(false);
    }
  }
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-10 text-white tracking-tight flex items-center gap-4"
          >
            <FiBriefcase size={32} />
            Tedarikçi Yönetimi
          </motion.h1>

          {/* Tedarikçi Ekleme Formu */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
              <FiPlusCircle /> Yeni Tedarikçi Ekle
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <input
                  type="text"
                  placeholder="Firma Adı *"
                  value={firmaAdi}
                  onChange={(e) => setFirmaAdi(e.target.value)}
                  className={inputBaseClasses}
                  required
                />
                <input
                  type="text"
                  placeholder="Yetkili Kişi *"
                  value={yetkiliKisi}
                  onChange={(e) => setYetkiliKisi(e.target.value)}
                  className={inputBaseClasses}
                  required
                />
                <input
                  type="tel"
                  placeholder="Telefon *"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  className={inputBaseClasses}
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputBaseClasses}
                  required
                />
              </div>
              <motion.button
                type="submit"
                disabled={formLoading}
                whileHover={!formLoading ? { scale: 1.02 } : {}}
                whileTap={!formLoading ? { scale: 0.98 } : {}}
                className="w-full md:w-auto float-right flex items-center justify-center mt-2 bg-blue-600 text-white px-8 py-3 rounded-xl text-md font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? (
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
                    Ekleniyor...
                  </>
                ) : (
                  "Tedarikçiyi Ekle"
                )}
              </motion.button>
            </form>
          </motion.section>

          {/* Tedarikçi Listesi */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 sm:p-4"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-3 p-4">
              <FiList /> Mevcut Tedarikçiler
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300 min-w-[800px]">
                <thead className="text-xs text-white/70 uppercase bg-white/5">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Firma Adı
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Yetkili Kişi
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Telefon
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Puan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10">
                        <FiLoader className="mx-auto animate-spin h-6 w-6 text-white" />
                      </td>
                    </tr>
                  ) : suppliers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-10 text-white/60"
                      >
                        Kayıtlı tedarikçi bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((s) => (
                      <motion.tr
                        key={s.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="border-b border-white/10 hover:bg-white/10 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 font-medium text-white">
                          {s.firmaAdi}
                        </td>
                        <td className="px-6 py-4">{s.yetkiliKisi}</td>
                        <td className="px-6 py-4">{s.telefon}</td>
                        <td className="px-6 py-4">{s.email}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 font-semibold text-yellow-400">
                            <FiStar className="flex-shrink-0" />
                            <span>{s.puan?.toFixed(2) ?? "N/A"}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}
