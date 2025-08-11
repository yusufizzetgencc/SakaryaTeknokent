"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Swal from "sweetalert2";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import {
  FiCpu,
  FiPlus,
  FiTag,
  FiHash,
  FiBriefcase,
  FiType,
  FiMapPin,
  FiMessageSquare,
  FiImage,
  FiLoader,
} from "react-icons/fi";
import { MaintenanceCategory } from "@prisma/client";

export default function AddDevicePage() {
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---
  const router = useRouter();
  const { data: session } = useSession();
  const [categories, setCategories] = useState<MaintenanceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/maintenance/maintenance-categories");
        if (!res.ok) throw new Error("Kategoriler yüklenemedi.");
        setCategories(await res.json());
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Bilinmeyen hata");
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) setPreviewUrl(URL.createObjectURL(file));
    else setPreviewUrl(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error("Kullanıcı bilgisi alınamadı. Lütfen tekrar giriş yapın.");
      return;
    }
    if (!selectedFile) {
      toast.error("Lütfen bir cihaz görseli seçin.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("image", selectedFile);
    formData.append("addedById", session.user.id);

    try {
      const result = await Swal.fire({
        title: "Cihaz Eklensin mi?",
        text: "Yeni cihazı sisteme kaydetmek istediğinize emin misiniz?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Evet, Ekle",
        cancelButtonText: "İptal",
        background: "#1a1a1a",
        color: "#ffffff",
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#4b5563",
      });

      if (!result.isConfirmed) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/maintenance/technical-equipment", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Cihaz eklenemedi.");
      }
      toast.success("Cihaz başarıyla eklendi!");
      router.push("/dashboard/maintenance/devices");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };
  // --- FONKSİYONELLİK DEĞİŞMEDİ ---

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";
  const labelBaseClasses = "relative";
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
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-4">
              <FiCpu size={32} /> Yeni Cihaz Ekle
            </h1>
            <p className="text-white/60 mt-2">
              Sisteme yeni bir teknik cihaz kaydedin.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/60"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Sol Sütun */}
              <div className="space-y-6">
                <div className={labelBaseClasses}>
                  <FiTag className={iconBaseClasses} />
                  <input
                    type="text"
                    id="deviceCode"
                    name="deviceCode"
                    required
                    placeholder="Cihaz Kodu*"
                    className={inputBaseClasses}
                  />
                </div>
                <div className={labelBaseClasses}>
                  <FiType className={iconBaseClasses} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Cihaz Adı*"
                    className={inputBaseClasses}
                  />
                </div>
                <div className={labelBaseClasses}>
                  <FiHash className={iconBaseClasses} />
                  <input
                    type="text"
                    id="serialNumber"
                    name="serialNumber"
                    required
                    placeholder="Seri No*"
                    className={inputBaseClasses}
                  />
                </div>
                <div className={labelBaseClasses}>
                  <FiBriefcase className={iconBaseClasses} />
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    placeholder="Marka"
                    className={inputBaseClasses}
                  />
                </div>
                <div className={labelBaseClasses}>
                  <FiCpu className={iconBaseClasses} />
                  <input
                    type="text"
                    id="model"
                    name="model"
                    placeholder="Model"
                    className={inputBaseClasses}
                  />
                </div>
              </div>

              {/* Sağ Sütun */}
              <div className="space-y-6">
                <div className={labelBaseClasses}>
                  <FiMapPin className={iconBaseClasses} />
                  <input
                    type="text"
                    id="building"
                    name="building"
                    placeholder="Bulunduğu Bina"
                    className={inputBaseClasses}
                  />
                </div>
                <div className={labelBaseClasses}>
                  <FiMapPin className={iconBaseClasses} />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Bulunduğu Alan"
                    className={inputBaseClasses}
                  />
                </div>
                <div className={labelBaseClasses}>
                  <FiTag className={iconBaseClasses} />
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    className={`${inputBaseClasses} appearance-none`}
                  >
                    <option value="">Kategori Seçin*</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
                    <FiImage />
                    Görsel*
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className={`${inputBaseClasses.replace(
                      "pl-10",
                      "px-4"
                    )} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700/60 file:text-gray-200 hover:file:bg-gray-600/60`}
                  />
                  {previewUrl && (
                    <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-700/80">
                      <Image
                        src={previewUrl}
                        alt="Önizleme"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Açıklama */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
                  <FiMessageSquare />
                  Açıklama
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className={`${inputBaseClasses.replace(
                    "pl-10",
                    "px-4"
                  )} resize-y`}
                ></textarea>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-8 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <FiLoader className="mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-1" />
                    Cihazı Ekle
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
