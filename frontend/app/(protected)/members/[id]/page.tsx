"use client";

import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FileText, User, ArrowRight } from "lucide-react";
import { membersService, Member } from "@/services/members.service";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const memberId = resolvedParams.id;
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const data = await membersService.getMemberById(memberId);
        setMember(data);
      } catch (error) {
        console.error("Failed to fetch member details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [memberId]);

  const handleExportPDF = () => {
    window.open(membersService.getExportPdfUrl(memberId), "_blank");
  };

  if (loading) {
    return <div className="p-8 text-[var(--color-text-main)] opacity-70">Carregando perfil...</div>;
  }

  if (!member) {
    return <div className="p-8 text-[var(--color-accent-magenta)] font-bold">Membro não encontrado.</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 w-full max-w-5xl mx-auto flex flex-col gap-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <User size={32} className="text-[var(--color-accent-blue)]" />
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl text-white font-bold">Perfil do Membro</h1>
            <p className="text-[var(--color-text-main)] opacity-80">ID: {memberId}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleExportPDF}
              variant="primary"
            >
              <FileText size={18} />
              Exportar Ficha (PDF)
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="flex flex-col gap-4">
            <h2 className="text-xl font-bold border-b-[3px] border-[var(--color-tertiary-bg)] pb-2">Informações Básicas</h2>
            <div className="flex flex-col gap-3">
              <p><strong className="text-[var(--color-accent-blue)]">Nome:</strong> {member.name}</p>
              <p><strong className="text-[var(--color-accent-blue)]">Email:</strong> {member.email}</p>
              <p><strong className="text-[var(--color-accent-blue)]">Departamento:</strong> {member.department || "N/A"}</p>
              <p><strong className="text-[var(--color-accent-blue)]">Cargo:</strong> {member.position || "N/A"}</p>
              <p><strong className="text-[var(--color-accent-blue)]">Status:</strong> {member.status}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card variant="educational" className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b-[3px] border-[var(--color-tertiary-bg)] pb-2">
              <h2 className="text-xl font-bold">Histórico de PDI</h2>
              <Link href={`/members/${memberId}/pdi`} className="text-xs font-bold flex items-center gap-1 hover:underline">
                Ver Todos <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex flex-col gap-2 opacity-80">
              Clique em "Ver Todos" para gerenciar os Planos de Desenvolvimento Individual deste membro.
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
