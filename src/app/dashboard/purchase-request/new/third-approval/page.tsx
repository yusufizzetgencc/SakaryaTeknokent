"use client";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import Swal from "sweetalert2";
import { motion, Variants } from "framer-motion";
import {
  FiPlus,
  FiSave,
  FiLoader,
  FiAlertCircle,
  FiBox,
  FiUser,
  FiDollarSign,
  FiBriefcase,
  FiThumbsUp,
  FiThumbsDown,
} from "react-icons/fi";

// Interface'ler
interface Supplier {
  id: string;
  companyName: string;
  firmaAdi?: string;
}
interface Offer {
  supplierId: string;
  price: number;
  supplierName: string;
  status?: string;
}
interface PurchaseRequest {
  id: string;
  malzeme: string;
  birim: string;
  miktar: number;
  kategori?: { name: string };
  user: { firstName: string; lastName: string };
  offers?: Offer[];
  approved?: boolean;
  rejected?: boolean;
  rejectionReason?: string;
  stage?: number;
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

export default function ThirdApprovalPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejection, setRejection] = useState<Record<string, string>>({});
  const [selectedOffer, setSelectedOffer] = useState<Record<string, number>>(
    {}
  );
  const [editOffers, setEditOffers] = useState<Record<string, Offer[]>>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [r1, r2]: [
      { success: boolean; requests: PurchaseRequest[] },
      { success: boolean; suppliers: Supplier[] }
    ] = await Promise.all([
      fetch("/api/purchase-request/new/third-approval").then((r) => r.json()),
      fetch("/api/suppliers").then((r) => r.json()),
    ]);
    if (r1.success) setRequests(r1.requests);
    if (r2.success)
      setSuppliers(
        (r2.suppliers || []).map((s: Supplier) => ({
          id: s.id,
          companyName: s.companyName || s.firmaAdi || "",
        }))
      );
    setLoading(false);
  }

  const handleApprove = async (id: string) => {
    if (typeof selectedOffer[id] !== "number") {
      toast.error("Onaylamak için bir teklif seçmelisiniz.");
      return;
    }
    const result = await Swal.fire({
      title: "Teklifi Onayla",
      text: "Bu teklifi onaylayıp satın alma sürecini tamamlamak istediğinizden emin misiniz?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet, Onayla ve Bitir",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#4b5563",
    });
    if (!result.isConfirmed) return;

    const res = await fetch("/api/purchase-request/new/third-approval", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        action: "approve",
        selectedOfferIndex: selectedOffer[id],
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Satın alma başarıyla onaylandı.");
      fetchData();
    } else {
      toast.error(data.error || "Hata oluştu.");
    }
  };

  const handleReject = async (id: string) => {
    if (!rejection[id]) {
      toast.error("Red gerekçesi girin.");
      return;
    }
    const res = await fetch("/api/purchase-request/new/third-approval", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        action: "reject",
        rejectionReason: rejection[id],
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Talep reddedildi.");
      fetchData();
    } else {
      toast.error(data.error || "Hata oluştu.");
    }
  };

  const handleSaveNewOffers = async (id: string) => {
    const offers = editOffers[id] || [];
    if (!offers.length) {
      toast.error("Kaydetmek için en az bir teklif girin.");
      return;
    }
    await fetch("/api/purchase-request/new/third-approval", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "newOffer", newOffers: offers }),
    });
    toast.success("Yeni teklifler kaydedildi, talep tekrar onaya sunuldu.");
    fetchData();
  };

  const addNewOffer = (requestId: string) => {
    if (suppliers.length === 0) {
      toast.info(
        "Teklif eklemek için önce sisteme tedarikçi kaydı yapılmalıdır."
      );
      return;
    }
    setEditOffers((prev) => {
      const curr = prev[requestId] || [];
      return {
        ...prev,
        [requestId]: [
          ...curr,
          {
            supplierId: suppliers[0]?.id || "",
            price: 0,
            supplierName: suppliers[0]?.companyName || "",
          },
        ],
      };
    });
  };

  const updateNewOffer = (
    requestId: string,
    idx: number,
    field: keyof Offer,
    value: string | number
  ) => {
    setEditOffers((prev) => {
      const curr = [...(prev[requestId] || [])];
      const updated: Offer = {
        ...curr[idx],
        [field]: value,
        supplierName:
          suppliers.find(
            (s) =>
              s.id === (field === "supplierId" ? value : curr[idx].supplierId)
          )?.companyName || "",
      };
      curr[idx] = updated;
      return { ...prev, [requestId]: curr };
    });
  };

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
        <div className="max-w-full mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-10 text-white tracking-tight flex items-center gap-4"
          >
            <FiThumbsUp size={32} /> Satın Alma Onay (Müdür Onayı)
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
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <FiBox /> {req.malzeme} ({req.miktar} {req.birim})
                      </h2>
                      <p className="text-sm text-white/70 flex items-center gap-2 mt-1">
                        <FiUser /> {req.user.firstName} {req.user.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Reddedilmiş ve yeni teklif bekleyen durum */}
                  {req.rejected && (!req.offers || req.offers.length === 0) ? (
                    <div className="bg-red-500/10 p-4 rounded-lg">
                      <p className="text-red-300 font-semibold mb-4">
                        Bu talep önceki aşamada reddedildi. Sürece devam etmek
                        için yeni teklifler girilmelidir.
                      </p>
                      <div className="space-y-3">
                        {(editOffers[req.id] || []).map((offer, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col md:flex-row gap-3 items-center"
                          >
                            <div className="relative w-full">
                              <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                              <select
                                className={`${inputBaseClasses} pl-8 appearance-none`}
                                value={offer.supplierId}
                                onChange={(e) =>
                                  updateNewOffer(
                                    req.id,
                                    idx,
                                    "supplierId",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Tedarikçi seç...</option>
                                {suppliers.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.companyName}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="relative w-full md:w-40">
                              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                              <input
                                type="number"
                                min={0}
                                placeholder="Fiyat"
                                className={`${inputBaseClasses} pl-8`}
                                value={offer.price}
                                onChange={(e) =>
                                  updateNewOffer(
                                    req.id,
                                    idx,
                                    "price",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-4">
                        <button
                          onClick={() => addNewOffer(req.id)}
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition text-sm font-semibold"
                        >
                          <FiPlus />
                          Yeni Teklif Ekle
                        </button>
                        <button
                          onClick={() => handleSaveNewOffers(req.id)}
                          disabled={
                            !(
                              editOffers[req.id] &&
                              editOffers[req.id].length > 0
                            )
                          }
                          className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition text-sm font-semibold disabled:opacity-50"
                        >
                          <FiSave />
                          Teklifleri Kaydet ve Onaya Gönder
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 mb-6">
                        <h3 className="font-semibold text-white">
                          Lütfen onaylanacak teklifi seçiniz:
                        </h3>
                        {(req.offers || []).map((offer, idx) => (
                          <label
                            key={idx}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                              selectedOffer[req.id] === idx
                                ? "bg-blue-500/20 border-blue-400"
                                : "bg-black/20 border-transparent hover:border-white/20"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`select-offer-${req.id}`}
                              checked={selectedOffer[req.id] === idx}
                              onChange={() =>
                                setSelectedOffer({
                                  ...selectedOffer,
                                  [req.id]: idx,
                                })
                              }
                              className="form-radio bg-transparent border-gray-600 text-blue-500 h-5 w-5 focus:ring-blue-500"
                            />
                            <span className="flex-grow font-semibold text-white">
                              {offer.supplierName}
                            </span>
                            <span className="text-blue-300 font-bold">
                              {offer.price.toLocaleString("tr-TR", {
                                style: "currency",
                                currency: "TRY",
                              })}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                        <input
                          type="text"
                          placeholder="Talebi reddetmek için gerekçenizi girin..."
                          className={inputBaseClasses}
                          value={rejection[req.id] || ""}
                          onChange={(e) =>
                            setRejection((prev) => ({
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
                            <FiThumbsDown />
                            Talebi Reddet
                          </button>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2.5 rounded-lg font-semibold transition-colors"
                          >
                            <FiThumbsUp />
                            Seçilen Teklifi Onayla
                          </button>
                        </div>
                      </div>
                    </>
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
