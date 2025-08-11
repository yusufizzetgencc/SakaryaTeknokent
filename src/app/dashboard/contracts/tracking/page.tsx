"use client";

import { useState, FormEvent, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  FiActivity,
  FiSearch,
  FiLoader,
  FiInfo,
  FiCheck,
  FiChevronDown,
} from "react-icons/fi";

// Proje seçimi için tip
type ProjectFilter = {
  id: string;
  projectNumber: string;
  companyName: string;
};

type ProjectDetails = {
  id: string;
  companyName: string;
  academicianName: string;
  projectNumber: string;
  invoices: Invoice[];
};

type Invoice = {
  id: string;
  invoiceDate: string;
  amount: number | null;
  status: "PENDING" | "ISSUED" | "RECEIVED" | "PAID_OUT";
};

// ... Stage ve Connector bileşenleri aynı kalacak ...
const Stage = ({
  label,
  active,
  completed,
}: {
  label: string;
  active: boolean;
  completed: boolean;
}) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
        completed
          ? "bg-green-500 border-green-400"
          : active
          ? "bg-blue-500 border-blue-400 animate-pulse"
          : "bg-gray-600 border-gray-500"
      }`}
    >
      <FiCheck
        className={`transition-opacity ${
          completed ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
    <p
      className={`mt-2 text-xs text-center font-semibold transition-colors ${
        active || completed ? "text-white" : "text-white/50"
      }`}
    >
      {label}
    </p>
  </div>
);
const Connector = ({ completed }: { completed: boolean }) => (
  <div
    className={`flex-1 h-1 transition-colors duration-300 ${
      completed ? "bg-green-500" : "bg-gray-600"
    }`}
  ></div>
);

