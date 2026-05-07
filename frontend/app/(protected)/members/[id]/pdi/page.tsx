"use client";

import { use, useState, useEffect } from "react";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { MarkdownViewer } from "@/components/ui/MarkdownViewer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Download, Save, FileText, Eye, AlertTriangle } from "lucide-react";
import { pdiService, PdiEntry } from "@/services/pdi.service";
import { motion } from "framer-motion";

const DEFAULT_CONTENT =
  "# Meu Plano de Desenvolvimento Individual\n\n## Metas do Semestre\n- \n\n## Pontos Fortes\n- \n\n## Áreas de Desenvolvimento\n- \n";

export default function PDIPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const memberId = resolvedParams.id;

  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [currentPdi, setCurrentPdi] = useState<PdiEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingPdi, setLoadingPdi] = useState(true);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Preview modal
  const [previewModal, setPreviewModal] = useState<"pdf" | "csv" | null>(null);
  const [exporting, setExporting] = useState(false);

  // Load existing PDI
  useEffect(() => {
    pdiService
      .getPdis(memberId)
      .then((pdis) => {
        const active = pdis.find((p) => p.isActive) ?? pdis[0] ?? null;
        if (active) {
          setCurrentPdi(active);
          setContent(active.content);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPdi(false));
  }, [memberId]);

  const handleContentChange = (val: string) => {
    setContent(val);
    setHasUnsaved(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (currentPdi) {
        const updated = await pdiService.updatePdi(currentPdi.id, currentPdi.title, content);
        if (updated) setCurrentPdi(updated);
      } else {
        const result = await pdiService.savePdi(
          memberId,
          "Plano de Desenvolvimento Individual",
          content,
        );
        setCurrentPdi(result ?? null);
      }
      setHasUnsaved(false);
      alert("PDI salvo com sucesso!");
    } catch {
      alert("Erro ao salvar PDI. Verifique as permissões.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await pdiService.exportPDF(memberId);
    } catch {
      alert("Erro ao exportar PDF.");
    } finally {
      setExporting(false);
      setPreviewModal(null);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await pdiService.exportCSV(memberId);
    } catch {
      alert("Erro ao exportar histórico.");
    } finally {
      setExporting(false);
      setPreviewModal(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 w-full max-w-5xl mx-auto flex flex-col gap-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl text-white font-bold">
            Plano de Desenvolvimento Individual
          </h1>
          <p className="text-[var(--color-text-main)] opacity-60 text-sm">
            ID do Membro: {memberId}
            {currentPdi && (
              <span className="ml-2 opacity-50">
                · Última edição:{" "}
                {new Date(currentPdi.updatedAt).toLocaleDateString("pt-BR")}
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setPreviewModal("csv")} variant="secondary">
              <Eye size={18} />
              Exportar Histórico
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setPreviewModal("pdf")} variant="secondary">
              <Eye size={18} />
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

      {/* Unsaved indicator */}
      {hasUnsaved && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-700/40 rounded-lg px-3 py-2"
        >
          <AlertTriangle size={14} />
          Alterações não salvas — clique em &quot;Salvar PDI&quot; para persistir.
        </motion.div>
      )}

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <h2 className="text-xl font-bold mb-4">Editar PDI (Suporta Markdown)</h2>
          {loadingPdi ? (
            <div className="h-48 flex items-center justify-center opacity-50 text-sm">
              Carregando PDI...
            </div>
          ) : (
            <MarkdownEditor
              value={content}
              onChange={handleContentChange}
              placeholder="Suporta Markdown (ex. **negrito**, - lista)"
            />
          )}
        </Card>
      </motion.div>

      {/* ── PDF Preview Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={previewModal === "pdf"}
        onClose={() => setPreviewModal(null)}
        title="Pré-visualização — Ficha PDF"
        maxWidth="2xl"
      >
        <div className="flex flex-col gap-5">
          <div className="text-xs opacity-60 border border-[var(--color-tertiary-bg)] rounded-lg px-3 py-2">
            O PDF exportado conterá informações demográficas do membro, este PDI
            e o histórico do processo seletivo. Abaixo, a pré-visualização do
            conteúdo do PDI:
          </div>

          {/* Rendered preview */}
          <div className="bg-[var(--color-primary-bg)] border border-[var(--color-tertiary-bg)] rounded-[12px] p-5 max-h-[50vh] overflow-y-auto">
            <MarkdownViewer content={content} />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setPreviewModal(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleExportPDF}
              disabled={exporting}
            >
              <FileText size={16} />
              {exporting ? "Exportando..." : "Confirmar e baixar PDF"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── CSV Preview Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={previewModal === "csv"}
        onClose={() => setPreviewModal(null)}
        title="Pré-visualização — Exportar Histórico CSV"
        maxWidth="md"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 text-sm text-[var(--color-text-main)]">
            <p className="opacity-70">
              O arquivo CSV conterá o histórico completo de revisões do PDI deste membro,
              incluindo data, editor e conteúdo de cada versão.
            </p>
            <div className="bg-[var(--color-primary-bg)] border border-[var(--color-tertiary-bg)] rounded-lg px-4 py-3 font-mono text-xs opacity-80">
              <p className="font-semibold text-white mb-1">Colunas do CSV:</p>
              <p>id, memberId, title, content, editor, createdAt</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setPreviewModal(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleExportCSV}
              disabled={exporting}
            >
              <Download size={16} />
              {exporting ? "Exportando..." : "Confirmar e baixar CSV"}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
