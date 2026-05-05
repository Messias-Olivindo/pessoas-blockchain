"use client";

import { Download, Upload, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Table, Column } from "@/components/ui/Table";
import { membersService, Member } from "@/services/members.service";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await membersService.getMembers();
        setMembers(data);
      } catch (error) {
        console.error("Failed to fetch members", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleExportCSV = () => {
    window.open(membersService.getExportUrl(), "_blank");
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
          const data = await membersService.importMembers(file);
          setMembers(data);
          alert("Membros importados com sucesso!");
        } catch (error) {
          console.error("Failed to import", error);
          alert("Erro ao importar membros.");
        } finally {
          setImporting(false);
        }
      }
    };
    fileInput.click();
  };

  const columns: Column<Member>[] = [
    { key: "name", header: "Nome" },
    { key: "email", header: "Email" },
    { key: "department", header: "Departamento", render: (m) => m.department || "-" },
    { key: "position", header: "Cargo", render: (m) => m.position || "-" },
    { key: "status", header: "Status", render: (m) => (
      <span className={`px-2 py-1 rounded-[20px] text-xs font-bold ${m.status === 'ACTIVE' ? 'bg-[var(--color-accent-blue)] text-white' : 'bg-[var(--color-tertiary-bg)]'}`}>
        {m.status}
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
          <Users size={32} className="text-[var(--color-accent-blue)]" />
          <h1 className="text-3xl text-white font-bold">Membros do Clube</h1>
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
            {importing ? 'Importando...' : 'Importar Membros'}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={18} />
            Exportar CSV
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="card w-full min-h-[400px] flex items-center justify-center">
          <p className="opacity-60">Carregando membros...</p>
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={members} 
          emptyMessage="Nenhum membro encontrado."
          onRowClick={(member) => router.push(`/members/${member.id}`)}
        />
      )}
    </motion.div>
  );
}
