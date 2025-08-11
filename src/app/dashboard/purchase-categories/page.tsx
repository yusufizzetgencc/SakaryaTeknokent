"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  FiTag,
  FiPlusCircle,
  FiList,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiLoader,
} from "react-icons/fi";

interface PurchaseCategory {
  id: string;
  name: string;
}

export default function PurchaseCategoriesPage() {
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---
  const [categories, setCategories] = useState<PurchaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/purchase-categories");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Kategoriler yüklenemedi");
        setCategories([]);
      } else {
        setCategories(data.categories);
      }
    } catch {
      toast.error("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newCategoryName.trim()) {
      toast.error("Kategori adı boş olamaz");
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch("/api/purchase-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Kategori eklenemedi");
      } else {
        toast.success("Kategori eklendi");
        setNewCategoryName("");
        fetchCategories();
      }
    } catch {
      toast.error("Sunucu hatası");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editingName.trim()) {
      toast.error("Kategori adı boş olamaz");
      return;
    }
    try {
      const res = await fetch(`/api/purchase-categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Kategori güncellenemedi");
      } else {
        toast.success("Kategori güncellendi");
        setEditingId(null);
        setEditingName("");
        fetchCategories();
      }
    } catch {
      toast.error("Sunucu hatası");
    }
  }

  async function handleDelete(id: string) {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu kategori kalıcı olarak silinecektir.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, Sil!",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#4b5563",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/purchase-categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Kategori silinemedi");
      } else {
        toast.success("Kategori silindi");
        fetchCategories();
      }
    } catch {
      toast.error("Sunucu hatası");
    }
  }
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-10 text-white tracking-tight flex items-center gap-4"
          >
            <FiTag size={32} /> Satın Alma Kategorileri
          </motion.h1>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
              <FiPlusCircle /> Yeni Kategori Ekle
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Yeni kategori adı..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className={inputBaseClasses}
              />
              <motion.button
                onClick={handleAdd}
                disabled={addLoading}
                whileHover={!addLoading ? { scale: 1.05 } : {}}
                whileTap={!addLoading ? { scale: 0.95 } : {}}
                className="flex-shrink-0 flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {addLoading ? <FiLoader className="animate-spin" /> : "Ekle"}
              </motion.button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 sm:p-4"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-3 p-4">
              <FiList /> Mevcut Kategoriler
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-white/70 uppercase bg-white/5">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Kategori Adı
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="text-center py-10">
                        <FiLoader className="mx-auto animate-spin h-6 w-6 text-white" />
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="text-center py-10 text-white/60"
                      >
                        Kayıtlı kategori bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="border-b border-white/10">
                        <td className="px-6 py-4 font-medium text-white">
                          {editingId === cat.id ? (
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className={`${inputBaseClasses} py-2`}
                              autoFocus
                            />
                          ) : (
                            cat.name
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-3">
                            {editingId === cat.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(cat.id)}
                                  className="p-2 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors"
                                  title="Kaydet"
                                >
                                  <FiCheck size={16} />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-2 rounded-md bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 transition-colors"
                                  title="İptal"
                                >
                                  <FiX size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(cat.id);
                                    setEditingName(cat.name);
                                  }}
                                  className="p-2 rounded-md bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 transition-colors"
                                  title="Düzenle"
                                >
                                  <FiEdit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(cat.id)}
                                  className="p-2 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
                                  title="Sil"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
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
