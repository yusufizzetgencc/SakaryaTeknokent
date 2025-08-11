"use client";

import React, { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import { toast, Toaster } from "sonner";
import Swal from "sweetalert2";

type UserData = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
};

export default function AccountPage() {
  const { data: session, status } = useSession();

  const [userData, setUserData] = useState<UserData>({
    id: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    async function fetchUser() {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) throw new Error("Kullanıcı verisi alınamadı.");
        const data = await res.json();
        setUserData(data.user);
      } catch {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: "Kullanıcı bilgileri yüklenirken hata oluştu.",
        });
      }
    }

    fetchUser();
  }, [session]);

  if (status === "loading")
    return (
      <p className="text-center mt-20 text-gray-500 font-semibold">
        Yükleniyor...
      </p>
    );
  if (!session)
    return (
      <p className="text-center mt-20 text-red-600 font-semibold">
        Giriş yapmanız gerekiyor.
      </p>
    );
  if (!userData.id)
    return (
      <p className="text-center mt-20 text-gray-500 font-semibold">
        Kullanıcı verisi yükleniyor...
      </p>
    );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Omit<UserData, "id">
  ) {
    setUserData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (newPassword && newPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Uyarı",
        text: "Yeni şifre en az 6 karakter olmalıdır.",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          email: userData.email,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Bilgileriniz başarıyla güncellendi.");
        setNewPassword("");
        await getSession(); // session cache'ini yeniler
        // Arka planda sayfayı yenile (fetchUser fonksiyonunu çağırabilir veya sayfayı yeniden yükleyebiliriz)
        window.location.reload();
      } else {
        Swal.fire({
          icon: "error",
          title: "Hata",
          text: data.message || "Güncelleme başarısız oldu.",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: "Sunucu hatası oluştu.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-3xl shadow-2xl mt-12 border border-gray-200 relative">
      <Toaster position="top-center" />
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
        Hesabım
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {[
          { label: "Ad", field: "firstName", type: "text" },
          { label: "Soyad", field: "lastName", type: "text" },
          { label: "Kullanıcı Adı", field: "username", type: "text" },
          { label: "E-posta", field: "email", type: "email" },
        ].map(({ label, field, type }) => (
          <div key={field}>
            <label
              htmlFor={field}
              className="block text-gray-800 font-semibold mb-2"
            >
              {label}
            </label>
            <input
              id={field}
              type={type}
              value={userData[field as keyof UserData]}
              onChange={(e) =>
                handleChange(e, field as keyof Omit<UserData, "id">)
              }
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-600 transition"
              placeholder={label}
            />
          </div>
        ))}

        <div>
          <label
            htmlFor="newPassword"
            className="block text-gray-800 font-semibold mb-2"
          >
            Yeni Şifre (Opsiyonel)
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Yeni şifrenizi girin"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-600 transition"
            minLength={6}
          />
          <p className="mt-1 text-sm text-gray-500">
            Yeni şifreniz en az 6 karakter olmalıdır. Boş bırakırsanız şifre
            değişmez.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-bold py-4 rounded-2xl disabled:opacity-50 shadow-lg shadow-indigo-300/50"
        >
          {loading ? "Güncelleniyor..." : "Güncelle"}
        </button>
      </form>
    </div>
  );
}
