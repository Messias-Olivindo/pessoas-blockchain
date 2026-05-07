"use client";

import {
  ArrowLeft,
  Download,
  Upload,
  ClipboardList,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
} from "lucide-react";
import { useState, useEffect, use, useMemo } from "react";
import {
  selectionService,
  Application,
  SelectionProcess,
  Stage,
  AnswerItem,
  EvaluationItem,
  StageResultItem,
} from "@/services/selection.service";
import { Modal } from "@/components/ui/Modal";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// ─── Constants ────────────────────────────────────────────────────────────────

type SortKey = "name" | "status" | "total" | string;
type SortDir = "asc" | "desc";

const APP_STATUS_COLOR: Record<string, string> = {
  APPROVED: "bg-[var(--color-accent-blue)] text-white",
  REJECTED: "bg-[var(--color-accent-magenta)] text-white",
  IN_REVIEW: "bg-yellow-700 text-white",
  SUBMITTED: "bg-purple-700 text-white",
  DRAFT: "bg-[var(--color-tertiary-bg)] text-[var(--color-text-main)]",
  WITHDRAWN: "bg-[var(--color-tertiary-bg)] text-[var(--color-text-main)]",
};

const APP_STATUS_LABEL: Record<string, string> = {
  APPROVED: "Aprovado",
  REJECTED: "Reprovado",
  IN_REVIEW: "Em revisão",
  SUBMITTED: "Submetido",
  DRAFT: "Rascunho",
  WITHDRAWN: "Retirado",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stageIcon(status: string) {
  if (status === "PASSED")
    return <CheckCircle2 size={14} className="text-green-400 shrink-0" />;
  if (status === "FAILED")
    return <XCircle size={14} className="text-red-400 shrink-0" />;
  return <Clock size={14} className="opacity-40 shrink-0" />;
}

function getScore(app: Application, stageId: string): number | null {
  return app.results?.find((r) => r.stageId === stageId)?.score ?? null;
}

function getStageStatus(app: Application, stageId: string): string {
  return app.results?.find((r) => r.stageId === stageId)?.status ?? "PENDING";
}

function getTotalScore(app: Application): number | null {
  const scores = (app.results ?? [])
    .map((r) => r.score)
    .filter((s): s is number => s != null);
  return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) : null;
}

// ─── Candidate Detail Modal ───────────────────────────────────────────────────

