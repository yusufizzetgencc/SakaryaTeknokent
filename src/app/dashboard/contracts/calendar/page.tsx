"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiFilter,
  FiLoader,
  FiX,
  FiPaperclip,
  FiUploadCloud,
  FiCheckCircle,
} from "react-icons/fi";
import FullCalendar from "@fullcalendar/react";
import { EventClickArg, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";

type ProjectFilter = {
  id: string;
  projectNumber: string;
  companyName: string;
};

type EventClickInfo = {
  id: string;
  title: string;
  start: Date;
  extendedProps: {
    projectNumber: string;
    amount: number | null;
    status: "PENDING" | "PAID" | "OVERDUE";
    fileUrl: string | null;
    projectContractId: string;
  };
};

interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    projectNumber: string;
    amount: number | null;
    status: "PENDING" | "PAID" | "OVERDUE";
    fileUrl: string | null;
    projectContractId: string;
  };
}

const PROJECT_COLORS = [
  "#16a34a",
  "#2563eb",
  "#ca8a04",
  "#c026d3",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#4d7c0f",
  "#1d4ed8",
  "#be185d",
  "#0f766e",
  "#581c87",
];

const InvoiceCalendarPage = () => {
  const [projects, setProjects] = useState<ProjectFilter[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [currentView, setCurrentView] = useState<"year" | "month">("year");
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarRef = useRef<FullCalendar>(null);
  const [, setProjectColorMap] = useState<Map<string, string>>(new Map());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventClickInfo | null>(
    null
  );
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/contracts?basic=true");
        if (response.ok) {
          setProjects(await response.json());
        } else {
          throw new Error("Projeler yüklenemedi.");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu."
        );
      }
    };
    fetchProjects();
  }, []);

  const assignColorsAndSetEvents = useCallback((data: CalendarEvent[]) => {
    setProjectColorMap((prevMap) => {
      const newColorMap = new Map(prevMap);
      let colorIndex = newColorMap.size;

      const coloredEvents = data.map((event) => {
        const projectId = event.extendedProps.projectContractId;
        let color = newColorMap.get(projectId);

        if (!color) {
          color = PROJECT_COLORS[colorIndex % PROJECT_COLORS.length];
          newColorMap.set(projectId, color);
          colorIndex++;
        }
        return { ...event, backgroundColor: color, borderColor: color };
      });

      setEvents(coloredEvents);
      return newColorMap;
    });
  }, []);

  const fetchInvoiceEvents = useCallback(async () => {
    setIsLoading(true);
    let url = "/api/contracts/invoices";
    if (selectedProjectId) url += `?projectId=${selectedProjectId}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Fatura takvimi yüklenemedi.");
      const data: CalendarEvent[] = await response.json();
      assignColorsAndSetEvents(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId, assignColorsAndSetEvents]);

  useEffect(() => {
    fetchInvoiceEvents();
  }, [fetchInvoiceEvents]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (currentView === "year") return;

    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start ?? new Date(),
      extendedProps: event.extendedProps as EventClickInfo["extendedProps"],
    });
    setIsModalOpen(true);
  };

  const handleDateClick = (clickInfo: DateClickArg) => {
    if (currentView === "year") {
      setCurrentView("month");
      setCurrentDate(clickInfo.date);
    }
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    if (eventInfo.view.type === "multiMonthYear") {
      return (
        <div className="w-full flex justify-center items-center">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: eventInfo.backgroundColor }}
          ></div>
        </div>
      );
    }
    return (
      <div className="w-full p-1 text-xs font-semibold text-white rounded-md overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer">
        {eventInfo.event.title}
      </div>
    );
  };

  const handleBackToYearView = () => {
    setCurrentView("year");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInvoiceFile(null);
    setSelectedEvent(null);
  };

  const handleInvoiceUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!invoiceFile || !selectedEvent) {
      toast.error("Lütfen bir fatura dosyası seçin.");
      return;
    }
    setIsUploading(true);

    const formData = new FormData();
    formData.append("invoiceFile", invoiceFile);
    formData.append("paymentDate", new Date().toISOString());

    const promise = fetch(`/api/contracts/invoices/${selectedEvent.id}`, {
      method: "PATCH",
      body: formData,
    }).then(async (res) => {
      if (!res.ok)
        throw new Error((await res.json()).error || "İşlem başarısız.");
    });

    toast.promise(promise, {
      loading: "Fatura yükleniyor...",
      success: () => {
        fetchInvoiceEvents();
        closeModal();
        return "Fatura başarıyla ödendi olarak işaretlendi!";
      },
      error: (err) => err.message,
      finally: () => setIsUploading(false),
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
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-4">
              <FiCalendar size={32} /> Fatura Takip Takvimi
            </h1>
            <p className="text-white/60 mt-2">
              Yıllık genel bakış için aya tıklayarak detayları görüntüleyin.
            </p>
          </div>

          <div className="max-w-md mx-auto mb-8 bg-white/5 p-4 rounded-xl flex items-center gap-4">
            <FiFilter className="text-white/70" />
            <select
              onChange={(e) => setSelectedProjectId(e.target.value)}
              value={selectedProjectId}
              className="w-full bg-transparent text-white focus:outline-none"
            >
              <option value="" className="bg-gray-800">
                Tüm Projeleri Göster
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-gray-800">
                  {p.companyName} ({p.projectNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-800/60 calendar-container">
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <FiLoader className="animate-spin text-4xl text-white" />
              </div>
            ) : (
              <FullCalendar
                key={currentView}
                ref={calendarRef}
                plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin]}
                initialView={
                  currentView === "year" ? "multiMonthYear" : "dayGridMonth"
                }
                initialDate={currentDate}
                locale="tr"
                firstDay={1}
                events={events}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                dateClick={handleDateClick}
                height="auto"
                headerToolbar={
                  currentView === "month"
                    ? {
                        left: "prev,next today",
                        center: "title",
                        right: "backToYear",
                      }
                    : {
                        left: "prevYear,nextYear",
                        center: "title",
                        right: "",
                      }
                }
                customButtons={{
                  backToYear: {
                    text: "Yıl Görünümü",
                    click: handleBackToYearView,
                  },
                }}
              />
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1a1a1a] border border-gray-700 w-full max-w-lg rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Fatura Detayı</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Kapat"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="space-y-2 text-white/80">
                <p>
                  <strong>Proje:</strong> {selectedEvent.title}
                </p>
                <p>
                  <strong>Proje No:</strong>{" "}
                  {selectedEvent.extendedProps.projectNumber}
                </p>
                <p>
                  <strong>Fatura Tarihi:</strong>{" "}
                  {selectedEvent.start.toLocaleDateString("tr-TR")}
                </p>
                <p>
                  <strong>Tutar:</strong>{" "}
                  {selectedEvent.extendedProps.amount
                    ? `${selectedEvent.extendedProps.amount.toLocaleString(
                        "tr-TR"
                      )} TL`
                    : "Belirtilmemiş"}
                </p>
                <p>
                  <strong>Durum:</strong>{" "}
                  <span className="font-semibold">
                    {selectedEvent.extendedProps.status === "PENDING" &&
                      "Beklemede"}
                    {selectedEvent.extendedProps.status === "PAID" && "Ödendi"}
                    {selectedEvent.extendedProps.status === "OVERDUE" &&
                      "Gecikmiş"}
                  </span>
                </p>
                {selectedEvent.extendedProps.fileUrl && (
                  <a
                    href={selectedEvent.extendedProps.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:underline transition-colors"
                  >
                    <FiPaperclip /> Ödenen Faturayı Görüntüle
                  </a>
                )}
              </div>
              {selectedEvent.extendedProps.status !== "PAID" && (
                <form
                  onSubmit={handleInvoiceUpload}
                  className="mt-6 pt-6 border-t border-white/20"
                >
                  <h4 className="font-semibold text-white mb-3">
                    Faturayı Ödendi Olarak İşaretle
                  </h4>
                  <label className="flex items-center gap-2.5 mb-2 text-gray-300 font-medium">
                    <FiUploadCloud /> Ödenmiş Fatura Dosyası *
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setInvoiceFile(e.target.files?.[0] ?? null)
                    }
                    required
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg p-2 text-sm text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:font-semibold file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <FiLoader className="animate-spin" /> Yükleniyor...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle /> Yükle ve Ödendi Olarak İşaretle
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .fc {
          color: white;
        }
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
        }
        .fc .fc-daygrid-day-number {
          color: #9ca3af;
        }
        .fc .fc-day-today {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
        .fc .fc-button {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          text-transform: capitalize;
        }
        .fc .fc-button-primary:not(:disabled):active,
        .fc .fc-button-primary:not(:disabled):hover {
          background-color: #1f2937 !important;
        }
        .fc .fc-col-header-cell {
          background-color: rgba(31, 41, 55, 0.5) !important;
          color: #d1d5db;
        }
        .fc .fc-col-header-cell-cushion {
          color: #d1d5db !important;
        }
      `}</style>
    </>
  );
};

export default InvoiceCalendarPage;
