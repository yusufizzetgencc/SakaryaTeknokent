"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFilePlus,
  FiBriefcase,
  FiUser,
  FiHash,
  FiCalendar,
  FiUploadCloud,
  FiDollarSign,
  FiList,
  FiClock,
  FiSend,
  FiLoader,
} from "react-icons/fi";

type InvoiceType = "ONE_TIME" | "MONTHLY";

const NewContractPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [academicianName, setAcademicianName] = useState("");
  const [projectNumber, setProjectNumber] = useState("");
  const [projectStartDate, setProjectStartDate] = useState("");
  const [invoiceStartDate, setInvoiceStartDate] = useState("");
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("ONE_TIME");
  const [invoiceDuration, setInvoiceDuration] = useState(1);
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [companyContractFile, setCompanyContractFile] = useState<File | null>(
    null
  );
  const [academicianContractFile, setAcademicianContractFile] =
    useState<File | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!companyContractFile || !academicianContractFile) {
      toast.error("Lütfen her iki sözleşme dosyasını da yükleyin.");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("companyName", companyName);
    formData.append("academicianName", academicianName);
    formData.append("projectNumber", projectNumber);
    formData.append("projectStartDate", projectStartDate);
    formData.append("invoiceStartDate", invoiceStartDate);
    formData.append("invoiceType", invoiceType);
    if (invoiceType === "MONTHLY") {
      formData.append("invoiceDurationMonths", invoiceDuration.toString());
    }
    if (invoiceAmount) {
      formData.append("invoiceAmount", invoiceAmount);
    }
    formData.append("companyContractFile", companyContractFile);
    formData.append("academicianContractFile", academicianContractFile);

    const promise = fetch("/api/contracts", {
      method: "POST",
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Sözleşme oluşturulamadı.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Sözleşme ve belgeler kaydediliyor...",
      success: () => {
        router.push("/dashboard/contracts");
        return "Yeni proje başarıyla oluşturuldu!";
      },
      error: (err) => (err instanceof Error ? err.message : "Bilinmeyen hata"),
      finally: () => setIsSubmitting(false),
    });
  };

  // onChange tiplerini kesinleştiriyoruz
  const handleInvoiceTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "ONE_TIME" || value === "MONTHLY") {
      setInvoiceType(value);
    }
  };

  const handleInvoiceDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) setInvoiceDuration(value);
  };

  const handleInvoiceAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInvoiceAmount(e.target.value);
  };

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
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-4">
              <FiFilePlus size={32} /> Yeni Proje Kaydı
            </h1>
            <p className="text-white/60 mt-2">
              Yeni proje sözleşmelerini ve fatura bilgilerini sisteme kaydedin.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="relative">
                <FiBriefcase className={iconBaseClasses} />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Firma Adı *"
                  required
                  className={inputBaseClasses}
                />
              </div>
              <div className="relative">
                <FiUser className={iconBaseClasses} />
                <input
                  type="text"
                  value={academicianName}
                  onChange={(e) => setAcademicianName(e.target.value)}
                  placeholder="Akademisyen Adı *"
                  required
                  className={inputBaseClasses}
                />
              </div>
              <div className="md:col-span-2 relative">
                <FiHash className={iconBaseClasses} />
                <input
                  type="text"
                  value={projectNumber}
                  onChange={(e) => setProjectNumber(e.target.value)}
                  placeholder="Proje Numarası *"
                  required
                  className={inputBaseClasses}
                />
              </div>

              <div>
                <label className="label-style">
                  <FiUploadCloud /> Firma Sözleşmesi *
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setCompanyContractFile(e.target.files?.[0] ?? null)
                  }
                  required
                  className={fileInputClasses}
                />
              </div>
              <div>
                <label className="label-style">
                  <FiUploadCloud /> Akademisyen Sözleşmesi *
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setAcademicianContractFile(e.target.files?.[0] ?? null)
                  }
                  required
                  className={fileInputClasses}
                />
              </div>

              <div>
                <label className="label-style">
                  <FiCalendar /> Proje Başlangıç Tarihi *
                </label>
                <input
                  type="date"
                  value={projectStartDate}
                  onChange={(e) => setProjectStartDate(e.target.value)}
                  required
                  className={inputBaseClasses.replace("pl-10", "px-4")}
                />
              </div>
              <div>
                <label className="label-style">
                  <FiCalendar /> Fatura Başlangıç Tarihi *
                </label>
                <input
                  type="date"
                  value={invoiceStartDate}
                  onChange={(e) => setInvoiceStartDate(e.target.value)}
                  required
                  className={inputBaseClasses.replace("pl-10", "px-4")}
                />
              </div>

              <div>
                <label className="label-style">
                  <FiList /> Fatura Tipi *
                </label>
                <div className="relative">
                  <FiList className={iconBaseClasses} />
                  <select
                    value={invoiceType}
                    onChange={handleInvoiceTypeChange}
                    required
                    className={`${inputBaseClasses} appearance-none`}
                  >
                    <option value="ONE_TIME">Tek Seferlik</option>
                    <option value="MONTHLY">Aylık</option>
                  </select>
                </div>
              </div>

              <AnimatePresence>
                {invoiceType === "MONTHLY" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="label-style">
                      <FiClock /> Aylık Fatura Süresi (Ay) *
                    </label>
                    <div className="relative">
                      <FiClock className={iconBaseClasses} />
                      <input
                        type="number"
                        min={1}
                        max={36}
                        value={invoiceDuration}
                        onChange={handleInvoiceDurationChange}
                        required
                        className={inputBaseClasses}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="md:col-span-2">
                <label className="label-style">
                  <FiDollarSign /> Fatura Tutarı (Opsiyonel)
                </label>
                <div className="relative">
                  <FiDollarSign className={iconBaseClasses} />
                  <input
                    type="number"
                    step={0.01}
                    value={invoiceAmount}
                    onChange={handleInvoiceAmountChange}
                    placeholder="Örn: 1500.50"
                    className={inputBaseClasses}
                  />
                </div>
              </div>

              <div className="md:col-span-2 mt-6 pt-6 border-t border-white/10 flex justify-end">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="animate-spin" /> Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <FiSend /> Projeyi Kaydet
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
        <style jsx>{`
          .label-style {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            color: #d1d5db;
            font-weight: 500;
          }
        `}</style>
      </div>
    </>
  );
};

export default NewContractPage;
