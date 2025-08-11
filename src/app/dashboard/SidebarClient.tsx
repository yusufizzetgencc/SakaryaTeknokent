// src/app/dashboard/SidebarClient.tsx
"use client";

import Sidebar from "@/components/layout/sidebar/Sidebar";
import type { Session } from "next-auth";

interface SidebarClientProps {
  session: Session | null; // session null olabilir, bunu destekle
  permissions?: string[]; // permissions opsiyonel olabilir
}

export default function SidebarClient({
  session,
  permissions,
}: SidebarClientProps) {
  // permissions opsiyonel olduğu için, eğer undefined ise props olarak gönderme
  if (permissions === undefined) {
    return <Sidebar session={session} />;
  }
  return <Sidebar session={session} permissions={permissions} />;
}
