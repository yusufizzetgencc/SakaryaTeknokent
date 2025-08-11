"use client";

import React, { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import Swal from "sweetalert2";
import { motion, Variants } from "framer-motion";
import {
  FiCheckSquare,
  FiXCircle,
  FiPlus,
  FiSave,
  FiLoader,
  FiAlertCircle,
  FiBox,
  FiArchive,
  FiLayers,
  FiTag,
  FiUser,
  FiMessageSquare,
  FiDollarSign,
  FiBriefcase,
  FiCheck,
} from "react-icons/fi";

// Interface'ler
interface Supplier {
  id: string;
  companyName: string;
}
interface RawSupplier {
  id: string;
  firmaAdi: string;
}
interface OfferInput {
  supplierId: string;
  price: number;
  supplierName?: string;
}
interface PurchaseRequest {
  id: string;
  birim: string;
  malzeme: string;
  miktar: number;
  ihtiyacSebebi: string;
  kategori?: { name: string };
  user: { firstName: string; lastName: string };
  offers?: OfferInput[];
  approved?: boolean;
  rejected?: boolean;
  rejectionReason?: string;
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

export default function SecondApprovalPage() {
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>(
    {}
  );
  const [offerInputs, setOfferInputs] = useState<Record<string, OfferInput[]>>(
    {}
  );

  useEffect(() => {
    fetchRequests();
    fetchSuppliers();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await fetch("/api/purchase-request/new/second-approval");
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
        const offersState: Record<string, OfferInput[]> = {};
        data.requests.forEach((req: PurchaseRequest) => {
          if (req.offers && Array.isArray(req.offers))
            offersState[req.id] = req.offers;
        });
        setOfferInputs(offersState);
      } else {
        toast.error("Talepler alınırken hata oluştu.");
      }
    } catch (error) {
      toast.error("Sunucu ile bağlantı kurulamadı." + error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSuppliers() {
    try {
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      if (data.success) {
        setSuppliers(
          (data.suppliers as RawSupplier[]).map((s) => ({
            id: s.id,
            companyName: s.firmaAdi,
          }))
        );
      }
    } catch {
      toast.error("Tedarikçi listesi alınırken hata oluştu.");
    }
  }

  const handleApprove = async (id: string) => {
    const offers = offerInputs[id] || [];
    if (offers.length === 0) {
      toast.error("Onaylamadan önce en az bir teklif girilmelidir.");
      return;
    }
    const result = await Swal.fire({
      title: "Onaylamak istediğinize emin misiniz?",
      text: "Bu talep bir sonraki onay aşamasına gönderilecektir.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet, Onayla",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#4b5563",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch("/api/purchase-request/new/second-approval", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action: "approve",
          offers: offers.map((offer) => ({
            ...offer,
            supplierName:
              suppliers.find((s) => s.id === offer.supplierId)?.companyName ||
              "",
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Talep onaylandı.");
        fetchRequests();
      } else {
        toast.error("Onaylama işlemi başarısız oldu.");
      }
    } catch {
      toast.error("Bir hata oluştu.");
    }
  };

  const handleReject = async (id: string) => {
    const reason = rejectReasons[id];
    if (!reason) {
      toast.error("Lütfen reddetme gerekçesini giriniz.");
      return;
    }
    try {
      const res = await fetch("/api/purchase-request/new/second-approval", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reject", rejectionReason: reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Talep reddedildi.");
        fetchRequests();
      } else {
        toast.error("Reddetme işlemi başarısız oldu.");
      }
    } catch {
      toast.error("Bir hata oluştu.");
    }
  };

  const handleSaveOffers = async (id: string) => {
    const offers = offerInputs[id] || [];
    try {
      const res = await fetch("/api/purchase-request/new/second-approval", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action: "saveOffers",
          offers: offers.map((offer) => ({
            ...offer,
            supplierName:
              suppliers.find((s) => s.id === offer.supplierId)?.companyName ||
              "",
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Teklifler kaydedildi.");
        fetchRequests();
      } else {
        toast.error("Teklifler kaydedilemedi.");
      }
    } catch {
      toast.error("Bir hata oluştu.");
    }
  };

  const addOfferInput = (requestId: string) => {
    setOfferInputs((prev) => {
      const current = prev[requestId] || [];
      if (suppliers.length === 0) {
        toast.info(
          "Teklif eklemek için önce sisteme tedarikçi kaydı yapılmalıdır."
        );
        return prev;
      }
      return {
        ...prev,
        [requestId]: [...current, { price: 0, supplierId: suppliers[0].id }],
      };
    });
  };

  const updateOfferInput = (
    requestId: string,
    index: number,
    field: keyof OfferInput,
    value: string | number
  ) => {
    setOfferInputs((prev) => {
      const current = [...(prev[requestId] || [])];
      current[index] = { ...current[index], [field]: value };
      return { ...prev, [requestId]: current };
    });
  };
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="w-10 h-10 animate-spin text-white" />
          <p className="text-white/60 text-lg">Talepler Yükleniyor...</p>
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
            <FiCheckSquare size={32} /> Satın Alma Onay (2. Aşama)
          </motion.h1>

          {requests.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white/5 border border-white/10 rounded-2xl">
              <FiAlertCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white/70 text-lg">
                Onayınızda bekleyen bir satın alma talebi bulunmamaktadır.
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
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg"
                >
                  {/* Talep Detayları */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm text-white/80 mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <FiBox className="flex-shrink-0 text-blue-400" />
                      <div>
                        <strong>Malzeme:</strong>
                        <span className="ml-2 text-white/95">
                          {req.malzeme}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiArchive className="flex-shrink-0 text-blue-400" />
                      <div>
                        <strong>Birim:</strong>
                        <span className="ml-2 text-white/95">{req.birim}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiLayers className="flex-shrink-0 text-blue-400" />
                      <div>
                        <strong>Miktar:</strong>
                        <span className="ml-2 text-white/95">{req.miktar}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiTag className="flex-shrink-0 text-blue-400" />
                      <div>
                        <strong>Kategori:</strong>
                        <span className="ml-2 text-white/95">
                          {req.kategori?.name || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiUser className="flex-shrink-0 text-blue-400" />
                      <div>
                        <strong>Talep Eden:</strong>
                        <span className="ml-2 text-white/95">
                          {req.user.firstName} {req.user.lastName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 md:col-span-2 lg:col-span-3">
                      <FiMessageSquare className="flex-shrink-0 text-blue-400" />
                      <div>
                        <strong>İhtiyaç Sebebi:</strong>
                        <span className="ml-2 text-white/95">
                          {req.ihtiyacSebebi}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Duruma Göre İçerik */}
                  {!req.approved && !req.rejected ? (
                    <div className="space-y-6">
                      {/* Teklif Girişi */}
                      <div>
                        <h3 className="font-semibold mb-4 text-white text-lg">
                          Teklifler
                        </h3>
                        <div className="space-y-3">
                          {(offerInputs[req.id] || []).map((offer, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col md:flex-row gap-3 items-center"
                            >
                              <div className="relative w-full md:w-40">
                                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="Fiyat"
                                  className={`${inputBaseClasses} pl-8`}
                                  value={offer.price}
                                  onChange={(e) =>
                                    updateOfferInput(
                                      req.id,
                                      idx,
                                      "price",
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              </div>
                              <div className="relative w-full">
                                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <select
                                  className={`${inputBaseClasses} pl-8 appearance-none`}
                                  value={offer.supplierId}
                                  onChange={(e) =>
                                    updateOfferInput(
                                      req.id,
                                      idx,
                                      "supplierId",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Tedarikçi seçiniz...</option>
                                  {suppliers.map((sup) => (
                                    <option key={sup.id} value={sup.id}>
                                      {sup.companyName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-4 mt-4">
                          <button
                            onClick={() => addOfferInput(req.id)}
                            disabled={suppliers.length === 0}
                            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiPlus />
                            Teklif Ekle
                          </button>
                          <button
                            onClick={() => handleSaveOffers(req.id)}
                            disabled={
                              !(
                                offerInputs[req.id] &&
                                offerInputs[req.id].length > 0
                              )
                            }
                            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition text-sm font-semibold disabled:opacity-50"
                          >
                            <FiSave />
                            Teklifleri Kaydet
                          </button>
                        </div>
                      </div>

                      {/* Red/Onay Girişi */}
                      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                        <input
                          type="text"
                          placeholder="Reddedilecekse gerekçeyi buraya girin..."
                          className={inputBaseClasses}
                          value={rejectReasons[req.id] || ""}
                          onChange={(e) =>
                            setRejectReasons((prev) => ({
                              ...prev,
                              [req.id]: e.target.value,
                            }))
                          }
                        />
                        <div className="flex-shrink-0 flex gap-3">
                          <button
                            onClick={() => handleReject(req.id)}
                            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2.5 rounded-lg font-semibold transition-colors"
                          >
                            <FiXCircle />
                            Reddet
                          </button>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2.5 rounded-lg font-semibold transition-colors"
                          >
                            <FiCheck />
                            Onayla ve İlet
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : req.approved ? (
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-full font-semibold text-sm select-none bg-green-500/20 text-green-300">
                      <FiCheck />
                      <span>Onaylandı, üst onay aşamasına iletildi.</span>
                    </div>
                  ) : (
                    // rejected
                    <div className="text-sm text-red-300/80 bg-red-500/10 p-4 rounded-lg">
                      <strong>Red Sebebi:</strong>
                      <p className="whitespace-pre-wrap mt-1 text-red-300/90">
                        {req.rejectionReason}
                      </p>
                    </div>
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
