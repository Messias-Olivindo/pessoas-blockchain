"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ShieldCheck, ClipboardList, LogOut, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Membros", href: "/members", icon: Users },
    { name: "Processo Seletivo", href: "/selection", icon: ClipboardList },
  ];

  return (
    <div className="w-64 bg-[var(--color-secondary-bg)] border-r-[3px] border-[var(--color-tertiary-bg)] h-screen sticky top-0 flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b-[3px] border-[var(--color-tertiary-bg)]">
        <ShieldCheck size={32} className="text-[var(--color-accent-blue)]" />
        <h2 className="text-xl font-bold text-white">Inteli<br/><span className="text-[var(--color-accent-blue)]">Blockchain</span></h2>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2 mt-4">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 p-3 rounded-[20px] transition-colors border-[3px] font-bold ${
                isActive 
                  ? "bg-[var(--color-tertiary-bg)] border-[var(--color-accent-blue)] text-white" 
                  : "border-transparent text-[var(--color-text-main)] hover:bg-[var(--color-tertiary-bg)] opacity-80 hover:opacity-100"
              }`}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Icon size={20} />
              </motion.div>
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t-[3px] border-[var(--color-tertiary-bg)]">
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("x-user-id");
              localStorage.removeItem("x-user-role");
            }
            window.location.href = "/";
          }}
          className="flex items-center w-full gap-3 p-3 rounded-[20px] border-[3px] border-transparent text-[var(--color-accent-magenta)] hover:bg-[var(--color-tertiary-bg)] font-bold transition-colors cursor-pointer"
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <LogOut size={20} />
          </motion.div>
          Sair
        </button>
      </div>
    </div>
  );
}
