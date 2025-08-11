"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCpu,
  FiLoader,
  FiInfo,
  FiAward,
  FiThumbsUp,
  FiThumbsDown,
  FiClock,
  FiX,
} from "react-icons/fi";

// Prisma'dan gelecek Idea tipini varsayalım
type MyIdea = {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  createdAt: string;
  category: {
    name: string;
    votingEndsAt: string;
  };
  _count: {
    votes: number;
  };
};

const MyIdeasPage = () => {
  const [myIdeas, setMyIdeas] = useState<MyIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<MyIdea | null>(null);

  useEffect(() => {
    const fetchMyIdeas = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/ideas/my-ideas");
        if (!response.ok) throw new Error("Fikirleriniz getirilemedi.");
        setMyIdeas(await response.json());
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyIdeas();
  }, []);

  const StatusInfo = ({ idea }: { idea: MyIdea }) => {
    const isVotingOver = new Date() > new Date(idea.category.votingEndsAt);

    switch (idea.status) {
      case "PENDING":
        return (
          <div className="flex items-center gap-2 text-sm text-yellow-300">
            <FiClock /> Değerlendirme Bekliyor
          </div>
        );
      case "APPROVED":
        if (isVotingOver) {
          return (
            <div className="flex items-center gap-2 text-sm text-blue-300">
              <FiAward /> Oylama Tamamlandı
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2 text-sm text-green-300">
            <FiThumbsUp /> Oylamaya Açık
          </div>
        );
      case "REJECTED":
        return (
          <div className="flex items-center gap-2 text-sm text-red-300">
            <FiThumbsDown /> Reddedildi
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl mx-auto"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-4">
              <FiCpu size={32} /> Fikirlerim
            </h1>
            <p className="text-white/60 mt-2">
              Gönderdiğin fikirlerin durumunu ve performansını buradan takip et.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center text-white/70 py-10">
              <FiLoader className="animate-spin mr-3" /> Fikirleriniz
              Yükleniyor...
            </div>
          ) : myIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myIdeas.map((idea) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-800/60 flex flex-col justify-between cursor-pointer"
                  onClick={() => setSelectedIdea(idea)}
                  title="Detayları görmek için tıklayın"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <p className="font-bold text-lg text-white truncate">
                        {idea.title}
                      </p>
                      <div className="text-right">
                        <StatusInfo idea={idea} />
                      </div>
                    </div>
                    <p className="text-sm text-white/60 mt-1 mb-4 truncate">
                      {idea.category.name}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-white/50">
                      Gönderim:{" "}
                      {new Date(idea.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                    <div className="flex items-center gap-2 text-lg font-bold text-white">
                      <FiAward className="text-yellow-400" />
                      <span>{idea._count.votes} Oy</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-gray-800/60 text-white/50">
              <FiInfo className="mx-auto text-3xl mb-3" />
              <p className="font-semibold">Henüz hiç fikir göndermemişsiniz.</p>
              <p className="mt-1 text-sm">
                &quot;Fikrini Paylaş&quot; sayfasından ilk fikrinizi
                gönderebilirsiniz.
              </p>
            </div>
          )}

          {/* Modal */}
          <AnimatePresence>
            {selectedIdea && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black z-40"
                  onClick={() => setSelectedIdea(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 50 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 max-w-3xl mx-auto top-20 left-0 right-0 bg-white/10 backdrop-blur-lg rounded-2xl p-6 z-50 shadow-xl overflow-auto max-h-[80vh]"
                >
                  <button
                    onClick={() => setSelectedIdea(null)}
                    className="absolute top-4 right-4 text-white hover:text-red-400 text-2xl"
                    aria-label="Kapat"
                  >
                    <FiX />
                  </button>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {selectedIdea.title}
                  </h2>
                  {/* DÜZENLEME BURADA YAPILDI: `break-words` class'ı eklendi. */}
                  <p className="text-white/80 whitespace-pre-line break-words mb-4">
                    {selectedIdea.description}
                  </p>
                  {selectedIdea.status === "REJECTED" &&
                    selectedIdea.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-500/10 rounded-lg text-sm">
                        <p className="font-semibold text-red-300">
                          Reddedilme Sebebi:
                        </p>
                        <p className="text-red-300/80 break-words">
                          {selectedIdea.rejectionReason}
                        </p>
                      </div>
                    )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default MyIdeasPage;
