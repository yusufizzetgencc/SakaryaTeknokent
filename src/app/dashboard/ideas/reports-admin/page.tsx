"use client";

import { useState, useEffect, FormEvent } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiFilter,
  FiLoader,
  FiList,
  FiUser,
  FiCalendar,
  FiChevronDown,
} from "react-icons/fi";

// API'den gelecek rapor verisi tipi
type IdeaReportItem = {
  id: string;
  title: string;
  createdAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  author: {
    firstName: string;
    lastName: string;
  };
  category: {
    name: string;
  };
  _count: {
    votes: number;
  };
};

// Kategori filtresi için tip
type CategoryFilter = {
  id: string;
  name: string;
};

const AdminReportPage = () => {
  const [reportData, setReportData] = useState<IdeaReportItem[]>([]);
  const [categories, setCategories] = useState<CategoryFilter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(true);

  const [filters, setFilters] = useState({
    categoryId: "",
    authorName: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  // Filtre dropdown'ı için kategorileri çek
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/ideas/categories");
        if (response.ok) setCategories(await response.json());
      } catch {
        toast.error("Kategori filtresi yüklenemedi.");
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFetchReports = async (e?: FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);

    const params = new URLSearchParams();
    // Boş olmayan filtreleri URL parametresi olarak ekle
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    try {
      const response = await fetch(
        `/api/ideas/reports/admin?${params.toString()}`
      );
      if (!response.ok) throw new Error("Rapor verisi getirilemedi.");

      const data = await response.json();
      setReportData(data);
      toast.success(`${data.length} kayıt bulundu.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";
  const iconBaseClasses =
    "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500";

  const StatusBadge = ({ status }: { status: string }) => {
    const styles =
      {
        PENDING: "bg-yellow-500/20 text-yellow-300",
        APPROVED: "bg-green-500/20 text-green-300",
        REJECTED: "bg-red-500/20 text-red-300",
      }[status] || "bg-gray-500/20 text-gray-300";
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${styles}`}
      >
        {status}
      </span>
    );
  };

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
              <FiBarChart2 size={32} /> Yönetici Rapor Paneli
            </h1>
            <p className="text-white/60 mt-2">
              Fikirleri ve oylama durumlarını anlık olarak takip edin.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-800/60 mb-8">
            <div
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className="flex justify-between items-center cursor-pointer"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <FiFilter /> Filtreler
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
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden"
                >
                  <div className="relative">
                    <FiList className={iconBaseClasses} />
                    <select
                      name="categoryId"
                      value={filters.categoryId}
                      onChange={handleFilterChange}
                      className={`${inputBaseClasses} appearance-none`}
                    >
                      <option value="">Tüm Kategoriler</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <FiUser className={iconBaseClasses} />
                    <input
                      type="text"
                      name="authorName"
                      value={filters.authorName}
                      onChange={handleFilterChange}
                      placeholder="Yazar Adı/Soyadı"
                      className={inputBaseClasses}
                    />
                  </div>
                  <div className="relative">
                    <FiList className={iconBaseClasses} />
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className={`${inputBaseClasses} appearance-none`}
                    >
                      <option value="">Tüm Durumlar</option>
                      <option value="PENDING">Beklemede</option>
                      <option value="APPROVED">Onaylandı</option>
                      <option value="REJECTED">Reddedildi</option>
                    </select>
                  </div>
                  <div className="relative">
                    <FiCalendar className={iconBaseClasses} />
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className={inputBaseClasses}
                    />
                  </div>
                  <div className="relative">
                    <FiCalendar className={iconBaseClasses} />
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className={inputBaseClasses}
                    />
                  </div>
                  <div className="flex items-end">
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white h-[52px] rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <FiLoader className="animate-spin" /> Getiriliyor...
                        </>
                      ) : (
                        "Raporu Getir"
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/60 overflow-x-auto">
            <table className="w-full text-sm text-left text-white/80">
              <thead className="text-xs text-white/60 uppercase bg-white/5">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Fikir Başlığı
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Kategori
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Yazar
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Tarih
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Oy Sayısı
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8">
                      <FiLoader className="animate-spin inline-block" />
                    </td>
                  </tr>
                ) : reportData.length > 0 ? (
                  reportData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-800/60 hover:bg-white/5"
                    >
                      <td className="px-6 py-4 font-bold text-white">
                        {item.title}
                      </td>
                      <td className="px-6 py-4">{item.category.name}</td>
                      <td className="px-6 py-4">{`${item.author.firstName} ${item.author.lastName}`}</td>
                      <td className="px-6 py-4">
                        {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-6 py-4 text-center text-lg font-bold">
                        {item._count.votes}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-white/50">
                      Gösterilecek kayıt bulunamadı. Lütfen filtreleri
                      değiştirin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminReportPage;
