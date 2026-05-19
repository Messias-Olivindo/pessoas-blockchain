"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-primary-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 bg-secondary-bg border-b-[3px] border-tertiary-bg shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-tertiary-bg transition-colors text-text-main"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Inteli Blockchain"
              width={914}
              height={1062}
              priority
              className="h-7 w-auto"
            />
            <span className="font-bold text-white text-sm">Inteli Blockchain</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
