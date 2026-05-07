"use client";

import {
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { selectionService, SelectionProcess, Stage } from "@/services/selection.service";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Role guard ───────────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <ClipboardList size={48} className="opacity-20" />
      <h2 className="text-xl font-bold text-white">Acesso restrito</h2>
      <p className="text-sm opacity-60 max-w-sm">
        Esta seção é exclusiva para membros da diretoria de Pessoas (ADMIN e PEOPLE).
      </p>
    </div>
  );
}

// ─── Stages content (rendered inside card) ────────────────────────────────────

function ProcessStages({ processId }: { processId: string }) {
  const [detail, setDetail] = useState<SelectionProcess | null>(null);
  const [loading, setLoading] = useState(true);
  const [openStages, setOpenStages] = useState<Set<string>>(new Set());

  useEffect(() => {
    selectionService
      .getProcess(processId)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [processId]);

  const toggleStage = (id: string) =>
    setOpenStages((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const stages: Stage[] = detail?.stages ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 size={18} className="animate-spin opacity-40" />
      </div>
    );
  }

  if (!detail) {
    return (
      <p className="text-xs opacity-50 text-center py-4">
        Não foi possível carregar.
      </p>
    );
  }

  if (stages.length === 0) {
    return (
      <p className="text-xs opacity-40 text-center py-4">
        Nenhuma etapa cadastrada.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {stages.map((stage, si) => {
        const isOpen = openStages.has(stage.id);
        const questions = stage.questions ?? [];
        const totalScore = questions.reduce((acc, q) => acc + (q.maxScore ?? 0), 0);

        return (
          <div key={stage.id}>
            <button
              onClick={() => toggleStage(stage.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-tertiary-bg/40 transition-colors text-left"
            >
              <span className="text-xs font-mono opacity-30 w-5 shrink-0">
                {si + 1}.
              </span>
              <span className="font-semibold text-white text-sm flex-1">
                {stage.title}
              </span>
              {questions.length > 0 && (
                <span className="text-xs opacity-40 shrink-0">
                  {questions.length} questão{questions.length !== 1 ? "ões" : ""}
                  {totalScore > 0 && ` · ${totalScore} pts`}
                </span>
              )}
              {isOpen ? (
                <ChevronDown size={13} className="opacity-40 shrink-0" />
              ) : (
                <ChevronRight size={13} className="opacity-40 shrink-0" />
              )}
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.14 }}
                  className="overflow-hidden"
                >
                  {questions.length === 0 ? (
                    <p className="text-xs opacity-30 px-11 pb-2">
                      Sem questões cadastradas.
                    </p>
                  ) : (
                    <div className="flex flex-col pl-11 pb-2">
                      {questions.map((q, qi) => (
                        <div
                          key={q.id}
                          className="flex items-start gap-2 py-1.5 border-l-2 border-tertiary-bg/30 pl-3"
                        >
                          <span className="text-xs font-mono opacity-25 shrink-0 w-5 mt-0.5">
                            {qi + 1}.
                          </span>
                          <p className="text-sm text-text-main flex-1 leading-snug">
                            {q.title}
                          </p>
                          {q.maxScore > 0 && (
                            <span className="text-xs font-semibold text-accent-blue shrink-0">
                              {q.maxScore} pts
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Process card ─────────────────────────────────────────────────────────────

function ProcessCard({ process }: { process: SelectionProcess }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  return (
    <div className="card flex flex-col">
      {/* Linha principal */}
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-white">{process.name}</span>
            <span
              className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${
                process.isActive
                  ? "bg-accent-blue text-white"
                  : "bg-tertiary-bg text-text-main opacity-70"
              }`}
            >
              {process.isActive ? "Ativo" : "Encerrado"}
            </span>
          </div>
          <p className="text-xs opacity-50 mt-0.5">{process.year}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/selection/${process.id}`)}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <ExternalLink size={13} />
            Candidatos
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setExpanded((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border-2 transition-colors ${
              expanded
                ? "border-accent-blue text-accent-blue"
                : "border-tertiary-bg text-text-main hover:border-accent-blue hover:text-accent-blue"
            }`}
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            Ver mais
          </motion.button>
        </div>
      </div>

      {/* Expansão inline dentro do mesmo card */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t-2 border-tertiary-bg">
              <ProcessStages processId={process.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SelectionPage() {
  const [processes, setProcesses] = useState<SelectionProcess[]>([]);
  const [loading, setLoading] = useState(true);

  const role =
    typeof window !== "undefined"
      ? (localStorage.getItem("x-user-role") ?? "")
      : "";
  const canAccess = role === "ADMIN" || role === "PEOPLE";

  const fetchProcesses = useCallback(async () => {
    try {
      const data = await selectionService.getProcesses();
      setProcesses(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canAccess) fetchProcesses();
    else setLoading(false);
  }, [canAccess, fetchProcesses]);

  if (!canAccess) return <AccessDenied />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 w-full max-w-4xl mx-auto flex flex-col gap-6"
    >
      <div className="flex items-center gap-3">
        <ClipboardList size={32} className="text-accent-blue" />
        <div>
          <h1 className="text-3xl text-white font-bold">Processos Seletivos</h1>
          {!loading && (
            <p className="text-sm opacity-60 mt-0.5">
              {processes.length} processo{processes.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card w-full min-h-75 flex items-center justify-center">
          <p className="opacity-60">Carregando processos...</p>
        </div>
      ) : processes.length === 0 ? (
        <div className="card w-full min-h-50 flex items-center justify-center">
          <p className="opacity-60">Nenhum processo seletivo encontrado.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {processes.map((p) => (
            <ProcessCard key={p.id} process={p} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
