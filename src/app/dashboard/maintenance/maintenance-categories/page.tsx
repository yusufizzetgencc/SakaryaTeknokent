"use client";

import { useEffect, useState, FormEvent } from "react";
import Swal from "sweetalert2";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import {
  FiSettings,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiLoader,
  FiAlertCircle,
  FiX,
  FiSave,
} from "react-icons/fi";
import { MaintenanceCategory } from "@prisma/client";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function MaintenanceCategoriesPage() {
  const [categories, setCategories] = useState<MaintenanceCategory[]>([]);
  const [name, setName] = useState("");
  const [editingCategory, setEditingCategory] =
    useState<MaintenanceCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/maintenance/maintenance-categories");
      if (!response.ok) throw new Error("Veriler alınırken bir hata oluştu.");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Kategori adı boş olamaz.");
      return;
    }
    setIsSubmitting(true);
    const url = editingCategory
      ? `/api/maintenance/maintenance-categories/${editingCategory.id}`
      : "/api/maintenance/maintenance-categories";
    const method = editingCategory ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "İşlem başarısız.");
      }
      setName("");
      setEditingCategory(null);
      await fetchCategories();
      toast.success(
        editingCategory
          ? "Kategori başarıyla güncellendi!"
          : "Kategori başarıyla eklendi!"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kayıt hatası");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: MaintenanceCategory) => {
    setEditingCategory(category);
    setName(category.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu kategori kalıcı olarak silinecektir!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, Sil!",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#4b5563",
    });
    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `/api/maintenance/maintenance-categories/${id}`,
          { method: "DELETE" }
        );
        if (!response.ok) throw new Error("Silme işlemi başarısız.");
        await fetchCategories();
        toast.success("Kategori başarıyla silindi.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Silme hatası");
      }
    }
  };

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2 text-white tracking-tight flex items-center gap-4">
              <FiSettings size={32} /> Bakım Kategorileri Yönetimi
            </h1>
            <p className="text-white/60 mb-10">
              Yeni bakım kategorileri ekleyin, mevcutları düzenleyin veya silin.
            </p>
          </motion.div>

          {/* Form Bölümü */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
              <FiPlus />{" "}
              {editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kategori adı girin..."
                required
                className={inputBaseClasses}
              />
              <div className="flex gap-3 w-full sm:w-auto flex-shrink-0">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <FiLoader className="animate-spin" />
                  ) : editingCategory ? (
                    <FiSave />
                  ) : (
                    <FiPlus />
                  )}
                  {editingCategory ? "Güncelle" : "Ekle"}
                </motion.button>
                {editingCategory && (
                  <motion.button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setName("");
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-700/60 hover:bg-gray-600/60 text-gray-200 px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    <FiX /> İptal
                  </motion.button>
                )}
              </div>
            </form>
          </motion.section>

          {/* Kategori Listesi */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">
              Mevcut Kategoriler
            </h2>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <FiLoader className="animate-spin h-8 w-8 text-white" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-10 px-6">
                <FiAlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-white/70">
                  Henüz oluşturulmuş bir bakım kategorisi bulunmamaktadır.
                </p>
              </div>
            ) : (
              <motion.ul
                className="space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {categories.map((category) => (
                  <motion.li
                    key={category.id}
                    variants={itemVariants}
                    className="flex items-center justify-between bg-black/20 hover:bg-black/40 rounded-xl px-5 py-3 transition-colors duration-300"
                  >
                    <span className="text-white font-medium">
                      {category.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 rounded-md bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 transition-colors"
                        title="Düzenle"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors"
                        title="Sil"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </motion.section>
        </div>
      </div>
    </>
  );
}
