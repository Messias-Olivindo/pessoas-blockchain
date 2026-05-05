"use client";

import { Card } from "@/components/ui/Card";
import { Users, FileText, ClipboardList } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { setupApiClient } from "@/services/api";
import { dashboardService } from "@/services/dashboard.service";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

function DashboardContent() {
  const [metrics, setMetrics] = useState({
    members: 0,
    processes: 0,
    pdis: 0,
  });
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check if there's a login redirect payload in URL
    const userIdFromUrl = searchParams.get("userId");
    const roleFromUrl = searchParams.get("role");

    if (userIdFromUrl && roleFromUrl) {
      localStorage.setItem("x-user-id", userIdFromUrl);
      localStorage.setItem("x-user-role", roleFromUrl);
      setupApiClient(userIdFromUrl, roleFromUrl);
      
      // Clean URL
      router.replace("/dashboard");
    } else {
      // Ensure api client has the storage values
      setupApiClient();
    }

    const fetchMetrics = async () => {
      try {
        const data = await dashboardService.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to fetch metrics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [searchParams, router]);

  return (
    <div className="p-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-[var(--color-text-main)] opacity-80">Visão geral da plataforma de Gestão de Pessoas.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-[var(--color-accent-blue)]" />
              <h2 className="text-lg font-bold">Membros</h2>
            </div>
            <p className="text-4xl font-bold text-white">{loading ? "-" : metrics.members}</p>
            <span className="text-xs opacity-60">Total de membros ativos e inativos</span>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <ClipboardList size={24} className="text-[var(--color-accent-magenta)]" />
              <h2 className="text-lg font-bold">Processos Seletivos</h2>
            </div>
            <p className="text-4xl font-bold text-white">{loading ? "-" : metrics.processes}</p>
            <span className="text-xs opacity-60">Processos ativos no momento</span>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card variant="educational" className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-[#e8f1f2]" />
              <h2 className="text-lg font-bold">Planos de Desenvolvimento</h2>
            </div>
            <p className="text-4xl font-bold text-white">{loading ? "-" : metrics.pdis}</p>
            <span className="text-xs opacity-60">PDIs aguardando revisão</span>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Carregando dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
