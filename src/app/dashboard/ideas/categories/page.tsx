"use client";

import { useState, useEffect, FormEvent } from "react";
import { Toaster, toast } from "sonner";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiTag,
  FiLoader,
  FiList,
  FiX,
} from "react-icons/fi";

// Prisma'dan gelen IdeaCategory tipini varsayalım
type IdeaCategory = {
  id: string;
  name: string;
  description: string | null;
  submissionEndsAt: string; // ISO string formatında
  votingEndsAt: string; // ISO string formatında
  createdAt: string;
};

const AdminIdeaCategoryPage = () => {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<IdeaCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IdeaCategory | null>(
    null
  );

  // Form state'leri
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [votingDate, setVotingDate] = useState("");

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ideas/categories");
      if (!response.ok) throw new Error("Kategoriler yüklenemedi.");
      setCategories(await response.json());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setSubmissionDate("");
    setVotingDate("");
    setEditingCategory(null);
  };

  const handleAddNewClick = () => {
    resetForm();
    setIsFormVisible(true);
  };

  const handleEditClick = (category: IdeaCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || "");
    // HTML datetime-local input'unun beklediği formata (YYYY-MM-DDTHH:mm) çeviriyoruz.
    setSubmissionDate(category.submissionEndsAt.slice(0, 16));
    setVotingDate(category.votingEndsAt.slice(0, 16));
    setIsFormVisible(true);
  };

  const handleCancelForm = () => {
    resetForm();
    setIsFormVisible(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Bu işlem için yetkiniz yok.");
      return;
    }
    setIsSubmitting(true);

    const isEditing = !!editingCategory;
    const url = isEditing
      ? `/api/ideas/categories/${editingCategory.id}`
      : "/api/ideas/categories";
    const method = isEditing ? "PUT" : "POST";

    const promise = fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        submissionEndsAt: new Date(submissionDate),
        votingEndsAt: new Date(votingDate),
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "İşlem başarısız.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: isEditing
        ? "Kategori güncelleniyor..."
        : "Kategori oluşturuluyor...",
      success: (data) => {
        if (isEditing) {
          setCategories((prev) =>
            prev.map((c) => (c.id === data.id ? data : c))
          );
        } else {
          setCategories((prev) => [data, ...prev]);
        }
        handleCancelForm();
        return isEditing
          ? "Kategori başarıyla güncellendi!"
          : "Kategori başarıyla oluşturuldu!";
      },
      error: (err) => err.message,
      finally: () => setIsSubmitting(false),
    });
  };

  const handleDelete = async (categoryId: string) => {
    Swal.fire({
      title: "Kategoriyi Sil",
      text: "Bu kategoriyi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, Sil",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#4b5563",
    }).then((result) => {
      if (result.isConfirmed) {
        const promise = fetch(`/api/ideas/categories/${categoryId}`, {
          method: "DELETE",
        }).then(async (res) => {
          if (!res.ok) {
            // Sunucudan gelen özel hata mesajını yakalıyoruz
            const err = await res.json();
            throw new Error(err.error || "Kategori silinemedi.");
          }
        });

        toast.promise(promise, {
          loading: "Kategori siliniyor...",
          success: () => {
            setCategories((prev) => prev.filter((c) => c.id !== categoryId));
            return "Kategori başarıyla silindi.";
          },
          error: (err) => err.message, // Yakalanan özel hata mesajı burada gösterilecek
        });
      }
    });
  };

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";
  const iconBaseClasses =
    "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500";

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="w-full max-w-5xl mx-auto"
        >
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-4">
                <FiList size={32} /> Fikir Kategorileri
              </h1>
              <p className="text-white/60 mt-2">
                &quot;Fikrim Var&quot; modülü için kategorileri yönetin.
              </p>
            </div>
            <motion.button
              onClick={handleAddNewClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg px-4 py-2 transition-all duration-300"
            >
              <FiPlus /> Yeni Kategori
            </motion.button>
          </div>

          <AnimatePresence>
            {isFormVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: "2rem" }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <form
                  onSubmit={handleSubmit}
                  className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60"
                >
                  <h3 className="text-xl font-bold text-white mb-6">
                    {editingCategory
                      ? "Kategoriyi Düzenle"
                      : "Yeni Kategori Oluştur"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="relative">
                      <FiTag className={iconBaseClasses} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Kategori Adı *"
                        required
                        className={inputBaseClasses}
                      />
                    </div>
                    <div className="md:col-span-2 relative">
                      {/* İkonu textarea için kaldırdım, daha iyi görünüyor */}
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Açıklama"
                        rows={2}
                        className={`${inputBaseClasses.replace(
                          "pl-10",
                          "px-4"
                        )} resize-y`}
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">
                        Fikir Son Gönderim Tarihi *
                      </label>
                      <div className="relative">
                        <FiCalendar className={iconBaseClasses} />
                        <input
                          type="datetime-local"
                          value={submissionDate}
                          onChange={(e) => setSubmissionDate(e.target.value)}
                          required
                          className={inputBaseClasses}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">
                        Oylama Bitiş Tarihi *
                      </label>
                      <div className="relative">
                        <FiCalendar className={iconBaseClasses} />
                        <input
                          type="datetime-local"
                          value={votingDate}
                          onChange={(e) => setVotingDate(e.target.value)}
                          required
                          className={inputBaseClasses}
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4">
                      <motion.button
                        type="button"
                        onClick={handleCancelForm}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-32 flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
                      >
                        <FiX /> İptal
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-48 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <FiLoader className="animate-spin" />{" "}
                            {editingCategory
                              ? "Kaydediliyor..."
                              : "Oluşturuluyor..."}
                          </>
                        ) : (
                          <>
                            {editingCategory ? <FiEdit /> : <FiPlus />}
                            {editingCategory ? "Güncelle" : "Oluştur"}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="text-center py-10 text-white/70">
              <FiLoader className="animate-spin inline mr-3" />
              Yükleniyor...
            </div>
          ) : categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 p-5 rounded-xl border border-gray-800/60 flex justify-between items-center"
                >
                  <div>
                    <p className="text-lg font-bold text-white">{cat.name}</p>
                    <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                      <span>
                        Son Gönderim:{" "}
                        {new Date(cat.submissionEndsAt).toLocaleString(
                          "tr-TR",
                          { dateStyle: "short", timeStyle: "short" }
                        )}
                      </span>
                      <span>
                        Oylama Bitiş:{" "}
                        {new Date(cat.votingEndsAt).toLocaleString("tr-TR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEditClick(cat)}
                      className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-full transition-colors"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-gray-800/60 text-white/50">
              <p className="font-semibold">
                Henüz hiç kategori oluşturulmamış.
              </p>
              <p className="mt-1 text-sm">
                Başlamak için &apos;Yeni Kategori&apos; butonuna tıklayın.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default AdminIdeaCategoryPage;
