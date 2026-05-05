"use client";

import { ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import { Table, Column } from "@/components/ui/Table";
import { selectionService, SelectionProcess } from "@/services/selection.service";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SelectionPage() {
  const [processes, setProcesses] = useState<SelectionProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const data = await selectionService.getProcesses();
        setProcesses(data);
      } catch (error) {
        console.error("Failed to fetch processes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProcesses();
  }, []);

  const columns: Column<SelectionProcess>[] = [
    { key: "name", header: "Nome do Processo" },
    { key: "year", header: "Ano" },
    { key: "isActive", header: "Status", render: (p) => (
      <span className={`px-2 py-1 rounded-[20px] text-xs font-bold ${p.isActive ? 'bg-[var(--color-accent-blue)] text-white' : 'bg-[var(--color-tertiary-bg)]'}`}>
        {p.isActive ? 'Ativo' : 'Encerrado'}
      </span>
    )}
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 w-full max-w-7xl mx-auto flex flex-col gap-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList size={32} className="text-[var(--color-accent-blue)]" />
          <h1 className="text-3xl text-white font-bold">Processos Seletivos</h1>
        </div>
      </div>

      {loading ? (
        <div className="card w-full min-h-[400px] flex items-center justify-center">
          <p className="opacity-60">Carregando processos...</p>
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={processes} 
          emptyMessage="Nenhum processo seletivo encontrado."
          onRowClick={(process) => router.push(`/selection/${process.id}`)}
        />
      )}
    </motion.div>
  );
}
