"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  FiLogIn,
  FiUserPlus,
  FiArrowRight,
  FiShield,
  FiZap,
  FiUsers,
} from "react-icons/fi";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6 text-center bg-black">
      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-800/50 via-transparent to-gray-900/50"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-gray-600/30 to-gray-400/30 rounded-full blur-2xl"
        />

        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-gray-600/20 to-gray-500/20 rounded-full blur-2xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-r from-gray-500/25 to-gray-400/25 rounded-full blur-xl"
        />
      </div>

      {/* Main Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative backdrop-blur-sm bg-gray-900/80 border border-gray-700
                   shadow-2xl rounded-3xl p-12 max-w-4xl w-full
                   hover:bg-gray-900/90 transition-all duration-500"
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-transparent rounded-3xl pointer-events-none"></div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-700 to-gray-500 
                       rounded-2xl flex items-center justify-center shadow-lg"
          >
            <FiShield className="w-10 h-10 text-white" />
          </motion.div>

          <h1
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-400 to-gray-300 
                         bg-clip-text text-transparent mb-6 leading-tight"
          >
            Sisteme Hoş Geldiniz
          </h1>

          <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-gray-600 mx-auto rounded-full mb-6"></div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Güvenli ve modern platformumuzda yetkilerinizi yönetin. Devam etmek
            için sisteme giriş yapın veya yeni hesap oluşturun.
          </motion.p>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {[
            {
              icon: <FiShield className="w-6 h-6 text-gray-300" />,
              title: "Güvenli",
              desc: "256-bit SSL şifreleme",
            },
            {
              icon: <FiZap className="w-6 h-6 text-gray-300" />,
              title: "Hızlı",
              desc: "Anında erişim",
            },
            {
              icon: <FiUsers className="w-6 h-6 text-gray-300" />,
              title: "Kolay",
              desc: "Kullanıcı dostu arayüz",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 
                       hover:bg-gray-700/90 transition-all duration-300 group"
            >
              <div
                className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl 
                            flex items-center justify-center mb-4 mx-auto group-hover:scale-110 
                            transition-transform duration-300"
              >
                <span className="text-white">{feature.icon}</span>
              </div>
              <h3 className="font-semibold text-gray-300 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                className="relative w-full sm:w-auto bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800
                         hover:from-gray-800 hover:via-gray-700 hover:to-gray-900
                         text-white text-lg font-semibold px-8 py-4 rounded-xl
                         shadow-lg hover:shadow-xl hover:shadow-white/25
                         border-0 transition-all duration-300
                         group overflow-hidden"
              >
                {/* Button shine effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                              -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                ></div>

                <span className="relative flex items-center space-x-3">
                  <FiLogIn className="w-5 h-5" />
                  <span>Giriş Yap</span>
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>
            </motion.div>
          </Link>

          <Link href="/register">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                className="relative w-full sm:w-auto bg-transparent
                         border-2 border-gray-600
                         text-gray-300 hover:text-white text-lg font-semibold 
                         px-8 py-4 rounded-xl
                         shadow-md hover:shadow-lg hover:shadow-white/30
                         hover:bg-gray-800 transition-all duration-300
                         group overflow-hidden"
              >
                {/* Button shine effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                              -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                ></div>

                <span className="relative flex items-center space-x-3">
                  <FiUserPlus className="w-5 h-5" />
                  <span>Kayıt Ol</span>
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Decorative Elements */}
        <div
          className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-gray-600/30 to-gray-400/30 
                      rounded-full blur-2xl pointer-events-none"
        ></div>
        <div
          className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-tr from-gray-700/30 to-gray-500/30 
                      rounded-full blur-xl pointer-events-none"
        ></div>
      </motion.div>

      {/* Floating Stats */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="relative mt-8 text-gray-500 text-sm"
      >
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Sistem Aktif</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <FiShield className="w-4 h-4 text-gray-400" />
            <span>Güvenli Bağlantı</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
