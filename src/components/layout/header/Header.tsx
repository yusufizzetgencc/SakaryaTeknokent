"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import Image from "next/image"; // üstte import'a ekle

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Header() {
  const { data: session, status } = useSession();

  // useSWR koşulsuz çağrıldı; url null olursa fetch yapılmaz
  const { data: userData, mutate } = useSWR(
    status === "authenticated" ? "/api/user/me" : null,
    fetcher
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const logoHref = session ? "/dashboard" : "/";

  // useEffect her renderda koşulsuz çağrılır, içeriği koşula bağlı
  useEffect(() => {
    if (session && status === "authenticated") {
      mutate();
    }
  }, [session, status, mutate]);

  const userName =
    userData?.user?.firstName && userData.user.firstName.trim() !== ""
      ? `${userData.user.firstName} ${userData.user.lastName}`
      : session?.user?.name || session?.user?.email || "Kullanıcı";

  // Loading durumunda placeholder renderla (hook’lar burada kullanıldı, sorun yok)
  if (status === "loading") {
    return (
      <header className="h-16 bg-gradient-to-r from-black via-gray-900 to-black" />
    );
  }

  return (
    <header
      className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-xl 
                 border-b border-[#34afd7]/40 sticky top-0 z-50 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href={logoHref} className="group block w-42 h-42 relative">
          <motion.div
            initial={{ scale: 1 }} // Normal boyut
            whileHover={{ scale: 1.15 }} // Hover'da sadece büyüme
            transition={{ duration: 0.2 }}
            className="w-full h-full rounded-xl overflow-hidden shadow-lg"
          >
            <Image
              src="/images/logooo.png"
              alt="Teknokent Logo"
              fill
              style={{ objectFit: "contain" }}
              priority
              sizes="56px"
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {!session && (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white font-medium transition-all duration-300
                           hover:scale-105 px-4 py-2 rounded-lg hover:bg-white/5"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="relative px-6 py-2 bg-gradient-to-r from-white/10 to-gray-200/10 
                           border border-white/20 text-white font-semibold rounded-xl
                           hover:from-white/20 hover:to-gray-200/20 hover:border-white/40
                           transform hover:scale-105 transition-all duration-300
                           shadow-lg hover:shadow-white/10 group overflow-hidden"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                             -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                ></div>
                <span className="relative">Kayıt Ol</span>
              </Link>
            </div>
          )}

          {session && session.user?.approved && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-sm
                           border border-white/10 rounded-xl hover:bg-white/10 
                           hover:border-white/20 transition-all duration-300
                           focus:outline-none focus:ring-2 focus:ring-white/20 group"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <div
                  className="w-8 h-8 bg-gradient-to-br from-white/20 to-gray-300/20 
                             rounded-lg flex items-center justify-center"
                >
                  <FiUser className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white/90 group-hover:text-white">
                  {userName}
                </span>
                <motion.div
                  animate={{ rotate: menuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronDown className="w-4 h-4 text-white/70" />
                </motion.div>
              </motion.button>

              {/* Desktop Dropdown */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-xl 
                               border border-white/20 rounded-2xl shadow-2xl py-2 z-10
                               overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                    <div className="relative">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white 
                                   hover:bg-white/10 transition-all duration-200"
                        onClick={() => setMenuOpen(false)}
                      >
                        <FiUser className="w-4 h-4" />
                        <span>Profilim</span>
                      </Link>

                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white 
                                   hover:bg-white/10 transition-all duration-200"
                        onClick={() => setMenuOpen(false)}
                      >
                        <FiSettings className="w-4 h-4" />
                        <span>Hesabım</span>
                      </Link>

                      <div className="border-t border-white/10 my-2"></div>

                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 
                                   hover:bg-red-500/10 transition-all duration-200"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Oturumu Kapat</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {session && !session.user?.approved && (
            <div
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 
                         rounded-xl"
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-300 font-semibold text-sm">
                Onay Bekleniyor
              </span>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            className="p-2 text-white/80 hover:text-white focus:outline-none 
                       focus:ring-2 focus:ring-white/20 rounded-xl
                       bg-white/5 hover:bg-white/10 transition-all duration-300"
          >
            <motion.div
              animate={{ rotate: menuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.div>
          </motion.button>

          {/* Mobile Dropdown */}
          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-16 right-4 w-64 bg-black/95 backdrop-blur-xl 
                           border border-white/20 rounded-2xl shadow-2xl py-3 z-20
                           overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                <div className="relative flex flex-col space-y-1">
                  {!session && (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white 
                                   hover:bg-white/10 transition-all duration-200"
                        onClick={() => setMenuOpen(false)}
                      >
                        <FiUser className="w-4 h-4" />
                        <span>Giriş Yap</span>
                      </Link>
                      <Link
                        href="/register"
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white 
                                   hover:bg-white/10 transition-all duration-200"
                        onClick={() => setMenuOpen(false)}
                      >
                        <FiUser className="w-4 h-4" />
                        <span>Kayıt Ol</span>
                      </Link>
                    </>
                  )}

                  {session && session.user?.approved && (
                    <>
                      <div className="px-4 py-2 border-b border-white/10 mb-2">
                        <p className="text-white/60 text-xs uppercase tracking-wider">
                          Hoş geldin
                        </p>
                        <p className="text-white font-semibold truncate">
                          {userName}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white 
                                   hover:bg-white/10 transition-all duration-200"
                        onClick={() => setMenuOpen(false)}
                      >
                        <FiUser className="w-4 h-4" />
                        <span>Profilim</span>
                      </Link>
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white 
                                   hover:bg-white/10 transition-all duration-200"
                        onClick={() => setMenuOpen(false)}
                      >
                        <FiSettings className="w-4 h-4" />
                        <span>Hesabım</span>
                      </Link>

                      <div className="border-t border-white/10 my-2"></div>

                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 
                                   hover:bg-red-500/10 transition-all duration-200"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Oturumu Kapat</span>
                      </button>
                    </>
                  )}

                  {session && !session.user?.approved && (
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-yellow-300 font-semibold">
                        Onay Bekleniyor
                      </span>
                    </div>
                  )}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
