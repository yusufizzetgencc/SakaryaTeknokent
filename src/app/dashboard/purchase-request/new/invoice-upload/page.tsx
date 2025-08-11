"use client";
import React, { useEffect, useState, useRef } from "react";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import {
  FiUploadCloud,
  FiList,
  FiFile,
  FiDollarSign,
  FiLoader,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";

// Interface'ler
interface PurchaseRequest {
  id: string;
  malzeme: string;
  birim: string;
  miktar: number;
  user: { firstName: string; lastName: string };
}

export default function InvoiceUploadPage() {
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await fetch("/api/purchase-request/new/invoice-stage");
      const data = await res.json();
      if (data.success) setRequests(data.requests);
      else toast.error("Faturası yüklenecek talepler alınamadı.");
    } catch {
      toast.error("Sunucu ile bağlantı kurulamadı.");
    }
    setLoading(false);
  }

  async function handleUpload() {
    if (!selectedRequestId || !file || !amount) {
      toast.error(
        "Lütfen talep, fatura dosyası ve tutar bilgilerini eksiksiz girin."
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      toast.error("Dosya boyutu 10MB'den küçük olmalıdır.");
      return;
    }
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Sadece PDF, JPG, JPEG ve PNG dosyaları kabul edilmektedir.");
      return;
    }
    setUploading(true);
    try {
      const url = new URL(
        "/api/purchase-request/new/invoices",
        window.location.origin
      );
      url.searchParams.append("purchaseId", selectedRequestId);
      url.searchParams.append("amount", amount);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(url.toString(), {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Fatura başarıyla yüklendi ve süreç tamamlandı.");
        setFile(null);
        setAmount("");
        setSelectedRequestId(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchRequests();
      } else {
        toast.error(data.error || "Fatura yüklenirken hata oluştu.");
      }
    } catch (error) {
      toast.error("Fatura yüklenirken bir sunucu hatası oluştu." + error);
    } finally {
      setUploading(false);
    }
  }
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner disabled:opacity-50";
  const labelBaseClasses =
    "flex items-center gap-2.5 mb-2 text-gray-300 font-medium";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="w-10 h-10 animate-spin text-white" />
          <p className="text-white/60 text-lg">Veriler Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="w-full max-w-2xl"
        >
          <h1 className="text-4xl font-bold mb-10 text-center text-white tracking-tight flex items-center justify-center gap-4">
            <FiUploadCloud size={32} /> Fatura Yükleme
          </h1>

          {requests.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white/5 border border-white/10 rounded-2xl">
              <FiAlertCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white/70 text-lg">
                Faturası yüklenecek bir talep bulunmamaktadır.
              </p>
            </div>
          ) : (
            <div className="space-y-7 bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60">
              <div>
                <label htmlFor="request-select" className={labelBaseClasses}>
                  <FiList />
                  Onaylanmış Sipariş*
                </label>
                <select
                  id="request-select"
                  value={selectedRequestId || ""}
                  onChange={(e) => setSelectedRequestId(e.target.value)}
                  className={`${inputBaseClasses} appearance-none`}
                  disabled={uploading}
                >
                  <option value="">-- Sipariş seçiniz --</option>
                  {requests.map((req) => (
                    <option key={req.id} value={req.id}>
                      {req.malzeme} ({req.miktar} {req.birim}) -{" "}
                      {req.user.firstName} {req.user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="file-upload" className={labelBaseClasses}>
                  <FiFile />
                  Fatura Dosyası*
                </label>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className={`${inputBaseClasses} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700/60 file:text-gray-200 hover:file:bg-gray-600/60`}
                  disabled={uploading}
                />
                <p className="text-xs text-white/50 mt-2">
                  Maks. boyut: 10MB. Formatlar: PDF, JPG, PNG.
                </p>
                {file && (
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-2">
                    <FiCheck />
                    Seçili: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                    MB)
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="amount" className={labelBaseClasses}>
                  <FiDollarSign />
                  Fatura Tutarı (₺)*
                </label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={inputBaseClasses}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  disabled={uploading}
                />
              </div>

              <motion.button
                onClick={handleUpload}
                disabled={uploading || !selectedRequestId || !file || !amount}
                whileHover={!uploading ? { scale: 1.02 } : {}}
                whileTap={!uploading ? { scale: 0.98 } : {}}
                className="w-full flex items-center justify-center mt-4 bg-blue-600 text-white py-3.5 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <FiLoader className="mr-2 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>Faturayı Yükle ve Süreci Tamamla</>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
