"use client";
import React, { useEffect, useState, useMemo } from "react";
import { toast, Toaster } from "sonner";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiShield,
  FiCheck,
  FiPlus,
  FiSave,
  FiTrash2,
  FiLoader,
  FiCheckCircle,
} from "react-icons/fi";

interface Permission {
  id: string;
  key: string;
  name: string;
}
interface Role {
  id: string;
  name: string;
  description?: string;
}
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  permissions: Permission[];
}

function AddPermissionForm({
  onAdd,
  loading,
}: {
  onAdd: (perm: { key: string; name: string }) => void;
  loading: boolean;
}) {
  const [key, setKey] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !name.trim()) {
      toast.error("Hem 'Yetki Anahtarı' hem de 'Yetki Adı' zorunludur.");
      return;
    }
    onAdd({ key: key.trim(), name: name.trim() });
    setKey("");
    setName("");
  };

  const inputBaseClasses =
    "w-full bg-[#1C1C1E] border border-gray-700/80 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-inner";

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
        <FiPlus />
        Yeni Yetki Tanımla
      </h3>
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Yetki Anahtarı (örn: manage_users)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className={inputBaseClasses}
        />
        <input
          type="text"
          placeholder="Yetki Görünen Adı (örn: Kullanıcı Yönetimi)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputBaseClasses}
        />
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={!loading ? { scale: 1.05 } : {}}
          whileTap={!loading ? { scale: 0.95 } : {}}
          className="flex-shrink-0 flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
        >
          {loading ? <FiLoader className="animate-spin" /> : "Ekle"}
        </motion.button>
      </div>
    </motion.form>
  );
}

function PermissionItem({
  permission,
  isActive,
  isInherited,
  isDisabled,
  onToggle,
  onDelete,
}: {
  permission: Permission;
  isActive: boolean;
  isInherited: boolean;
  isDisabled: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center justify-between group rounded-lg transition-colors hover:bg-white/5">
      <button
        type="button"
        onClick={onToggle}
        disabled={isDisabled}
        className={`flex items-center text-left gap-3 w-full p-2 rounded-lg transition-colors ${
          isDisabled ? "cursor-not-allowed opacity-60" : ""
        }`}
        title={isInherited ? "Bu yetki rolden miras alınmıştır." : ""}
      >
        <div
          className={`w-5 h-5 rounded-md border-2 flex-shrink-0 transition-colors flex items-center justify-center ${
            isActive
              ? "bg-blue-600 border-blue-500"
              : "bg-black/20 border-gray-600"
          }`}
        >
          {isActive && (
            <FiCheck className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          )}
        </div>
        <span
          className={`font-medium select-none transition-colors ${
            isActive ? "text-white" : "text-white/70"
          }`}
        >
          {permission.name}
        </span>
        {isInherited && (
          <FiShield
            className="w-4 h-4 text-blue-400 flex-shrink-0"
            title="Rolden Miras Alındı"
          />
        )}
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 rounded-md text-red-400/70 hover:bg-red-500/20 hover:text-red-300 transition opacity-0 group-hover:opacity-100"
        title="Yetkiyi Sil"
      >
        <FiTrash2 size={16} />
      </button>
    </li>
  );
}

