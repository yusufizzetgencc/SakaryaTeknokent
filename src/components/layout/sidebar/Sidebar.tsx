"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { Session } from "next-auth";
import { motion, AnimatePresence } from "framer-motion";
import { FaScrewdriverWrench } from "react-icons/fa6";
import { FcIdea } from "react-icons/fc";
import { AiFillProject } from "react-icons/ai";

import {
  HiOutlineShoppingCart,
  HiOutlineCheck,
  HiOutlineAdjustments,
  HiChevronRight,
  HiOutlinePlusCircle,
  HiOutlineClipboardCheck,
  HiOutlineUser,
  HiOutlineTag,
  HiOutlineCheckCircle,
  HiOutlineBadgeCheck,
  HiOutlineDocumentSearch,
  HiOutlineSave,
  HiOutlineDeviceTablet,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlinePencilAlt,
  HiOutlineThumbUp,
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineDocumentReport,
  HiOutlineFolderOpen,
  HiOutlineUpload,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlinePresentationChartLine,
} from "react-icons/hi";

interface SidebarProps {
  session: Session | null;
  permissions?: string[]; // opsiyonel
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  requiredPermissions?: string[];
}

interface MenuSection {
  label: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    label: "İzin İşlemleri",
    icon: <HiOutlineClipboardList size={20} />,
    items: [
      {
        label: "İzin Talebi Oluştur",
        href: "/dashboard/leave/new",
        icon: <HiOutlineCalendar size={20} />,
        requiredPermissions: ["create_leave_request"],
      },
      {
        label: "İzin Taleplerim",
        href: "/dashboard/leave/my-requests",
        icon: <HiOutlineCheck size={20} />,
        requiredPermissions: ["view_leave_request"],
      },
      {
        label: "İzin Talebi Onaylama",
        href: "/dashboard/leave/pending-requests",
        icon: <HiOutlineUserGroup size={20} />,
        requiredPermissions: ["approving_leave_request"],
      },
      {
        label: "Tüm İzin Talepleri",
        href: "/dashboard/leave/all",
        icon: <HiOutlineAdjustments size={20} />,
        requiredPermissions: ["view_all_leave_requests"],
      },
    ],
  },
  {
    label: "Satın Alma İşlemleri",
    icon: <HiOutlineShoppingCart size={20} />,
    items: [
      {
        label: "Satın Alma Talebi Oluşturma",
        href: "/dashboard/purchase-request/new",
        icon: <HiOutlinePlusCircle size={20} />,
        requiredPermissions: ["creating_purchase_request"],
      },
      {
        label: "Satın Alma Taleplerim",
        href: "/dashboard/purchase-request/my-request",
        icon: <HiOutlineClipboardCheck size={20} />,
        requiredPermissions: ["view_purchase_requests"],
      },
      {
        label: "Onaylı Tedarikçiler",
        href: "/dashboard/suppliers",
        icon: <HiOutlineUser size={20} />,
        requiredPermissions: ["adding_supplier"],
      },
      {
        label: "Kategoriler",
        href: "/dashboard/purchase-categories",
        icon: <HiOutlineTag size={20} />,
        requiredPermissions: ["updating_purchasing_categories"],
      },
      {
        label: "Birinci Onay",
        href: "/dashboard/purchase-request/new/second-approval",
        icon: <HiOutlineCheckCircle size={20} />,
        requiredPermissions: ["first_approval"],
      },
      {
        label: "İkinci Onay",
        href: "/dashboard/purchase-request/new/third-approval",
        icon: <HiOutlineBadgeCheck size={20} />,
        requiredPermissions: ["second_approval"],
      },
      {
        label: "Üçüncü Onay",
        href: "/dashboard/purchase-request/new/fourth-approval",
        icon: <HiOutlineShieldCheck size={20} />,
        requiredPermissions: ["third_approval"],
      },
      {
        label: "Fatura Yükleme",
        href: "/dashboard/purchase-request/new/invoice-upload",
        icon: <HiOutlineUpload size={20} />,
        requiredPermissions: ["invoice_upload"],
      },
      {
        label: "Fatura Kontrol",
        href: "/dashboard/purchase-request/new/invoice-price-check",
        icon: <HiOutlineDocumentSearch size={20} />,
        requiredPermissions: ["invoice_check"],
      },
      {
        label: "Faturayı Kaydet",
        href: "/dashboard/purchase-request/new/accounting-invoice",
        icon: <HiOutlineSave size={20} />,
        requiredPermissions: ["invoice_register"],
      },
      {
        label: "Talep Aşaması",
        href: "/dashboard/purchase-request/new/stages",
        icon: <HiOutlinePresentationChartLine size={20} />,
        requiredPermissions: ["request_phase"],
      },
    ],
  },
  {
    label: "Bakım İşlemleri",
    icon: <FaScrewdriverWrench size={20} />,
    items: [
      {
        label: "Bakım Kategorileri",
        href: "/dashboard/maintenance/maintenance-categories",
        icon: <HiOutlineTag size={20} />, // Kategori için etiket ikonu
        requiredPermissions: ["maintenance_categories"],
      },
      {
        label: "Teknik Ekipman Ekleme",
        href: "/dashboard/maintenance/technical-equipment-add",
        icon: <HiOutlinePlusCircle size={20} />, // Ekleme için artı işareti
        requiredPermissions: ["add_new_device"],
      },
      {
        label: "Ekipmanlar",
        href: "/dashboard/maintenance/devices",
        icon: <HiOutlineDeviceTablet size={20} />, // Ekipman için cihaz ikonu
        requiredPermissions: ["viewing_devices"],
      },
      {
        label: "Yıllık Bakım Planlama",
        href: "/dashboard/maintenance/planning",
        icon: <HiOutlineCalendar size={20} />, // Planlama için takvim
        requiredPermissions: ["annual_maintenance_planning"],
      },
      {
        label: "Periyodik Kontrol",
        href: "/dashboard/maintenance/periodic-control",
        icon: <HiOutlineRefresh size={20} />, // Periyodik, tekrar eden işlem için döngü ikonu
        requiredPermissions: ["periodic_control"],
      },
      {
        label: "Arıza Takip",
        href: "/dashboard/maintenance/fault-tracking",
        icon: <HiOutlineExclamationCircle size={20} />, // Arıza, uyarı için ünlem işareti
        requiredPermissions: ["fault_management"],
      },
      {
        label: "Rapor",
        href: "/dashboard/maintenance/reports",
        icon: <HiOutlineDocumentReport size={20} />, // Rapor için doküman ikonu
        requiredPermissions: ["maintenance_reporting"],
      },
    ],
  },
  {
    label: "Fikrim Var",
    icon: <FcIdea size={20} />,
    items: [
      {
        label: "Kategoriler",
        href: "/dashboard/ideas/categories",
        icon: <HiOutlineFolderOpen size={20} />, // Klasör ikonu, kategori için uygun
        requiredPermissions: ["view_users"],
      },
      {
        label: "Fikrini Yaz",
        href: "/dashboard/ideas/submit",
        icon: <HiOutlinePencilAlt size={20} />, // Yazma kalem ikonu
        requiredPermissions: ["viewing_pending_approval"],
      },
      {
        label: "Fikirleri Oylama",
        href: "/dashboard/ideas/vote",
        icon: <HiOutlineThumbUp size={20} />, // Onay, oylama için uygun
        requiredPermissions: ["role_authority_editing"],
      },
      {
        label: "Admin Raporları",
        href: "/dashboard/ideas/reports-admin",
        icon: <HiOutlineChartBar size={20} />, // Grafik rapor ikonu
        requiredPermissions: ["role_authority_editing"],
      },
      {
        label: "Oylama Raporları",
        href: "/dashboard/ideas/reports-results",
        icon: <HiOutlineClipboardList size={20} />, // Liste rapor ikonu
        requiredPermissions: ["role_authority_editing"],
      },
      {
        label: "Fikirlerim",
        href: "/dashboard/ideas/my-ideas",
        icon: <HiOutlineDocumentReport size={20} />, // Belge raporu, fikirler için uygun
        requiredPermissions: ["role_authority_editing"],
      },
    ],
  },
  {
    label: "Proje Takip",
    icon: <AiFillProject size={20} />, // Proje güvenlik, takip simgesi olarak koruyucu simge
    items: [
      {
        label: "Döküman Yükleme",
        href: "/dashboard/contracts/new",
        icon: <HiOutlineUpload size={20} />, // Yükleme simgesi
        requiredPermissions: ["view_users"],
      },
      {
        label: "Fatura Takip",
        href: "/dashboard/contracts/calendar",
        icon: <HiOutlineCalendar size={20} />, // Takvim simgesi
        requiredPermissions: ["view_users"],
      },
      {
        label: "Ödeme Sayfası",
        href: "/dashboard/contracts/tracking",
        icon: <HiOutlineCash size={20} />, // Ödeme parası simgesi
        requiredPermissions: ["view_users"],
      },
      {
        label: "Rapor",
        href: "/dashboard/contracts/reports",
        icon: <HiOutlinePresentationChartLine size={20} />, // Sunum rapor simgesi
        requiredPermissions: ["view_users"],
      },
      {
        label: "Projeler",
        href: "/dashboard/contracts",
        icon: <HiOutlineUserGroup size={20} />, // Grup simgesi, projeler için uygun
        requiredPermissions: ["view_users"],
      },
    ],
  },
  {
    label: "Admin İşlemleri",
    icon: <HiOutlineShieldCheck size={20} />,
    items: [
      {
        label: "Kullanıcılar",
        href: "/dashboard/admin/users",
        icon: <HiOutlineUserGroup size={20} />,
        requiredPermissions: ["view_users"],
      },
      {
        label: "Onay Bekleyenler",
        href: "/dashboard/admin/users-awaiting",
        icon: <HiOutlineCheck size={20} />,
        requiredPermissions: ["viewing_pending_approval"],
      },
      {
        label: "Roller & Yetkiler",
        href: "/dashboard/admin/roles",
        icon: <HiOutlineAdjustments size={20} />,
        requiredPermissions: ["role_authority_editing"],
      },
    ],
  },
];

