"use client";

import { Download, Upload, ClipboardList } from "lucide-react";
import { useState, useEffect, use } from "react";
import { selectionService, Application } from "@/services/selection.service";
import { Table, Column } from "@/components/ui/Table";
import { motion } from "framer-motion";

export default function SelectionProcessPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const processId = resolvedParams.id;
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const apps = await selectionService.getApplications(processId);
        setApplications(apps);
      } catch (error) {
        console.error("Failed to fetch applications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [processId]);

  const handleExportCSV = () => {
    window.open(selectionService.getExportUrl(processId), "_blank");
  };

  const handleImportClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx, .csv';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setImporting(true);
        try {
          const apps = await selectionService.importCandidates(processId, file);
          setApplications(apps);
          alert("Candidatos importados com sucesso!");
        } catch (error) {
          console.error("Failed to import candidates", error);
          alert("Erro ao importar candidatos.");
        } finally {
          setImporting(false);
        }
      }
    };
    fileInput.click();
  };

  const columns: Column<Application>[] = [
    { key: "name", header: "Nome do Candidato", render: (app) => app.member?.name || `Membro ID: ${app.memberId}` },
    { key: "status", header: "Status", render: (app) => (
      <span className={`px-2 py-1 rounded-[20px] text-xs font-bold ${app.status === 'APPROVED' ? 'bg-[var(--color-accent-blue)] text-white' : 'bg-[var(--color-tertiary-bg)]'}`}>
        {app.status}
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
          <h1 className="text-3xl text-white font-bold">Detalhes do Processo Seletivo</h1>
        </div>

        <div className="flex gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleImportClick}
            disabled={importing}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload size={18} />
            {importing ? 'Importando...' : 'Importar Candidatos'}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={18} />
            Exportar Resultados
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="card w-full min-h-[400px] flex items-center justify-center">
          <p className="opacity-60">Carregando candidatos...</p>
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={applications} 
          emptyMessage="Nenhum candidato encontrado para este processo."
        />
      )}
    </motion.div>
  );
}
