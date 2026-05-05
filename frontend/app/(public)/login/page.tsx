"use client";

import { LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = () => {
    window.location.href = authService.getGoogleAuthUrl();
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-md text-center flex flex-col items-center gap-6 p-8"
      >
        <h1 className="text-3xl text-white font-bold">Bem-vindo(a)</h1>
        <p className="text-[var(--color-text-main)] opacity-80 mb-4">
          Para acessar a plataforma, faça login com sua conta institucional <strong>@sou.inteli.edu.br</strong>.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          className="btn-primary w-full flex items-center justify-center gap-3 py-3"
        >
          <LogIn size={20} />
          Entrar com o Google
        </motion.button>

        <div className="text-xs opacity-50 mt-4">
          Apenas contas autorizadas do Inteli Blockchain terão acesso aos módulos do sistema.
        </div>
      </motion.div>
    </div>
  );
}
