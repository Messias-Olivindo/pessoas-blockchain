"use client";

import { use, useState, useEffect } from "react";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Download, Save, FileText } from "lucide-react";
import { pdiService } from "@/services/pdi.service";
import { motion } from "framer-motion";

export default function PDIPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const memberId = resolvedParams.id;
  const [content, setContent] = useState(
    "# Meu Plano de Desenvolvimento Individual\n\n## Metas do Semestre\n- \n\n## Pontos Fortes\n- \n",
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Optionally fetch existing PDI if needed
  }, [memberId]);

  const handleExportCSV = async () => {
    try {
      await pdiService.exportCSV(memberId);
    } catch (error) {
      console.error("Failed to export CSV", error);
      alert("Erro ao exportar histórico.");
    }
  };

  const handleExportPDF = async () => {
    try {
      await pdiService.exportPDF(memberId);
    } catch (error) {
      console.error("Failed to export PDF", error);
      alert("Erro ao exportar ficha em PDF.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await pdiService.savePdi(
        memberId,
        "Atualização de Plano de Desenvolvimento",
        content,
      );
      alert("PDI salvo com sucesso!");
    } catch (error) {
      console.error("Failed to save IDP", error);
      alert(
        "Erro ao salvar PDI. Certifique-se de que você tem as permissões corretas.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 w-full max-w-5xl mx-auto flex flex-col gap-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl text-white font-bold">
            Plano de Desenvolvimento Individual
          </h1>
          <p className="text-[var(--color-text-main)] opacity-80">
            ID do Membro: {memberId}
          </p>
        </div>

        <div className="flex gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleExportCSV} variant="secondary">
              <Download size={18} />
              Exportar Histórico
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleExportPDF} variant="secondary">
              <FileText size={18} />
              Exportar Ficha (PDF)
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleSave} variant="primary" disabled={saving}>
              <Save size={18} />
              {saving ? "Salvando..." : "Salvar PDI"}
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h2 className="text-xl font-bold mb-4">
            Editar PDI (Suporta Markdown)
          </h2>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Suporta Markdown (ex. **negrito**, - lista)"
          />
        </Card>
      </motion.div>
    </motion.div>
  );
}