function CandidateDetailModal({
  appId,
  stages,
  onClose,
}: {
  appId: string;
  stages: Stage[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    selectionService
      .getApplicationDetail(appId)
      .then(setApp)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appId]);

  // Group answers by stageId
  const answersByStage = useMemo(() => {
    const m: Record<string, AnswerItem[]> = {};
    (app?.answers ?? []).forEach((a) => {
      const sid = a.question.stageId;
      if (!m[sid]) m[sid] = [];
      m[sid].push(a);
    });
    return m;
  }, [app]);

  // Group evaluations by stageId
  const evalsByStage = useMemo(() => {
    const m: Record<string, EvaluationItem[]> = {};
    (app?.evaluations ?? []).forEach((e) => {
      const sid = e.question.stageId;
      if (!m[sid]) m[sid] = [];
      m[sid].push(e);
    });
    return m;
  }, [app]);

  const totalScore = app ? getTotalScore(app) : null;

  return (
    <Modal
      isOpen
      title={
        loading
          ? "Carregando..."
          : app?.member?.name ?? "Detalhes do Candidato"
      }
      onClose={onClose}
      maxWidth="2xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin opacity-50" />
        </div>
      ) : !app ? (
        <p className="text-sm opacity-60 text-center py-8">
          Não foi possível carregar os detalhes.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Summary bar */}
          <div className="flex flex-wrap gap-3 items-center">
            <span
              className={`px-2.5 py-1 rounded-[10px] text-xs font-bold ${APP_STATUS_COLOR[app.status] ?? ""}`}
            >
              {APP_STATUS_LABEL[app.status] ?? app.status}
            </span>
            {app.member?.email && (
              <span className="text-xs opacity-50">{app.member.email}</span>
            )}
            {totalScore != null && (
              <span className="ml-auto text-sm font-bold text-[var(--color-accent-blue)]">
                Total: {totalScore.toFixed(2)} pts
              </span>
            )}
          </div>

          {/* Demographics */}
          {(app.member?.gender ||
            app.member?.race ||
            app.member?.isLgbtqia != null) && (
            <div className="flex flex-wrap gap-4 text-xs bg-[var(--color-primary-bg)] border border-[var(--color-tertiary-bg)] rounded-lg px-4 py-2.5">
              {app.member?.gender && (
                <span>
                  Gênero:{" "}
                  <strong className="text-white">{app.member.gender}</strong>
                </span>
              )}
              {app.member?.race && (
                <span>
                  Raça/Cor:{" "}
                  <strong className="text-white">{app.member.race}</strong>
                </span>
              )}
              {app.member?.isLgbtqia != null && (
                <span>
                  LGBTQIA+:{" "}
                  <strong className="text-white">
                    {app.member.isLgbtqia ? "Sim" : "Não"}
                  </strong>
                </span>
              )}
            </div>
          )}

          {/* Per-stage breakdown */}
          {stages.map((stage) => {
            const result = app.results?.find((r) => r.stageId === stage.id);
            const answers = answersByStage[stage.id] ?? [];
            const evals = evalsByStage[stage.id] ?? [];

            if (answers.length === 0 && evals.length === 0 && !result)
              return null;

            return (
              <StageSection
                key={stage.id}
                stage={stage}
                result={result}
                answers={answers}
                evals={evals}
              />
            );
          })}

          {/* General notes */}
          {app.notes && (
            <div className="bg-[var(--color-primary-bg)] border border-[var(--color-tertiary-bg)] rounded-lg p-3 text-xs text-[var(--color-text-main)] opacity-80 whitespace-pre-wrap">
              <strong className="block mb-1 opacity-60">
                Observações gerais:
              </strong>
              {app.notes}
            </div>
          )}

          {/* Link to profile */}
          <button
            onClick={() => {
              onClose();
              router.push(`/members/${app.memberId}`);
            }}
            className="self-start text-xs text-[var(--color-accent-blue)] hover:underline"
          >
            Ver perfil completo do membro →
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── Stage Section ────────────────────────────────────────────────────────────

function StageSection({
  stage,
  result,
  answers,
  evals,
}: {
  stage: Stage;
  result: StageResultItem | undefined;
  answers: AnswerItem[];
  evals: EvaluationItem[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col gap-3 border border-[var(--color-tertiary-bg)] rounded-[12px] overflow-hidden">
      {/* Stage header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-4 py-3 bg-[var(--color-secondary-bg)] hover:bg-[var(--color-tertiary-bg)] transition-colors text-left"
      >
        {result ? stageIcon(result.status) : <Clock size={14} className="opacity-30" />}
        <span className="font-bold text-white text-sm flex-1">{stage.title}</span>
        {result?.score != null && (
          <span className="text-sm font-semibold text-[var(--color-accent-blue)]">
            {result.score} pts
          </span>
        )}
        {open ? (
          <ChevronUp size={14} className="opacity-50" />
        ) : (
          <ChevronDown size={14} className="opacity-50" />
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-4 px-4 pb-4">
          {/* Stage notes */}
          {result?.notes && (
            <div className="text-xs bg-[var(--color-primary-bg)] border border-[var(--color-tertiary-bg)] rounded-lg px-3 py-2.5 text-[var(--color-text-main)] whitespace-pre-wrap">
              <span className="font-semibold opacity-50 block mb-1">
                Observação da etapa:
              </span>
              {result.notes}
            </div>
          )}

          {/* Text answers per question */}
          {answers.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold opacity-50 uppercase tracking-wide">
                Respostas
              </p>
              {answers.map((a) => (
                <div key={a.id} className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-[var(--color-accent-blue)]">
                    {a.question.order}. {a.question.title}
                  </p>
                  <p className="text-sm text-[var(--color-text-main)] bg-[var(--color-primary-bg)] border border-[var(--color-tertiary-bg)] rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed">
                    {a.answerText}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Evaluations per question */}
          {evals.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold opacity-50 uppercase tracking-wide">
                Avaliações
              </p>
              {evals.map((e) => (
                <div key={e.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[var(--color-accent-blue)]">
                      {e.question.order}. {e.question.title}
                    </p>
                    {e.score != null && (
                      <span className="text-xs font-mono font-bold text-white bg-[var(--color-secondary-bg)] border border-[var(--color-tertiary-bg)] px-2 py-0.5 rounded">
                        {e.score}
                        {e.question.maxScore > 0 && (
                          <span className="opacity-50">
                            /{e.question.maxScore}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  {e.notes && (
                    <p className="text-sm text-[var(--color-text-main)] bg-[var(--color-primary-bg)] border border-[var(--color-tertiary-bg)] rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed">
                      {e.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {answers.length === 0 && evals.length === 0 && !result?.notes && (
            <p className="text-xs opacity-40">
              Sem respostas ou avaliações registradas para esta etapa.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sort Header ──────────────────────────────────────────────────────────────

function SortHeader({
  label,
  colKey,
  sortKey,
  sortDir,
  onSort,
  className = "",
}: {
  label: string;
  colKey: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === colKey;
  return (
    <th
      onClick={() => onSort(colKey)}
      className={`p-3 text-left font-bold text-white whitespace-nowrap cursor-pointer select-none hover:bg-[var(--color-tertiary-bg)] transition-colors ${className}`}
    >
      <div className="flex items-center gap-1">
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ChevronUp size={13} />
          ) : (
            <ChevronDown size={13} />
          )
        ) : (
          <ChevronDown size={13} className="opacity-20" />
        )}
      </div>
    </th>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SelectionProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const processId = resolvedParams.id;
  const router = useRouter();

  const [process, setProcess] = useState<SelectionProcess | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Exclude stages where every question has maxScore=0 (e.g. Formulário de Inscrição)
  const scorableStages = useMemo(
    () =>
      stages.filter(
        (s) =>
          !(
            s.questions &&
            s.questions.length > 0 &&
            s.questions.every((q) => q.maxScore === 0)
          ),
      ),
    [stages],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [proc, apps] = await Promise.all([
          selectionService.getProcess(processId),
          selectionService.getApplications(processId),
        ]);
        setProcess(proc);
        setStages(proc?.stages ?? []);
        setApplications(apps);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [processId]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "total" || key.startsWith("stage:") ? "desc" : "asc");
    }
  };

  const filteredApps = useMemo(
    () =>
      statusFilter
        ? applications.filter((a) => a.status === statusFilter)
        : applications,
    [applications, statusFilter],
  );

  const sortedApps = useMemo(() => {
    return [...filteredApps].sort((a, b) => {
      let valA: number | string = "";
      let valB: number | string = "";

      if (sortKey === "name") {
        valA = a.member?.name ?? "";
        valB = b.member?.name ?? "";
      } else if (sortKey === "status") {
        valA = a.status;
        valB = b.status;
      } else if (sortKey === "total") {
        valA = getTotalScore(a) ?? -Infinity;
        valB = getTotalScore(b) ?? -Infinity;
      } else if (sortKey.startsWith("stage:")) {
        const sid = sortKey.replace("stage:", "");
        valA = getScore(a, sid) ?? -Infinity;
        valB = getScore(b, sid) ?? -Infinity;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredApps, sortKey, sortDir]);

  const handleExportCSV = async () => {
    try {
      await selectionService.exportCSV(processId);
    } catch {
      alert("Erro ao exportar resultados.");
    }
  };

  const handleImportClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx, .csv";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setImporting(true);
        try {
          const apps = await selectionService.importCandidates(
            processId,
            file,
          );
          setApplications(apps);
          alert("Candidatos importados com sucesso!");
        } catch {
          alert("Erro ao importar candidatos.");
        } finally {
          setImporting(false);
        }
      }
    };
    fileInput.click();
  };

  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  useEffect(() => {
    const role = localStorage.getItem("x-user-role") ?? "";
    setCanAccess(role === "ADMIN" || role === "PEOPLE");
  }, []);

  const approvedCount = applications.filter(
    (a) => a.status === "APPROVED",
  ).length;
  const rejectedCount = applications.filter(
    (a) => a.status === "REJECTED",
  ).length;

  if (canAccess === null) return null;
  if (!canAccess) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <ClipboardList size={48} className="opacity-20" />
        <h2 className="text-xl font-bold text-white">Acesso restrito</h2>
        <p className="text-sm opacity-60 max-w-sm">
          Esta seção é exclusiva para membros da diretoria de Pessoas.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 w-full max-w-full mx-auto flex flex-col gap-6"
    >
      {/* Back */}
      <button
        onClick={() => router.push("/selection")}
        className="flex items-center gap-1.5 text-sm text-text-main opacity-60 hover:opacity-100 transition-opacity w-fit"
      >
        <ArrowLeft size={15} />
        Processos Seletivos
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList
            size={32}
            className="text-[var(--color-accent-blue)]"
          />
          <div>
            <h1 className="text-3xl text-white font-bold">
              {process?.name ?? "Processo Seletivo"}
            </h1>
            {process && (
              <p className="text-sm opacity-60 mt-0.5">
                {process.year} · {applications.length} candidato
                {applications.length !== 1 ? "s" : ""} ·{" "}
                <span className="text-green-400">
                  {approvedCount} aprovado{approvedCount !== 1 ? "s" : ""}
                </span>
                {rejectedCount > 0 && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="text-red-400">
                      {rejectedCount} reprovado{rejectedCount !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleImportClick}
            disabled={importing}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload size={18} />
            {importing ? "Importando..." : "Importar"}
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

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-50 font-semibold uppercase tracking-wide">
          Filtrar:
        </span>
        {["", "APPROVED", "REJECTED", "IN_REVIEW", "SUBMITTED"].map((s) => {
          const count =
            s === ""
              ? applications.length
              : applications.filter((a) => a.status === s).length;
          if (s !== "" && count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-[10px] text-xs font-bold border-2 transition-colors ${
                statusFilter === s
                  ? "border-[var(--color-accent-blue)] text-[var(--color-accent-blue)]"
                  : "border-[var(--color-tertiary-bg)] text-[var(--color-text-main)] opacity-60 hover:opacity-100"
              }`}
            >
              {s === "" ? "Todos" : (APP_STATUS_LABEL[s] ?? s)} ({count})
            </button>
          );
        })}
      </div>

      {/* Spreadsheet */}
      {loading ? (
        <div className="card w-full min-h-[400px] flex items-center justify-center">
          <p className="opacity-60">Carregando candidatos...</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-[20px] border-[3px] border-[var(--color-tertiary-bg)]">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--color-secondary-bg)] border-b-[3px] border-[var(--color-tertiary-bg)]">
                <th className="p-3 font-bold text-white w-10 opacity-50">#</th>
                <SortHeader
                  label="Nome"
                  colKey="name"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Status"
                  colKey="status"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                {scorableStages.map((stage) => (
                  <SortHeader
                    key={stage.id}
                    label={stage.title}
                    colKey={`stage:${stage.id}`}
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="min-w-[150px]"
                  />
                ))}
                <SortHeader
                  label="Total"
                  colKey="total"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <th className="p-3 font-bold text-white w-12">
                  <Eye size={14} className="opacity-50" />
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--color-primary-bg)]">
              {sortedApps.length === 0 ? (
                <tr>
                  <td
                    colSpan={4 + scorableStages.length + 1}
                    className="p-8 text-center text-[var(--color-text-main)] opacity-60"
                  >
                    Nenhum candidato encontrado.
                  </td>
                </tr>
              ) : (
                sortedApps.map((app, idx) => {
                  const total = getTotalScore(app);
                  return (
                    <tr
                      key={app.id}
                      className="border-b-[3px] border-[var(--color-tertiary-bg)] last:border-b-0 hover:bg-[var(--color-secondary-bg)] transition-colors"
                    >
                      <td className="p-3 text-[var(--color-text-main)] opacity-40 font-mono text-xs">
                        {idx + 1}
                      </td>

                      <td className="p-3">
                        <p className="font-semibold text-white whitespace-nowrap">
                          {app.member?.name ??
                            `ID: ${app.memberId.slice(0, 8)}`}
                        </p>
                        {app.member?.email && (
                          <p className="text-xs opacity-40 whitespace-nowrap">
                            {app.member.email}
                          </p>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-[10px] text-xs font-bold whitespace-nowrap ${APP_STATUS_COLOR[app.status] ?? ""}`}
                        >
                          {APP_STATUS_LABEL[app.status] ?? app.status}
                        </span>
                      </td>

                      {scorableStages.map((stage) => {
                        const score = getScore(app, stage.id);
                        const st = getStageStatus(app, stage.id);
                        return (
                          <td key={stage.id} className="p-3">
                            <div className="flex items-center gap-1.5">
                              {st !== "PENDING" && stageIcon(st)}
                              <span
                                className={
                                  score != null
                                    ? "font-mono font-semibold text-white"
                                    : "opacity-25 text-xs"
                                }
                              >
                                {score != null ? score.toFixed(2) : "—"}
                              </span>
                            </div>
                          </td>
                        );
                      })}

                      <td className="p-3">
                        <span
                          className={
                            total != null
                              ? "font-mono font-bold text-[var(--color-accent-blue)]"
                              : "opacity-25 text-xs"
                          }
                        >
                          {total != null ? total.toFixed(2) : "—"}
                        </span>
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => setSelectedAppId(app.id)}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-tertiary-bg)] transition-colors"
                          title="Ver respostas e avaliações"
                        >
                          <Eye
                            size={16}
                            className="text-[var(--color-accent-blue)]"
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedAppId && (
        <CandidateDetailModal
          appId={selectedAppId}
          stages={stages}
          onClose={() => setSelectedAppId(null)}
        />
      )}
    </motion.div>
  );
}
