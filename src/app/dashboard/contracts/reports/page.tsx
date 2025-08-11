"use client";

import { useState, FormEvent } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPieChart,
  FiFilter,
  FiLoader,
  FiDownload,
  FiChevronDown,
} from "react-icons/fi";

type ReportItem = {
  id: string;
  companyName: string;
  academicianName: string;
  projectNumber: string;
  projectStartDate: string;
  invoiceType: "ONE_TIME" | "MONTHLY";
  invoiceDurationMonths: number | null;
  invoiceAmount: number | null;
  companyContractUrl: string;
  academicianContractUrl: string;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
};

const ContractReportPage = () => {
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(true);

  const [filters, setFilters] = useState({
    companyName: "",
    academicianName: "",
    projectNumber: "",
    year: "",
    invoiceType: "",
  });

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFetchReports = async (e?: FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    try {
      const response = await fetch(
        `/api/contracts/reports?${params.toString()}`
      );
      if (!response.ok) throw new Error("Rapor verisi getirilemedi.");
      const data = await response.json();
      setReportData(data);
      toast.info(`${data.length} kayıt bulundu.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500";

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-7xl mx-auto"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-4">
              <FiPieChart size={32} /> Proje Raporları
            </h1>
            <p className="text-white/60 mt-2">
              Tüm proje sözleşmelerini filtreleyin ve görüntüleyin.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-800/60 mb-8">
            <div
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className="flex justify-between items-center cursor-pointer"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <FiFilter /> Filtreleme Seçenekleri
              </h2>
              <motion.div animate={{ rotate: isFilterVisible ? 0 : -180 }}>
                <FiChevronDown />
              </motion.div>
            </div>
            <AnimatePresence>
              {isFilterVisible && (
                <motion.form
                  key="filter-form"
                  onSubmit={handleFetchReports}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: "2rem" }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-hidden"
                >
                  <div>
                    <label className="label-style">Firma Adı</label>
                    <input
                      type="text"
                      name="companyName"
                      value={filters.companyName}
                      onChange={handleFilterChange}
                      className={inputBaseClasses}
                    />
                  </div>
                  <div>
                    <label className="label-style">Akademisyen Adı</label>
                    <input
                      type="text"
                      name="academicianName"
                      value={filters.academicianName}
                      onChange={handleFilterChange}
                      className={inputBaseClasses}
                    />
                  </div>
                  <div>
                    <label className="label-style">Proje No</label>
                    <input
                      type="text"
                      name="projectNumber"
                      value={filters.projectNumber}
                      onChange={handleFilterChange}
                      className={inputBaseClasses}
                    />
                  </div>
                  <div>
                    <label className="label-style">Proje Yılı</label>
                    <input
                      type="number"
                      name="year"
                      placeholder="Örn: 2024"
                      value={filters.year}
                      onChange={handleFilterChange}
                      className={inputBaseClasses}
                    />
                  </div>
                  <div>
                    <label className="label-style">Fatura Tipi</label>
                    <select
                      name="invoiceType"
                      value={filters.invoiceType}
                      onChange={handleFilterChange}
                      className={inputBaseClasses}
                    >
                      <option value="">Tümü</option>
                      <option value="ONE_TIME">Tek Seferlik</option>
                      <option value="MONTHLY">Aylık</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-[42px] flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <FiLoader className="animate-spin" /> Aranıyor...
                        </>
                      ) : (
                        "Raporu Getir"
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/60 overflow-x-auto">
            <table className="w-full text-sm text-left text-white/80">
              <thead className="text-xs text-white/60 uppercase bg-white/5">
                <tr>
                  <th className="px-6 py-3">Proje No</th>
                  <th className="px-6 py-3">Firma</th>
                  <th className="px-6 py-3">Akademisyen</th>
                  <th className="px-6 py-3">Proje Tarihi</th>
                  <th className="px-6 py-3">Fatura Tipi</th>
                  <th className="px-6 py-3">Tutar</th>
                  <th className="px-6 py-3 text-center">Sözleşmeler</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8">
                      <FiLoader className="animate-spin inline-block text-2xl" />
                    </td>
                  </tr>
                ) : (
                  reportData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-800/60 hover:bg-white/5"
                    >
                      <td className="px-6 py-4 font-bold text-white">
                        {item.projectNumber}
                      </td>
                      <td className="px-6 py-4">{item.companyName}</td>
                      <td className="px-6 py-4">{item.academicianName}</td>
                      <td className="px-6 py-4">
                        {new Date(item.projectStartDate).toLocaleDateString(
                          "tr-TR"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.invoiceType === "MONTHLY"
                          ? `Aylık (${item.invoiceDurationMonths} Ay)`
                          : "Tek Seferlik"}
                      </td>
                      <td className="px-6 py-4">
                        {item.invoiceAmount
                          ? `${item.invoiceAmount.toLocaleString("tr-TR")} TL`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-4">
                          <a
                            href={item.companyContractUrl}
                            target="_blank"
                            title="Firma Sözleşmesi"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <FiDownload />
                          </a>
                          <a
                            href={item.academicianContractUrl}
                            target="_blank"
                            title="Akademisyen Sözleşmesi"
                            className="text-green-400 hover:text-green-300"
                          >
                            <FiDownload />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {!isLoading && reportData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-white/50">
                      Gösterilecek kayıt bulunamadı. Lütfen filtreleme yapın.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        <style jsx>{`
          .label-style {
            display: block;
            font-size: 0.875rem;
            color: #d1d5db;
            margin-bottom: 0.5rem;
          }
        `}</style>
      </div>
    </>
  );
};

export default ContractReportPage;