export default function UserRolePermissionManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<Set<string>>(
    new Set()
  );
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState({
    roles: true,
    users: false,
    permissions: true,
  });
  const [saving, setSaving] = useState(false);
  const [addPermLoading, setAddPermLoading] = useState(false);

  useEffect(() => {
    const initialFetch = async () => {
      setLoading((prev) => ({ ...prev, roles: true, permissions: true }));
      try {
        const [rolesRes, permsRes] = await Promise.all([
          fetch("/api/admin/roles"),
          fetch("/api/admin/permissions"),
        ]);
        if (!rolesRes.ok) throw new Error("Roller yüklenemedi.");
        if (!permsRes.ok) throw new Error("Yetkiler yüklenemedi.");

        const rolesData: Role[] = await rolesRes.json();
        const permsData: Permission[] = await permsRes.json();

        setRoles(rolesData);
        setPermissions(permsData);
        if (rolesData.length > 0) setSelectedRoleId(rolesData[0].id);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setLoading((prev) => ({ ...prev, roles: false, permissions: false }));
      }
    };
    initialFetch();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) {
      setUsers([]);
      setSelectedUserId(null);
      setRolePermissions(new Set());
      return;
    }
    setLoading((prev) => ({ ...prev, users: true }));

    Promise.all([
      fetch(`/api/admin/users?roleId=${selectedRoleId}`),
      fetch(`/api/admin/roles/${selectedRoleId}/permissions`),
    ])
      .then(async ([usersRes, rolePermsRes]) => {
        if (!usersRes.ok) throw new Error("Kullanıcılar yüklenemedi.");
        if (!rolePermsRes.ok) throw new Error("Rol yetkileri yüklenemedi.");

        const usersData: User[] = await usersRes.json();
        const rolePermsData = await rolePermsRes.json();

        setUsers(usersData);
        setSelectedUserId(usersData.length > 0 ? usersData[0].id : null);
        setRolePermissions(
          new Set(
            (rolePermsData.permissions || []).map((p: Permission) => p.id)
          )
        );
      })
      .catch((err) => {
        toast.error((err as Error).message);
        setUsers([]);
        setSelectedUserId(null);
        setRolePermissions(new Set());
      })
      .finally(() => setLoading((prev) => ({ ...prev, users: false })));
  }, [selectedRoleId]);

  useEffect(() => {
    if (!selectedUserId) {
      setUserPermissions(new Set());
      return;
    }
    fetch(`/api/admin/users/${selectedUserId}/permissions`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Kullanıcı yetkileri alınamadı.");
        const data = await res.json();
        setUserPermissions(
          new Set((data.permissions || []).map((p: Permission) => p.id))
        );
      })
      .catch((err) => {
        toast.error((err as Error).message);
        setUserPermissions(new Set());
      });
  }, [selectedUserId]);

  const togglePermission = (permissionId: string) => {
    if (!selectedUserId) return;
    setUserPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) newSet.delete(permissionId);
      else newSet.add(permissionId);
      return newSet;
    });
  };

  const addPermission = async (perm: { key: string; name: string }) => {
    setAddPermLoading(true);
    try {
      const res = await fetch("/api/admin/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(perm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Yetki eklenemedi.");
      }
      const newPerm = await res.json();
      setPermissions((prev) => [...prev, newPerm]);
      toast.success("Yeni yetki başarıyla eklendi.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setAddPermLoading(false);
    }
  };

  const deletePermission = async (id: string) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Yetki Silinsin mi?",
      text: "Bu işlem geri alınamaz.",
      showCancelButton: true,
      confirmButtonText: "Evet, Sil",
      cancelButtonText: "İptal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      background: "#1a1a1a",
      color: "#fff",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/permissions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Yetki silinemedi.");
      }
      setPermissions((prev) => prev.filter((p) => p.id !== id));
      toast.success("Yetki başarıyla silindi.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleSave = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/users/${selectedUserId}/permissions`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissionIds: Array.from(userPermissions) }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Yetkiler kaydedilemedi.");
      }
      toast.success("Yetkiler başarıyla kaydedildi.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const groupedPermissions = useMemo(() => {
    const groups: { [key: string]: Permission[] } = {
      "Genel ve Raporlama": [],
      "Kullanıcı ve Rol Yönetimi": [],
      "İzin İşlemleri": [],
      "Satın Alma İşlemleri": [],
    };
    permissions.forEach((p) => {
      const name = p.name.toLowerCase();
      if (name.includes("kullanıcı") || name.includes("rol"))
        groups["Kullanıcı ve Rol Yönetimi"].push(p);
      else if (name.includes("izin")) groups["İzin İşlemleri"].push(p);
      else if (name.includes("satın alma") || name.includes("tedarikçi"))
        groups["Satın Alma İşlemleri"].push(p);
      else groups["Genel ve Raporlama"].push(p);
    });
    return groups;
  }, [permissions]);

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <div className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-10 text-white tracking-tight flex items-center gap-4"
          >
            <FiShield size={32} /> Yetki Yönetimi
          </motion.h1>

          {/* Rol Seçimi */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6"
          >
            <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
              <FiShield />
              Rol Seçimi
            </h3>
            {loading.roles ? (
              <div className="flex justify-center p-4">
                <FiLoader className="animate-spin text-white" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRoleId(role.id);
                      setSelectedUserId(null);
                    }}
                    type="button"
                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition text-sm ${
                      selectedRoleId === role.id
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-black/20 text-white/70 hover:bg-black/40"
                    }`}
                  >
                    {role.description || role.name}
                  </button>
                ))}
              </div>
            )}
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kullanıcılar */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
                <FiUsers />
                Kullanıcılar
              </h3>
              {loading.users ? (
                <div className="flex justify-center p-4">
                  <FiLoader className="animate-spin text-white" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-white/50 text-sm py-4">
                  Bu role ait kullanıcı bulunamadı.
                </p>
              ) : (
                <ul className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                  {users.map((user) => (
                    <li
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`cursor-pointer p-3 rounded-lg transition-colors flex items-center gap-3 ${
                        selectedUserId === user.id
                          ? "bg-blue-500/20 shadow-md"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <div className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center font-bold text-white">
                        {user.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                          {user.email}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>

            {/* Yetkiler */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <FiCheckCircle />
                  Yetkiler
                </h3>
                {!selectedUserId && selectedRoleId && (
                  <span className="text-sm text-yellow-300 bg-yellow-500/10 px-3 py-1 rounded-full">
                    Kullanıcı Yokken Düzenlenemez
                  </span>
                )}
              </div>
              {loading.permissions ? (
                <div className="flex justify-center p-4">
                  <FiLoader className="animate-spin text-white" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 max-h-[350px] overflow-y-auto pr-2">
                  {Object.entries(groupedPermissions).map(
                    ([groupName, perms]) =>
                      perms.length > 0 && (
                        <div
                          key={groupName}
                          className="space-y-3 break-inside-avoid-column"
                        >
                          <h4 className="font-semibold text-white/90 border-b border-white/10 pb-2">
                            {groupName}
                          </h4>
                          <ul className="space-y-1">
                            {perms.map((permission) => {
                              const isInherited =
                                !userPermissions.has(permission.id) &&
                                rolePermissions.has(permission.id);
                              const isActive =
                                userPermissions.has(permission.id) ||
                                (selectedUserId === null &&
                                  rolePermissions.has(permission.id));
                              return (
                                <PermissionItem
                                  key={permission.id}
                                  permission={permission}
                                  isActive={isActive}
                                  isInherited={isInherited && !!selectedUserId}
                                  isDisabled={!selectedUserId}
                                  onToggle={() =>
                                    togglePermission(permission.id)
                                  }
                                  onDelete={() =>
                                    deletePermission(permission.id)
                                  }
                                />
                              );
                            })}
                          </ul>
                        </div>
                      )
                  )}
                </div>
              )}
              <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
                <motion.button
                  onClick={handleSave}
                  disabled={saving || !selectedUserId}
                  whileHover={!saving ? { scale: 1.05 } : {}}
                  whileTap={!saving ? { scale: 0.95 } : {}}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-green-500/20 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <FiLoader className="animate-spin" /> Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Yetkileri Güncelle
                    </>
                  )}
                </motion.button>
              </div>
            </motion.section>
          </div>
          <AddPermissionForm onAdd={addPermission} loading={addPermLoading} />
        </div>
      </div>
    </>
  );
}
