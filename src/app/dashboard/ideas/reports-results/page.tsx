"use client";

import { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiList,
  FiLoader,
  FiInfo,
  FiAward,
  FiUser,
} from "react-icons/fi";
import Confetti from "react-confetti";
import { useWindowSize } from "@uidotdev/usehooks";

// API'den gelecek sonuç verisi tipi
type IdeaResult = {
  id: string;
  title: string;
  author: {
    firstName: string;
    lastName: string;
  };
  voteCount: number;
};

// Oylaması bitmiş kategoriler için tip
type FinishedCategory = {
  id: string;
  name: string;
};

const ResultsPage = () => {
  const [results, setResults] = useState<IdeaResult[]>([]);
  const [categories, setCategories] = useState<FinishedCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  // Oylaması bitmiş kategorileri getir
  useEffect(() => {
    const fetchFinishedCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch("/api/ideas/categories?finished=true");
        if (!response.ok)
          throw new Error("Sonuçlar için kategoriler yüklenemedi.");
        setCategories(await response.json());
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchFinishedCategories();
  }, []);

  // Seçilen kategoriye ait sonuçları getir
  const fetchResults = useCallback(async () => {
    if (!selectedCategoryId) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setShowConfetti(false); // Yeni sorguda konfetiyi kapat
    try {
      const response = await fetch(
        `/api/ideas/reports/results?categoryId=${selectedCategoryId}`
      );
      if (!response.ok) throw new Error("Sonuçlar getirilemedi.");
      const data = await response.json();
      setResults(data);
      if (data.length > 0) {
        setShowConfetti(true); // Veri gelince konfetiyi başlat
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";
  const iconBaseClasses =
    "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500";

  const getPodiumClass = (index: number) => {
    switch (index) {
      case 0:
        return "border-yellow-400 bg-yellow-400/10"; // Altın
      case 1:
        return "border-gray-400 bg-gray-400/10"; // Gümüş
      case 2:
        return "border-orange-600 bg-orange-600/10"; // Bronz
      default:
        return "border-gray-800/60";
    }
  };

  return (
    <>
      {showConfetti && width && height && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl mx-auto"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-4">
              <FiTrendingUp size={32} /> Oylama Sonuçları
            </h1>
            <p className="text-white/60 mt-2">
              Kazanan fikirleri ve oylama sıralamasını görün.
            </p>
          </div>

          <div className="max-w-xl mx-auto mb-10">
            {isLoadingCategories ? (
              <div className="text-center text-white/70">
                <FiLoader className="animate-spin inline-block" />
              </div>
            ) : (
              <div className="relative">
                <FiList className={iconBaseClasses} />
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className={`${inputBaseClasses} appearance-none`}
                >
                  <option value="">
                    -- Sonuçları görmek için bir kategori seçin --
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center text-white/70 py-10">
              <FiLoader className="animate-spin mr-3" /> Sonuçlar
              Hesaplanıyor...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/5 border-2 p-5 rounded-xl flex items-center justify-between ${getPodiumClass(
                    index
                  )}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold w-12 text-center text-white/80">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">
                        {result.title}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <FiUser size={14} />
                        <span>{`${result.author.firstName} ${result.author.lastName}`}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-2xl font-extrabold text-white">
                    <FiAward
                      className={` ${
                        index === 0
                          ? "text-yellow-400"
                          : index === 1
                          ? "text-gray-400"
                          : index === 2
                          ? "text-orange-600"
                          : "text-transparent"
                      }`}
                    />
                    {result.voteCount} Oy
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            selectedCategoryId && (
              <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-gray-800/60 text-white/50">
                <FiInfo className="mx-auto text-3xl mb-3" />
                <p className="font-semibold">
                  Bu kategori için gösterilecek sonuç bulunamadı.
                </p>
                <p className="mt-1 text-sm">
                  Muhtemelen hiç oy kullanılmamış veya fikir gönderilmemiş.
                </p>
              </div>
            )
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ResultsPage;
