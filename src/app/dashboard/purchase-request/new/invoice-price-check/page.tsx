"use client";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import Swal from "sweetalert2";
import { motion, Variants } from "framer-motion";
import {
  FiCheck,
  FiX,
  FiStar,
  FiLoader,
  FiAlertCircle,
  FiBox,
  FiUser,
  FiDollarSign,
  FiExternalLink,
} from "react-icons/fi";

// Interface'ler
interface Invoice {
  id: string;
  fileUrl: string;
  amount: number;
  approved?: boolean;
  rejectionReason?: string | null;
  supplierRated?: boolean;
}
interface Offer {
  supplierId: string;
  [key: string]: unknown;
}
interface PurchaseRequest {
  id: string;
  malzeme: string;
  birim: string;
  miktar: number;
  kategori?: { name: string };
  user: { firstName: string; lastName: string };
  invoices: Invoice[];
  stageLabel?: string;
  selectedOffer?: string | Offer;
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

export default function InvoicePriceCheckPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/purchase-request/new/invoice-price-check");
    const data = await res.json();
    if (data.success) setRequests(data.requests);
    else toast.error("Onaylanacak faturalar yüklenemedi.");
    setLoading(false);
  }

  async function handleAction(
    id: string,
    invoiceId: string,
    action: "approve" | "reject"
  ) {
    if (action === "reject") {
      const { value: reason } = await Swal.fire({
        title: "Faturayı Reddet",
        input: "textarea",
        inputPlaceholder: "Reddetme sebebini buraya yazınız...",
        inputAttributes: { "aria-label": "Reddetme sebebini buraya yazınız" },
        showCancelButton: true,
        confirmButtonText: "Evet, Reddet",
        cancelButtonText: "İptal",
        background: "#1a1a1a",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#4b5563",
        inputValidator: (value) => {
          if (!value) return "Red sebebi zorunludur!";
        },
      });
      if (!reason) return;

      setActionLoading(id);
      const res = await fetch("/api/purchase-request/new/invoice-price-check", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          invoiceId,
          action,
          rejectionReason: reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Fatura reddedildi.");
        fetchData();
      } else toast.error(data.error || "Hata oluştu.");
      setActionLoading(null);
      return;
    }

    setActionLoading(id);
    const res = await fetch("/api/purchase-request/new/invoice-price-check", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, invoiceId, action }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Fatura onaylandı.");
      fetchData();
    } else toast.error(data.error || "Hata oluştu.");
    setActionLoading(null);
  }

  const handleRatingChange = (id: string, value: number) => {
    setRatings((prev) => ({ ...prev, [id]: value }));
  };

  async function handleEvaluateSupplier(
    id: string,
    selectedOffer?: string | Offer
  ) {
    if (!ratings[id]) {
      toast.error("Lütfen bir puan seçin.");
      return;
    }
    if (!selectedOffer) {
      toast.error("Tedarikçi bilgisi bulunamadı.");
      return;
    }

    let supplierId: string | undefined;
    try {
      const offer =
        typeof selectedOffer === "string"
          ? JSON.parse(selectedOffer)
          : selectedOffer;
      supplierId = offer.supplierId;
    } catch {
      toast.error("Geçersiz tedarikçi verisi.");
      return;
    }
    if (!supplierId) {
      toast.error("Tedarikçi kimliği alınamadı.");
      return;
    }

    setActionLoading(id);
    const res = await fetch("/api/purchase-request/new/invoice-price-check", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        action: "rateSupplier",
        supplierId,
        rating: ratings[id],
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Tedarikçi başarıyla değerlendirildi.");
      setRatings((prev) => ({ ...prev, [id]: 0 }));
      fetchData();
    } else toast.error(data.error || "Puan kaydedilemedi.");
    setActionLoading(null);
  }

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";

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
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-10 text-white tracking-tight flex items-center gap-4"
          >
            <FiDollarSign size={32} /> Fatura Fiyat Kontrolü
          </motion.h1>

          {requests.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white/5 border border-white/10 rounded-2xl">
              <FiAlertCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white/70 text-lg">
                Onaylanacak fatura bulunmamaktadır.
              </p>
            </div>
          ) : (
            <motion.ul
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {requests.map((req) => (
                <motion.li
                  key={req.id}
                  variants={itemVariants}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg space-y-4"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                        <FiBox /> {req.malzeme} ({req.miktar} {req.birim})
                      </h2>
                      <p className="text-sm text-white/70 flex items-center gap-2 mt-1">
                        <FiUser /> {req.user.firstName} {req.user.lastName}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-sm font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                      {req.stageLabel}
                    </div>
                  </div>

                  {req.invoices.length === 0 ? (
                    <div className="text-center py-6 text-red-400 font-semibold bg-red-500/10 rounded-lg">
                      Fatura yüklenmemiş.
                    </div>
                  ) : (
                    req.invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="border-t border-white/10 pt-4 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <a
                              href={inv.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition font-semibold"
                            >
                              <FiExternalLink />
                              Fatura Dosyasını Görüntüle
                            </a>
                            <p className="text-white/80 mt-1">
                              Tutar:{" "}
                              <span className="font-bold text-white">
                                {inv.amount.toLocaleString("tr-TR", {
                                  style: "currency",
                                  currency: "TRY",
                                })}
                              </span>
                            </p>
                          </div>
                          {/* Fatura Durumu */}
                          {inv.approved && (
                            <div className="flex items-center gap-2 text-green-300 font-semibold bg-green-500/10 px-3 py-1.5 rounded-lg">
                              <FiCheck />
                              Onaylandı
                            </div>
                          )}
                          {inv.rejectionReason && (
                            <div className="text-red-300 font-semibold bg-red-500/10 px-3 py-1.5 rounded-lg">
                              <FiX />
                              Reddedildi: {inv.rejectionReason}
                            </div>
                          )}
                        </div>

                        {/* Eylemler */}
                        {actionLoading === req.id ? (
                          <div className="flex justify-center p-4">
                            <FiLoader className="animate-spin h-6 w-6 text-white" />
                          </div>
                        ) : !inv.approved && !inv.rejectionReason ? (
                          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                            <button
                              onClick={() =>
                                handleAction(req.id, inv.id, "reject")
                              }
                              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-5 py-2.5 rounded-lg font-semibold transition-colors"
                            >
                              <FiX />
                              Faturayı Reddet
                            </button>
                            <button
                              onClick={() =>
                                handleAction(req.id, inv.id, "approve")
                              }
                              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-5 py-2.5 rounded-lg font-semibold transition-colors"
                            >
                              <FiCheck />
                              Faturayı Onayla
                            </button>
                          </div>
                        ) : inv.approved && !inv.supplierRated ? (
                          <div className="bg-black/20 p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4">
                            <label className="font-semibold text-white flex-shrink-0">
                              Tedarikçi Puanı:
                            </label>
                            <select
                              value={ratings[req.id] || ""}
                              onChange={(e) =>
                                handleRatingChange(
                                  req.id,
                                  parseInt(e.target.value)
                                )
                              }
                              className={`${inputBaseClasses} sm:w-40 appearance-none`}
                            >
                              <option value="">Seçiniz...</option>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <option key={n} value={n}>
                                  {"★".repeat(n)}
                                </option>
                              ))}
                            </select>
                            <button
                              disabled={!ratings[req.id]}
                              onClick={() =>
                                handleEvaluateSupplier(
                                  req.id,
                                  req.selectedOffer
                                )
                              }
                              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                              <FiStar />
                              Değerlendir
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </>
  );
}
