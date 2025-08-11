"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiLogIn, FiUserPlus } from "react-icons/fi";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      callbackUrl: "/dashboard",
      email: identifier,
      password,
    });

    setLoading(false);

    if (res) {
      if ("error" in res && res.error) {
        if (res.error === "Hesabınız henüz onaylanmadı.") {
          router.push("/onay-bekleniyor");
          return;
        }
        toast.error("E-posta veya şifre hatalı.");
        return;
      }
      // Başarılı girişte Swal bildirimi
      await Swal.fire({
        icon: "success",
        title: "Hoş geldiniz!",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        background: "rgba(0, 0, 0, 0.9)",
        color: "#ffffff",
        didOpen: () => {
          Swal.showLoading();
        },
      });
      router.push(res.url || "/dashboard");
    } else {
      toast.error("Giriş yapılamadı. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 120, 0],
            y: [0, -80, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-white/10 to-gray-300/10 rounded-full blur-2xl"
        />

        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 120, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-gray-400/10 to-white/10 rounded-full blur-2xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 right-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl"
        />
      </div>

      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 
                   shadow-2xl rounded-3xl p-10 space-y-8
                   hover:bg-white/10 transition-all duration-300"
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none"></div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative text-center mb-8"
        >
          <h2
            className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 
                         bg-clip-text text-transparent mb-3"
          >
            Giriş Yap
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-white/60 to-gray-400/60 mx-auto rounded-full"></div>
        </motion.div>

        {/* Email/Username Input */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative space-y-3"
        >
          <Label
            htmlFor="identifier"
            className="text-white/90 font-semibold flex items-center space-x-2 text-sm"
          >
            <FiMail className="w-4 h-4 text-gray-300" />
            <span>E-posta veya Kullanıcı Adı</span>
          </Label>

          <div className="relative group">
            <Input
              id="identifier"
              type="text"
              placeholder="ornek@teknokent.com veya kullaniciadi"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              autoComplete="username"
              className="
                w-full bg-white/10 backdrop-blur-sm border border-white/20 
                text-white placeholder:text-white/50
                focus:bg-white/20 focus:border-white/40 focus:outline-none
                hover:bg-white/15 hover:border-white/30
                transition-all duration-300 ease-in-out
                rounded-xl pl-12 pr-4 py-3 text-sm
                group-hover:shadow-lg group-hover:shadow-white/10
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />

            {/* Icon */}
            <FiMail
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 
                             transition-colors duration-300 group-hover:text-white/80"
            />

            {/* Focus ring */}
            <div
              className="absolute inset-0 rounded-xl ring-2 ring-transparent 
                          group-focus-within:ring-white/30 transition-all duration-300 pointer-events-none"
            ></div>
          </div>
        </motion.div>

        {/* Password Input */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="relative space-y-3"
        >
          <Label
            htmlFor="password"
            className="text-white/90 font-semibold flex items-center space-x-2 text-sm"
          >
            <FiLock className="w-4 h-4 text-gray-300" />
            <span>Şifre</span>
          </Label>

          <div className="relative group">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              className="
                w-full bg-white/10 backdrop-blur-sm border border-white/20 
                text-white placeholder:text-white/50
                focus:bg-white/20 focus:border-white/40 focus:outline-none
                hover:bg-white/15 hover:border-white/30
                transition-all duration-300 ease-in-out
                rounded-xl pl-12 pr-12 py-3 text-sm
                group-hover:shadow-lg group-hover:shadow-white/10
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />

            {/* Lock Icon */}
            <FiLock
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 
                             transition-colors duration-300 group-hover:text-white/80"
            />

            {/* Eye Toggle */}
            <button
              type="button"
              onClick={toggleShowPassword}
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 
                       hover:text-white/80 transition-colors duration-200
                       disabled:opacity-50"
              tabIndex={-1}
              disabled={loading}
            >
              {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </button>

            {/* Focus ring */}
            <div
              className="absolute inset-0 rounded-xl ring-2 ring-transparent 
                          group-focus-within:ring-white/30 transition-all duration-300 pointer-events-none"
            ></div>
          </div>
        </motion.div>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="pt-2"
        >
          <Button
            type="submit"
            disabled={loading}
            className="relative w-full bg-gradient-to-r from-gray-800 via-black to-gray-900 
                     hover:from-gray-700 hover:via-gray-800 hover:to-black
                     text-white text-lg font-semibold py-4 rounded-xl 
                     border border-white/20 hover:border-white/30
                     transform hover:scale-[1.02] active:scale-[0.98] 
                     transition-all duration-200 ease-in-out
                     shadow-lg hover:shadow-xl hover:shadow-black/50
                     disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                     overflow-hidden group"
          >
            {/* Button shine effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                          -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            ></div>

            <div className="relative flex items-center justify-center space-x-3">
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  </motion.div>
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                <>
                  <FiLogIn className="w-6 h-6" />
                  <span>Giriş Yap</span>
                </>
              )}
            </div>
          </Button>
        </motion.div>

        {/* Register Link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="relative text-center"
        >
          <p className="text-white/70 text-sm">
            Hesabınız yok mu?{" "}
            <a
              href="/register"
              className="text-white hover:text-gray-300 font-semibold 
                       transition-colors duration-200 inline-flex items-center space-x-1
                       hover:underline underline-offset-2"
            >
              <span>Kayıt Ol</span>
              <FiUserPlus className="w-4 h-4" />
            </a>
          </p>
        </motion.div>

        {/* Decorative elements */}
        <div
          className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-white/10 to-gray-300/10 
                      rounded-full blur-xl pointer-events-none"
        ></div>
        <div
          className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-tr from-gray-400/10 to-white/10 
                      rounded-full blur-lg pointer-events-none"
        ></div>
      </motion.form>
    </div>
  );
}