export default function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session?.user) {
      setIsApproved(false);
      return;
    }

    setIsApproved(session.user.approved ?? false);

    if (!session.user.approved) return;

    const fetchPermissions = async () => {
      setLoadingPermissions(true);
      try {
        const res = await fetch("/api/user/permissions");
        if (!res.ok) throw new Error("İzinler alınamadı.");
        const data = await res.json();
        setUserPermissions(
          Array.isArray(data.permissions)
            ? data.permissions.map((p: { key: string }) => p.key)
            : []
        );
      } catch (error) {
        console.error("İzinler yüklenirken hata:", error);
        setUserPermissions([]);
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [session]);

  if (isApproved === false) {
    console.warn("Sidebar: Kullanıcı onaylı değil, sidebar gösterilmiyor.");
    return null;
  }

  const toggleSection = (label: string) => {
    setExpandedSection((prev) => (prev === label ? null : label));
  };

  const hasRequiredPermissions = (requiredPermissions?: string[]) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.every((perm) => userPermissions.includes(perm));
  };

  if (loadingPermissions) {
    return (
      <aside
        className="w-72 min-w-[288px] flex-shrink-0 bg-gradient-to-b from-black via-gray-900 to-black 
                      border-r border-white/40 min-h-screen p-6 hidden md:flex flex-col overflow-y-auto"
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full"
            />
            <p className="text-white/60 text-sm">Yükleniyor...</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 min-w-[288px] flex-shrink-0 bg-gradient-to-b from-black via-gray-900 to-black border-r border-[#34afd7]/40 min-h-screen hidden md:flex flex-col overflow-y-auto shadow-2xl">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 bg-gradient-to-br from-white/20 to-gray-300/20 rounded-xl 
                        flex items-center justify-center"
          >
            <HiOutlineAdjustments className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Menü</h2>
            <p className="text-white/60 text-xs">Navigasyon Çubuğu</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 p-6 space-y-2">
        {menuSections.map(({ label, icon, items }) => {
          const filteredItems = items.filter((item) => {
            if (
              item.roles &&
              !item.roles.includes(session?.user?.role as string)
            )
              return false;
            if (!hasRequiredPermissions(item.requiredPermissions)) return false;
            return true;
          });

          if (filteredItems.length === 0) return null;

          const isExpanded = expandedSection === label;

          return (
            <div key={label} className="mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSection(label)}
                className="flex items-center justify-between w-full p-3 
                         bg-white/5 hover:bg-white/10 backdrop-blur-sm
                         border border-white/10 hover:border-white/20
                         rounded-xl transition-all duration-300
                         focus:outline-none focus:ring-2 focus:ring-white/20
                         group"
                aria-expanded={isExpanded}
                aria-controls={`${label}-submenu`}
                id={`${label}-button`}
                type="button"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center
                                group-hover:bg-white/20 transition-colors duration-300"
                  >
                    <span className="text-white/80 group-hover:text-white">
                      {icon}
                    </span>
                  </div>
                  <span className="text-white/90 group-hover:text-white font-medium text-sm">
                    {label}
                  </span>
                </div>

                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-white/60 group-hover:text-white/80"
                >
                  <HiChevronRight size={16} />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.nav
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    id={`${label}-submenu`}
                    role="region"
                    aria-labelledby={`${label}-button`}
                    className="mt-2 ml-4 space-y-1 overflow-hidden"
                  >
                    {filteredItems.map(
                      ({ label: itemLabel, href, icon: itemIcon }, index) => {
                        const isActive = pathname === href;
                        return (
                          <motion.div
                            key={href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                          >
                            <Link
                              href={href}
                              className={`flex items-center space-x-3 p-3 rounded-lg
                                     transition-all duration-300 group
                                     ${
                                       isActive
                                         ? "bg-white/20 text-white border-l-2 border-white shadow-lg"
                                         : "text-white/70 hover:text-white hover:bg-white/10"
                                     }`}
                            >
                              <div
                                className={`w-6 h-6 flex items-center justify-center
                                          ${
                                            isActive
                                              ? "text-white"
                                              : "text-white/60 group-hover:text-white/80"
                                          }`}
                              >
                                {itemIcon}
                              </div>
                              <span className="text-sm font-medium">
                                {itemLabel}
                              </span>

                              {/* Active indicator */}
                              {isActive && (
                                <motion.div
                                  layoutId="activeIndicator"
                                  className="ml-auto w-2 h-2 bg-white rounded-full"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                />
                              )}
                            </Link>
                          </motion.div>
                        );
                      }
                    )}
                  </motion.nav>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center space-x-2 text-white/40 text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Sistem Aktif</span>
        </div>
      </div>
    </aside>
  );
}
