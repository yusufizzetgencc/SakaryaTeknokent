"use client";

import { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  FiFolder,
  FiSearch,
  FiLoader,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiActivity,
  FiCalendar,
} from "react-icons/fi";

type Project = {
  id: string;
  companyName: string;
  academicianName: string;
  projectNumber: string;
  projectStartDate: string;
};

const ProjectListPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/contracts");
      if (!response.ok) throw new Error("Projeler yüklenemedi.");
      setProjects(await response.json());
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    return projects.filter(
      (p) =>
        p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.academicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, projects]);

  const handleDelete = async (projectId: string) => {
    Swal.fire({
      title: "Projeyi Sil",
      text: "Bu projeyi ve ilişkili tüm faturaları kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, Sil",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
    }).then((result) => {
      if (result.isConfirmed) {
        const promise = fetch(`/api/contracts/${projectId}`, {
          method: "DELETE",
        }).then((res) => {
          if (!res.ok) {
            // 204 No Content durumunda res.json() hata verir, bu yüzden başarıyı böyle kontrol et.
            if (res.status === 204) return;
            throw new Error("Proje silinemedi.");
          }
        });

        toast.promise(promise, {
          loading: "Proje siliniyor...",
          success: () => {
            setProjects((prev) => prev.filter((p) => p.id !== projectId));
            return "Proje başarıyla silindi.";
          },
          error: (err) => err.message,
        });
      }
    });
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-4">
                <FiFolder size={32} /> Proje Yönetimi
              </h1>
              <p className="text-white/60 mt-2">
                Mevcut projeleri görüntüleyin ve yönetin.
              </p>
            </div>
            <Link href="/dashboard/contracts/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg px-4 py-2 transition-all"
              >
                <FiPlus /> Yeni Proje Ekle
              </motion.button>
            </Link>
          </div>

          <div className="relative mb-8">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Proje No, Firma veya Akademisyen Adı ile Ara..."
              className="w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg pl-12 pr-4 py-3 text-lg text-white"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <FiLoader className="animate-spin text-4xl text-white/70" />
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredProjects.map((project) => (
                  <motion.div
                    layout
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-800/60 flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-blue-400">
                        {project.projectNumber}
                      </p>
                      <h3 className="text-xl font-bold text-white mt-1">
                        {project.companyName}
                      </h3>
                      <p className="text-white/70 mt-1">
                        {project.academicianName}
                      </p>
                      <p className="text-sm text-white/50 mt-2">
                        Başlangıç:{" "}
                        {new Date(project.projectStartDate).toLocaleDateString(
                          "tr-TR"
                        )}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/contracts/tracking?projectNumber=${project.projectNumber}`}
                          title="Fatura Takibi"
                          className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
                        >
                          <FiActivity />
                        </Link>
                        <Link
                          href="/dashboard/contracts/calendar"
                          title="Takvim"
                          className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
                        >
                          <FiCalendar />
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          title="Düzenle"
                          className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-full"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          title="Sil"
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {!isLoading && filteredProjects.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-2xl border-dashed border-gray-800/60 text-white/50">
              <p className="font-semibold">
                {projects.length > 0
                  ? "Arama kriterlerinize uygun proje bulunamadı."
                  : "Henüz hiç proje kaydedilmemiş."}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ProjectListPage;
