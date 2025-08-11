"use client";

import { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAward,
  FiList,
  FiLoader,
  FiInfo,
  FiCheck,
  FiThumbsUp,
  FiX,
  FiUser,
} from "react-icons/fi";

type VotingCategory = {
  id: string;
  name: string;
};

type VotableIdea = {
  id: string;
  title: string;
  description: string;
  isOwner: boolean; // Bu fikrin sahibi mevcut kullanıcı mı?
};

const VotingPage = () => {
  const [categories, setCategories] = useState<VotingCategory[]>([]);
  const [ideas, setIdeas] = useState<VotableIdea[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [votedIdeaId, setVotedIdeaId] = useState<string | null>(null);

  // Modal için yeni state
  const [selectedIdeaForModal, setSelectedIdeaForModal] =
    useState<VotableIdea | null>(null);

  // Oylama için uygun kategorileri getir
  useEffect(() => {
    const fetchVotingCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch("/api/ideas/categories?for_voting=true");
        if (!response.ok) throw new Error("Oylama kategorileri yüklenemedi.");
        setCategories(await response.json());
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchVotingCategories();
  }, []);

  // Seçilen kategoriye ait oylanabilir fikirleri getir
  const fetchVotableIdeas = useCallback(async () => {
    if (!selectedCategoryId) {
      setIdeas([]);
      setVotedIdeaId(null);
      return;
    }
    setIsLoadingIdeas(true);
    try {
      const response = await fetch(
        `/api/ideas/votable?categoryId=${selectedCategoryId}`
      );
      if (!response.ok) throw new Error("Oylanacak fikirler getirilemedi.");
      const data = await response.json();
      setIdeas(data.ideas);
      setVotedIdeaId(data.userVote);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsLoadingIdeas(false);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    fetchVotableIdeas();
  }, [fetchVotableIdeas]);

  const handleVote = (ideaId: string) => {
    if (votedIdeaId) {
      toast.warning("Bu kategoride zaten oy kullandınız.");
      return;
    }
    const promise = fetch("/api/ideas/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Oy verilirken bir hata oluştu.");
      }
    });

    toast.promise(promise, {
      loading: "Oyunuz kaydediliyor...",
      success: () => {
        setVotedIdeaId(ideaId);
        setSelectedIdeaForModal(null); // Oy verdikten sonra modal'ı kapat
        return "Oyunuz başarıyla kaydedildi!";
      },
      error: (err) => err.message,
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
          className="w-full max-w-5xl mx-auto"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-4">
              <FiAward size={32} /> Fikir Oylaması
            </h1>
            <p className="text-white/60 mt-2">
              En iyi fikri seçmek için oyunu kullan.
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
                    -- Oy kullanmak için bir kategori seçin --
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

          {isLoadingIdeas ? (
            <div className="flex items-center justify-center text-white/70 py-10">
              <FiLoader className="animate-spin mr-3" /> Fikirler Yükleniyor...
            </div>
          ) : selectedCategoryId && ideas.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-gray-800/60 text-white/50">
              <FiInfo className="mx-auto text-3xl mb-3" />
              <p className="font-semibold">
                Bu kategoride oylanacak fikir bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea) => (
                <motion.div
                  key={idea.id}
                  layout
                  whileHover={{ scale: 1.03, y: -5 }}
                  onClick={() => setSelectedIdeaForModal(idea)}
                  className="bg-white/5 border border-gray-800/60 rounded-xl p-5 cursor-pointer flex flex-col justify-between"
                >
                  <p className="font-bold text-white text-sm mb-2">
                    {idea.title}
                  </p>
                  <div className="flex justify-end mt-4">
                    {idea.isOwner ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full">
                        <FiUser /> Kendi Fikriniz
                      </span>
                    ) : votedIdeaId === idea.id ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-300 bg-green-500/20 px-2.5 py-1 rounded-full">
                        <FiCheck /> Oy Verildi
                      </span>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Detay Modalı */}
      <AnimatePresence>
        {selectedIdeaForModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedIdeaForModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1a1a] border border-gray-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-white">
                  {selectedIdeaForModal.title}
                </h3>
                <button
                  onClick={() => setSelectedIdeaForModal(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <p className="text-white/80 whitespace-pre-wrap break-words">
                  {selectedIdeaForModal.description}
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20 flex justify-end">
                <motion.button
                  onClick={() => handleVote(selectedIdeaForModal.id)}
                  disabled={selectedIdeaForModal.isOwner || !!votedIdeaId}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 font-semibold bg-blue-600 text-white px-6 py-2.5 rounded-lg disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedIdeaForModal.isOwner ? (
                    <>
                      {" "}
                      <FiUser /> Kendi Fikriniz{" "}
                    </>
                  ) : votedIdeaId ? (
                    <>
                      {" "}
                      <FiCheck /> Oy Kullandınız{" "}
                    </>
                  ) : (
                    <>
                      {" "}
                      <FiThumbsUp /> Bu Fikre Oy Ver{" "}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VotingPage;
