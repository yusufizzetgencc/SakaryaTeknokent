"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { FiZap, FiList, FiEdit, FiSend, FiLoader } from "react-icons/fi";

// Bu tip, sadece fikir gönderme formunda kullanılacak aktif kategorileri temsil eder.
type ActiveCategory = {
  id: string;
  name: string;
};

const SubmitIdeaPage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const [categories, setCategories] = useState<ActiveCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchActiveCategories = async () => {
      setIsLoading(true);
      try {
        // Sadece aktif olanları getirmek için query param ekliyoruz
        const response = await fetch("/api/ideas/categories?active=true");
        if (!response.ok) throw new Error("Aktif kategoriler yüklenemedi.");
        setCategories(await response.json());
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveCategories();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error("Fikir göndermek için giriş yapmalısınız.");
      return;
    }
    if (!selectedCategoryId || !title || !description) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    setIsSubmitting(true);
    // Bu API endpoint'ini şimdi oluşturacağız
    const promise = fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        categoryId: selectedCategoryId,
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Fikir gönderilemedi.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Fikriniz gönderiliyor...",
      success: () => {
        // Başarılı olursa kullanıcıyı fikirlerini görebileceği sayfaya yönlendirelim
        router.push("/dashboard/ideas/my-ideas");
        return "Fikriniz başarıyla gönderildi!";
      },
      error: (err) => err.message,
      finally: () => setIsSubmitting(false),
    });
  };

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";
  const iconBaseClasses =
    "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500";

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full p-4 sm:p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-4">
              <FiZap size={32} /> Fikrini Paylaş
            </h1>
            <p className="text-white/60 mt-2">
              Parlak bir fikrin mi var? Bizimle paylaş, birlikte geliştirelim.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60"
          >
            {isLoading ? (
              <div className="flex items-center justify-center text-white/70 py-10">
                <FiLoader className="animate-spin mr-3" /> Kategoriler
                Yükleniyor...
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
                    <FiList /> Fikir Kategorisi *
                  </label>
                  <div className="relative">
                    <FiList className={iconBaseClasses} />
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      required
                      className={`${inputBaseClasses} appearance-none`}
                    >
                      <option value="">-- Bir kategori seçin --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
                    <FiZap /> Fikir Başlığı *
                  </label>
                  <div className="relative">
                    <FiZap className={iconBaseClasses} />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Kısa ve öz başlık girin"
                      maxLength={30} // Maksimum karakter sınırı ekledim
                      required
                      className={inputBaseClasses}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      En fazla 30 karakter
                    </p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
                    <FiEdit /> Fikrin Detayları *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Fikrinizi, amacını ve potansiyel faydalarını detaylıca açıklayın..."
                    required
                    rows={6}
                    className={`${inputBaseClasses.replace(
                      "pl-10",
                      "p-4"
                    )} resize-y`}
                  />
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-8 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <FiLoader className="animate-spin" /> Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <FiSend /> Fikrimi Gönder
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default SubmitIdeaPage;
