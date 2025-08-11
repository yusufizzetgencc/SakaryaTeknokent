"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiUser,
  FiUserCheck,
  FiMail,
  FiLock,
  FiAtSign,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Kayıt başarılı!",
        text: "Giriş sayfasına yönlendiriliyorsunuz.",
        confirmButtonColor: "#000000",
        background: "#ffffff",
        backdrop: "rgba(0, 0, 0, 0.8)",
      }).then(() => {
        router.push("/login");
      });
    } else {
      toast.error(data.error || "Kayıt başarısız");
    }
    setLoading(false);
  };

  const inputs = [
    {
      label: "Ad",
      name: "firstName",
      type: "text",
      icon: <FiUser className="w-5 h-5" />,
    },
    {
      label: "Soyad",
      name: "lastName",
      type: "text",
      icon: <FiUserCheck className="w-5 h-5" />,
    },
    {
      label: "Kullanıcı Adı",
      name: "username",
      type: "text",
      icon: <FiAtSign className="w-5 h-5" />,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      icon: <FiMail className="w-5 h-5" />,
    },
    {
      label: "Şifre",
      name: "password",
      type: showPassword ? "text" : "password",
      icon: <FiLock className="w-5 h-5" />,
      hasToggle: true,
    },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden px-6 py-12 bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="absolute inset-0 bg-black/90" />

      {/* Floating Elements (monochrome) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-gray-700 to-gray-400 rounded-full opacity-10 blur-xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-gray-700 to-gray-500 rounded-full opacity-10 blur-xl"
        />
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full opacity-15 blur-lg"
        />
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
          staggerChildren: 0.1,
        }}
        className="relative backdrop-blur-xl bg-black/70 border border-white/20
                   shadow-2xl rounded-3xl p-10 max-w-md w-full space-y-6
                   hover:bg-black/80 transition-all duration-300"
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative text-center mb-8"
        >
          <h2
            className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 
                         bg-clip-text text-transparent mb-2"
          >
            Kayıt Ol
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-gray-400 to-gray-600 mx-auto rounded-full"></div>
        </motion.div>

        {inputs.map(({ label, name, type, icon, hasToggle }, index) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="relative flex flex-col space-y-3"
          >
            <Label
              htmlFor={name}
              className="text-white/90 font-semibold flex items-center space-x-1.5 text-sm"
            >
              <span className="text-indigo-300">{icon}</span>
              <span>{label}</span>
            </Label>

            <div className="relative group">
              <Input
                id={name}
                name={name}
                type={type}
                value={form[name as keyof typeof form]}
                onChange={handleChange}
                required
                placeholder={`${label} girin...`}
                className="
                  w-full bg-transparent
                  border-b-2 border-gray-600
                  text-white placeholder:text-gray-400
                  focus:border-indigo-400 focus:outline-none
                  hover:border-gray-400
                  transition-colors duration-300 ease-in-out
                  rounded-none px-3 py-3 text-sm
                  group-hover:shadow-lg group-hover:shadow-white/25
                "
              />

              {/* Password Toggle */}
              {hasToggle && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                           hover:text-white transition-colors duration-200"
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Focus ring */}
              <div
                className="absolute inset-0 rounded-none ring-2 ring-transparent 
                            group-focus-within:ring-white/50 transition-all duration-300 pointer-events-none"
              ></div>
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="pt-4"
        >
          <Button
            type="submit"
            disabled={loading}
            className="relative w-full bg-gradient-to-r from-gray-800 via-gray-900 to-black 
                     hover:from-gray-900 hover:via-gray-900 hover:to-gray-800
                     text-white text-lg font-semibold py-4 rounded-none
                     transform hover:scale-[1.02] active:scale-[0.98] 
                     transition-all duration-200 ease-in-out
                     shadow-md hover:shadow-lg hover:shadow-white/20
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
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <FiUser className="w-6 h-6" />
                  <span>Kaydol</span>
                </>
              )}
            </div>
          </Button>
        </motion.div>

        {/* Decorative elements */}
        <div
          className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-gray-600/20 to-gray-400/20 
                      rounded-full blur-xl pointer-events-none"
        ></div>
        <div
          className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-tr from-gray-700/20 to-gray-500/20 
                      rounded-full blur-lg pointer-events-none"
        ></div>
      </motion.form>
    </main>
  );
}