const InvoiceTrackingPage = () => {
  const [projectSearch, setProjectSearch] = useState("");
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allProjects, setAllProjects] = useState<ProjectFilter[]>([]);

  // Proje listesini çekmek için useEffect
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/contracts?basic=true");
        if (response.ok) {
          setAllProjects(await response.json());
        }
      } catch (error) {
        console.error("Projeler yüklenirken hata:", error);
      }
    };
    fetchProjects();
  }, []);

  // Proje getirme mantığını merkezi bir fonksiyona taşıma
  const getProjectDetails = async (numberToSearch: string) => {
    if (!numberToSearch) return;
    setIsLoading(true);
    setProject(null);
    try {
      const response = await fetch(
        `/api/contracts/search?projectNumber=${numberToSearch}`
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Proje bulunamadı.");
      }
      setProject(await response.json());
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    getProjectDetails(projectSearch);
  };

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProjectNumber = e.target.value;
    setProjectSearch(selectedProjectNumber);
    getProjectDetails(selectedProjectNumber);
  };

  // handleUpdateStage aynı kalıyor, backend düzeltildiği için artık çalışacak
  const handleUpdateStage = (
    invoiceId: string,
    currentStatus: Invoice["status"]
  ) => {
    const stageMap = {
      PENDING: { status: "ISSUED", label: "Fatura Kesim" },
      ISSUED: { status: "RECEIVED", label: "Ödeme Alınma" },
      RECEIVED: { status: "PAID_OUT", label: "Akademisyene Ödeme" },
    };

    const nextStage = stageMap[currentStatus as keyof typeof stageMap];
    if (!nextStage) return;

    Swal.fire({
      title: `${nextStage.label} Tarihi`,
      html: `<input type="date" id="swal-date" class="swal2-input" value="${
        new Date().toISOString().split("T")[0]
      }">`,
      confirmButtonText: "Onayla ve Kaydet",
      showCancelButton: true,
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#ffffff",
      confirmButtonColor: "#3b82f6",
      preConfirm: () =>
        (document.getElementById("swal-date") as HTMLInputElement).value,
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const promise = fetch(`/api/contracts/invoices/${invoiceId}/stage`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: nextStage.status,
            date: result.value,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "İşlem başarısız oldu.");
          }
          return res.json();
        });

        toast.promise(promise, {
          loading: "Durum güncelleniyor...",
          success: (updatedInvoice) => {
            setProject((prev) =>
              prev
                ? {
                    ...prev,
                    invoices: prev.invoices.map((inv) =>
                      inv.id === updatedInvoice.id ? updatedInvoice : inv
                    ),
                  }
                : null
            );
            return "Durum başarıyla güncellendi!";
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
          className="w-full max-w-6xl mx-auto"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-4">
              <FiActivity size={32} /> Fatura Takibi
            </h1>
            <p className="text-white/60 mt-2">
              Proje bazlı fatura süreçlerini yönetin ve takip edin.
            </p>
          </div>

          <div className="max-w-xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Proje No ile Ara..."
                  required
                  className="w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg pl-12 pr-4 py-3 text-white"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {isLoading && !project ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  "Bul"
                )}
              </button>
            </form>
            <div className="relative">
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <select
                onChange={handleProjectSelect}
                value={projectSearch}
                className="w-full h-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-4 py-3 text-white appearance-none"
              >
                <option value="">veya Proje Seçin...</option>
                {allProjects.map((p) => (
                  <option key={p.id} value={p.projectNumber}>
                    {p.companyName} ({p.projectNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ... Kalan JSX aynı ... */}
          <AnimatePresence>
            {isLoading && !project && (
              <div className="text-center py-16">
                <FiLoader className="animate-spin text-4xl text-white mx-auto" />
              </div>
            )}
            {project && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl"
              >
                <h2 className="text-2xl font-bold text-white">
                  {project.companyName}
                </h2>
                <p className="text-white/70">
                  Akademisyen: {project.academicianName} | Proje No:{" "}
                  {project.projectNumber}
                </p>
                <div className="mt-8 space-y-6">
                  {project.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="bg-black/20 p-4 rounded-lg border border-gray-700/60"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="font-semibold text-white">
                            Fatura Tarihi:{" "}
                            {new Date(invoice.invoiceDate).toLocaleDateString(
                              "tr-TR"
                            )}
                          </p>
                          {invoice.amount && (
                            <p className="text-sm text-white/70">
                              Tutar: {invoice.amount.toLocaleString("tr-TR")} TL
                            </p>
                          )}
                        </div>
                        {invoice.status !== "PAID_OUT" && (
                          <button
                            onClick={() =>
                              handleUpdateStage(invoice.id, invoice.status)
                            }
                            className="bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 text-sm font-semibold px-4 py-2 rounded-lg"
                          >
                            Sonraki Aşamaya Geç
                          </button>
                        )}
                      </div>
                      <div className="flex items-center w-full pt-4">
                        <Stage
                          label="Fatura Kesildi"
                          active={invoice.status === "PENDING"}
                          completed={[
                            "ISSUED",
                            "RECEIVED",
                            "PAID_OUT",
                          ].includes(invoice.status)}
                        />
                        <Connector
                          completed={[
                            "ISSUED",
                            "RECEIVED",
                            "PAID_OUT",
                          ].includes(invoice.status)}
                        />
                        <Stage
                          label="Ödeme Alındı"
                          active={invoice.status === "ISSUED"}
                          completed={["RECEIVED", "PAID_OUT"].includes(
                            invoice.status
                          )}
                        />
                        <Connector
                          completed={["RECEIVED", "PAID_OUT"].includes(
                            invoice.status
                          )}
                        />
                        <Stage
                          label="Akademisyene Ödendi"
                          active={invoice.status === "RECEIVED"}
                          completed={invoice.status === "PAID_OUT"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!project && !isLoading && (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-gray-800/60 text-white/50">
              <FiInfo className="mx-auto text-3xl mb-3" />
              <p className="font-semibold">
                Lütfen faturalarını görmek için bir proje arayın veya seçin.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default InvoiceTrackingPage;
