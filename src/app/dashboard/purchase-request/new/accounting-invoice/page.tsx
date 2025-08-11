"use client";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { motion, Variants } from "framer-motion";
import {
  FiSave,
  FiLoader,
  FiAlertCircle,
  FiBox,
  FiUser,
  FiExternalLink,
  FiPercent,
  FiHash,
  FiDollarSign,
} from "react-icons/fi";

// Interface'ler
interface Invoice {
  id: string;
  fileUrl: string;
  amount: number;
  kdvOrani?: number;
  kdvTutari?: number;
  toplamTutar?: number;
  approved?: boolean;
  purchase: {
    malzeme: string;
    miktar: number;
    birim: string;
    user: { firstName: string; lastName: string };
    kategori?: { name: string };
  };
}

// Framer Motion için animasyon varyantları (tip uyumlu)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100 },
  },
};

export default function AccountingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editKdvRate, setEditKdvRate] = useState<{ [key: string]: number }>({});
  const [editKdvAmount, setEditKdvAmount] = useState<{ [key: string]: number }>(
    {}
  );
  const [editTotalAmount, setEditTotalAmount] = useState<{
    [key: string]: number;
  }>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const res = await fetch("/api/purchase-request/new/accounting-invoice");
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices);
        const kdvRates: { [key: string]: number } = {};
        const kdvAmounts: { [key: string]: number } = {};
        const totalAmounts: { [key: string]: number } = {};
        data.invoices.forEach((inv: Invoice) => {
          kdvRates[inv.id] = inv.kdvOrani ?? 0;
          kdvAmounts[inv.id] = inv.kdvTutari ?? 0;
          totalAmounts[inv.id] = inv.toplamTutar ?? inv.amount;
        });
        setEditKdvRate(kdvRates);
        setEditKdvAmount(kdvAmounts);
        setEditTotalAmount(totalAmounts);
      } else {
        toast.error("Muhasebe faturaları yüklenemedi.");
      }
    } catch {
      toast.error("Sunucu ile bağlantı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (invoiceId: string) => {
    const kdvRate = editKdvRate[invoiceId];
    const kdvAmount = editKdvAmount[invoiceId];
    const totalAmount = editTotalAmount[invoiceId];
    if (kdvRate < 0 || kdvAmount < 0 || totalAmount < 0) {
      toast.error("Negatif değerler girilemez.");
      return;
    }
    setSavingId(invoiceId);
    try {
      const res = await fetch("/api/purchase-request/new/accounting-invoice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, kdvRate, kdvAmount, totalAmount }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Fatura başarıyla güncellendi.");
        fetchInvoices();
      } else {
        toast.error(data.error || "Güncelleme başarısız.");
      }
    } catch {
      toast.error("Sunucu hatası, güncelleme yapılamadı.");
    } finally {
      setSavingId(null);
    }
  };

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";
  const labelBaseClasses =
    "flex items-center gap-2 mb-1.5 text-xs text-gray-400 font-medium";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="w-10 h-10 animate-spin text-white" />
          <p className="text-white/60 text-lg">Faturalar Yükleniyor...</p>
        </div>
      </div>
    );
  }

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
            <FiDollarSign size={32} /> Muhasebe Fatura Kontrolü
          </motion.h1>

          {invoices.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white/5 border border-white/10 rounded-2xl">
              <FiAlertCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white/70 text-lg">
                İşlem bekleyen fatura bulunmamaktadır.
              </p>
            </div>
          ) : (
            <motion.ul
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {invoices.map((inv) => (
                <motion.li
                  key={inv.id}
                  variants={itemVariants}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg space-y-5"
                >
                  {/* Fatura Bilgileri */}
                  <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                      <FiBox /> {inv.purchase.malzeme} ({inv.purchase.miktar}{" "}
                      {inv.purchase.birim})
                    </h2>
                    <p className="text-sm text-white/70 flex items-center gap-2 mt-1">
                      <FiUser /> {inv.purchase.user.firstName}{" "}
                      {inv.purchase.user.lastName}
                    </p>
                    <a
                      href={inv.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition font-semibold mt-2 text-sm"
                    >
                      <FiExternalLink />
                      Fatura Dosyasını Görüntüle
                    </a>
                  </div>

                  {/* KDV ve Tutar Girişleri */}
                  <div className="border-t border-white/10 pt-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className={labelBaseClasses}>
                          <FiPercent />
                          KDV Oranı (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={editKdvRate[inv.id] ?? 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEditKdvRate((prev) => ({
                              ...prev,
                              [inv.id]: val,
                            }));
                            const kdvTutari = (val / 100) * inv.amount;
                            setEditKdvAmount((prev) => ({
                              ...prev,
                              [inv.id]: parseFloat(kdvTutari.toFixed(2)),
                            }));
                            setEditTotalAmount((prev) => ({
                              ...prev,
                              [inv.id]: parseFloat(
                                (inv.amount + kdvTutari).toFixed(2)
                              ),
                            }));
                          }}
                          className={inputBaseClasses}
                        />
                      </div>
                      <div>
                        <label className={labelBaseClasses}>
                          <FiHash />
                          KDV Tutarı (₺)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={editKdvAmount[inv.id] ?? 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEditKdvAmount((prev) => ({
                              ...prev,
                              [inv.id]: val,
                            }));
                            setEditTotalAmount((prev) => ({
                              ...prev,
                              [inv.id]: parseFloat(
                                (inv.amount + val).toFixed(2)
                              ),
                            }));
                          }}
                          className={inputBaseClasses}
                        />
                      </div>
                      <div>
                        <label className={labelBaseClasses}>
                          <FiDollarSign />
                          Toplam Tutar (₺)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={editTotalAmount[inv.id] ?? 0}
                          onChange={(e) =>
                            setEditTotalAmount((prev) => ({
                              ...prev,
                              [inv.id]: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className={inputBaseClasses}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kaydet Butonu */}
                  <div className="flex justify-end">
                    <motion.button
                      disabled={savingId === inv.id}
                      onClick={() => handleSave(inv.id)}
                      whileHover={savingId !== inv.id ? { scale: 1.05 } : {}}
                      whileTap={savingId !== inv.id ? { scale: 0.95 } : {}}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingId === inv.id ? (
                        <>
                          <FiLoader className="animate-spin" /> Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <FiSave /> Güncelle ve Tamamla
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </>
  );
}
