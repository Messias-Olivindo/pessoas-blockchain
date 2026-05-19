"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Users, ClipboardList, LogOut, LayoutDashboard, UserCog, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isPeople, setIsPeople] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("x-user-role") ?? "";
    setIsPeople(role === "ADMIN" || role === "PEOPLE");
  }, []);

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(isPeople
      ? [
          { name: "Membros", href: "/members", icon: Users },
          { name: "Processo Seletivo", href: "/selection", icon: ClipboardList },
          { name: "Usuários", href: "/admin/users", icon: UserCog },
        ]
      : []),
  ];

  const sidebarContent = (
    <div className="w-64 bg-secondary-bg border-r-[3px] border-tertiary-bg h-full flex flex-col">
      <div className="p-6 flex items-center justify-between border-b-[3px] border-tertiary-bg">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Inteli Blockchain"
            width={914}
            height={1062}
            priority
            className="h-10 w-auto"
          />
          <h2 className="text-xl font-bold text-white leading-tight">
            Inteli<br />
            <span className="text-accent-blue">Blockchain</span>
          </h2>
        </Link>
        {/* Close button — only visible on mobile */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-xl hover:bg-tertiary-bg transition-colors text-text-main"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2 mt-4">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 p-3 rounded-[20px] transition-colors border-[3px] font-bold ${
                isActive
                  ? "bg-tertiary-bg border-accent-blue text-white"
                  : "border-transparent text-text-main hover:bg-tertiary-bg opacity-80 hover:opacity-100"
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

      <div className="p-4 border-t-[3px] border-tertiary-bg">
        <button
          onClick={() => {
            localStorage.removeItem("x-user-id");
            localStorage.removeItem("x-user-role");
            window.location.href = "/";
          }}
          className="flex items-center w-full gap-3 p-3 rounded-[20px] border-[3px] border-transparent text-accent-magenta hover:bg-tertiary-bg font-bold transition-colors cursor-pointer"
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <LogOut size={20} />
          </motion.div>
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop — always visible */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile — overlay drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden h-full"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
