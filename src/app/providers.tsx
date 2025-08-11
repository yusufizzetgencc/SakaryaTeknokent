"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner"; // <- Toaster import et
import type { Session } from "next-auth";

interface ProvidersProps {
  children: React.ReactNode;
  session: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster position="top-right" /> {/* <- Toaster burada */}
    </SessionProvider>
  );
}
