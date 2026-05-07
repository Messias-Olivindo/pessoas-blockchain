"use client";

import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  FileText,
  User,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Pencil,
  X,
  Save,
  Plus,
  Tag,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { membersService, Member } from "@/services/members.service";
import { selectionService, Application, StageResultItem, EvaluationItem, AnswerItem } from "@/services/selection.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  APPLICATION_STATUS_LABEL,
  MEMBER_STATUS_LABEL,
  DEPARTMENT_LABEL,
  POSITION_LABEL,
  STAGE_RESULT_STATUS_LABEL,
  label,
} from "@/lib/labels";

// ─── Interest suggestions ──────────────────────────────────────────────────────

const INTEREST_SUGGESTIONS = [
  "Hackathon",
  "Acadêmico",
  "Pesquisa",
  "Blockchain",
  "Design",
  "Tecnologia",
  "Finanças",
];

// ─── Constants ─────────────────────────────────────────────────────────────────

const APPLICATION_STATUS_COLOR: Record<string, string> = {
  APPROVED: "bg-[var(--color-accent-blue)] text-white",
  REJECTED: "bg-[var(--color-accent-magenta)] text-white",
  IN_REVIEW: "bg-yellow-700 text-white",
  SUBMITTED: "bg-purple-700 text-white",
  DRAFT: "bg-[var(--color-tertiary-bg)] text-[var(--color-text-main)]",
  WITHDRAWN: "bg-[var(--color-tertiary-bg)] text-[var(--color-text-main)]",
};

const MEMBER_STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-[var(--color-accent-blue)] text-white",
  INACTIVE: "bg-[var(--color-tertiary-bg)] text-[var(--color-text-main)]",
  CANDIDATE: "bg-purple-700 text-white",
  ALUMNI: "bg-yellow-700 text-white",
};


const DEPT_OPTIONS = ["", "PEOPLE", "MARKETING", "PROJECTS", "EDUCATIONAL"];
const POS_OPTIONS = ["", "MEMBER", "HEAD", "DIRECTOR", "PRESIDENT"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "CANDIDATE", "ALUMNI"];
const GENDER_OPTIONS = ["", "Masculino", "Feminino", "Não-binário", "Prefiro não informar"];
const RACE_OPTIONS = ["", "Branco", "Pardo", "Preto", "Amarelo", "Indígena", "Prefiro não informar"];

// ─── Sub-components ────────────────────────────────────────────────────────────

function StageResultBadge({ result }: { result: StageResultItem }) {
  const icon =
    result.status === "PASSED" ? (
      <CheckCircle2 size={13} className="text-green-400" />
    ) : result.status === "FAILED" ? (
      <XCircle size={13} className="text-red-400" />
    ) : (
      <Clock size={13} className="opacity-50" />
    );

  return (
    <div className="flex items-center gap-1.5 bg-[var(--color-primary-bg)] border border-[var(--color-tertiary-bg)] rounded-lg px-2.5 py-1.5">
      {icon}
      <div>
        <p className="text-xs font-semibold text-white leading-none">
          {result.stage.title}
        </p>
        {result.score != null && (
          <p className="text-[10px] opacity-60 leading-none mt-0.5">
            {result.score} pts
          </p>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode | null | undefined;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[var(--color-accent-blue)] font-semibold min-w-[120px] shrink-0 pt-0.5">
        {label}:
      </span>
      <span className="text-[var(--color-text-main)]">
        {value ?? <span className="opacity-40">—</span>}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[var(--color-accent-blue)] uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "bg-[var(--color-primary-bg)] border-[2px] border-[var(--color-tertiary-bg)] text-[var(--color-text-main)] text-sm rounded-[10px] px-3 py-2 focus:outline-none focus:border-[var(--color-accent-blue)] w-full";

const selectCls =
  "appearance-none bg-[var(--color-primary-bg)] border-[2px] border-[var(--color-tertiary-bg)] text-[var(--color-text-main)] text-sm rounded-[10px] px-3 py-2 focus:outline-none focus:border-[var(--color-accent-blue)] w-full cursor-pointer";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
}

function toInputDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

// ─── Interests tag editor ──────────────────────────────────────────────────────

function InterestsTags({
  interests,
  editing,
  onChange,
}: {
  interests: string[];
  editing: boolean;
  onChange?: (interests: string[]) => void;
}) {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !interests.includes(tag)) {
      onChange?.([...interests, tag]);
    }
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    onChange?.(interests.filter((t) => t !== tag));
  };

  if (interests.length === 0 && !editing) {
    return <span className="opacity-40 text-sm">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {interests.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2.5 py-1 bg-[var(--color-secondary-bg)] border border-[var(--color-tertiary-bg)] rounded-full text-xs font-medium text-[var(--color-text-main)]"
        >
          <Tag size={10} className="opacity-50" />
          {tag}
          {editing && (
            <button
              onClick={() => removeTag(tag)}
              className="ml-0.5 text-[var(--color-accent-magenta)] hover:opacity-80"
            >
              <X size={11} />
            </button>
          )}
        </span>
      ))}
      {editing && (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="+ adicionar..."
            className="bg-[var(--color-primary-bg)] border border-[var(--color-tertiary-bg)] text-[var(--color-text-main)] text-xs rounded-full px-3 py-1 w-32 focus:outline-none focus:border-[var(--color-accent-blue)]"
          />
          <button
            onClick={addTag}
            className="p-1 rounded-full bg-[var(--color-accent-blue)] text-white hover:opacity-80"
          >
            <Plus size={11} />
          </button>
        </div>
      )}
      {editing && (
        <div className="w-full flex flex-wrap gap-1.5 items-center pt-1">
          <span className="text-xs opacity-40">Sugestões:</span>
          {INTEREST_SUGGESTIONS.filter((s) => !interests.includes(s)).map((s) => (
            <button
              key={s}
              onClick={() => onChange?.([...interests, s])}
              className="px-2 py-0.5 text-xs rounded-full border border-tertiary-bg text-text-main hover:border-accent-blue hover:text-accent-blue transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Application detail (lazy-loaded) ─────────────────────────────────────────

function ApplicationDetail({ appId }: { appId: string }) {
  const [detail, setDetail] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    selectionService
      .getApplicationDetail(appId)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 size={16} className="animate-spin opacity-40" />
      </div>
    );
  }

  if (!detail) {
    return (
      <p className="text-xs opacity-50 py-2">
        Não foi possível carregar os detalhes.
      </p>
    );
  }

  const stageNotes = detail.results?.filter((r) => r.notes) ?? [];

  // Agrupar avaliações por etapa
  const evalsByStage = new Map<
    string,
    { stageName: string; order: number; evals: EvaluationItem[] }
  >();
  for (const ev of detail.evaluations ?? []) {
    const key = ev.question.stageId;
    if (!evalsByStage.has(key)) {
      evalsByStage.set(key, {
        stageName: ev.question.stage.title,
        order: ev.question.stage.order,
        evals: [],
      });
    }
    evalsByStage.get(key)!.evals.push(ev);
  }
  const stageGroups = [...evalsByStage.values()].sort(
    (a, b) => a.order - b.order,
  );
  const hasEvals = stageGroups.some((g) => g.evals.length > 0);

  // Agrupar respostas do candidato por etapa
  const answersByStage = new Map<
    string,
    { stageName: string; order: number; answers: AnswerItem[] }
  >();
  for (const ans of detail.answers ?? []) {
    const key = ans.question.stageId;
    if (!answersByStage.has(key)) {
      answersByStage.set(key, {
        stageName: ans.question.stage.title,
        order: ans.question.stage.order,
        answers: [],
      });
    }
    answersByStage.get(key)!.answers.push(ans);
  }
  const answerGroups = [...answersByStage.values()].sort(
    (a, b) => a.order - b.order,
  );
  const hasAnswers = answerGroups.some((g) => g.answers.length > 0);

  if (!hasEvals && !hasAnswers && stageNotes.length === 0) {
    return (
      <p className="text-xs opacity-50 py-2">
        Sem avaliações ou respostas registradas.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5 pt-3">
      {/* Anotações gerais por etapa (notas do StageResult) */}
      {stageNotes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-accent-blue uppercase tracking-wide">
            Anotações por etapa
          </p>
          {stageNotes.map((r) => (
            <div key={r.id} className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-white">
                {r.stage.title}
              </span>
              <p className="text-xs opacity-70 italic">{r.notes}</p>
            </div>
          ))}
        </div>
      )}

      {/* Respostas de texto do candidato (questões sem nota) */}
      {hasAnswers && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-accent-blue uppercase tracking-wide">
            Respostas do candidato
          </p>
          {answerGroups.map(({ stageName, answers }) => (
            <div key={stageName} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-white opacity-70">
                {stageName}
              </p>
              {answers
                .sort((a, b) => a.question.order - b.question.order)
                .map((ans) => (
                  <div
                    key={ans.id}
                    className="flex flex-col gap-1 pl-3 border-l-2 border-tertiary-bg"
                  >
                    <p className="text-xs text-text-main font-medium">
                      {ans.question.title}
                    </p>
                    <p className="text-xs opacity-60 leading-relaxed">
                      {ans.answerText}
                    </p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}

      {/* Avaliações com nota por questão */}
      {hasEvals && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-accent-blue uppercase tracking-wide">
            Avaliações por questão
          </p>
          {stageGroups.map(({ stageName, evals }) => (
            <div key={stageName} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-white opacity-70">
                {stageName}
              </p>
              {evals
                .sort((a, b) => a.question.order - b.question.order)
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="flex flex-col gap-0.5 pl-3 border-l-2 border-tertiary-bg"
                  >
                    <p className="text-xs text-text-main font-medium">
                      {ev.question.title}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {ev.score != null && ev.question.maxScore > 0 && (
                        <span className="text-xs font-semibold text-accent-blue">
                          {ev.score}/{ev.question.maxScore} pts
                        </span>
                      )}
                      {ev.notes && (
                        <span className="text-xs opacity-60 italic">
                          {ev.notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Application card with expandable detail ───────────────────────────────────

function ApplicationCard({ app }: { app: Application }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3 p-4 bg-primary-bg border border-tertiary-bg rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-white">
            {app.process?.name ?? "Processo desconhecido"}
            {app.process?.year && (
              <span className="text-xs font-normal opacity-60 ml-2">
                ({app.process.year})
              </span>
            )}
          </p>
          {app.notes && (
            <p className="text-xs opacity-60 mt-0.5">{app.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-[10px] text-xs font-bold ${APPLICATION_STATUS_COLOR[app.status] ?? ""}`}
          >
            {APPLICATION_STATUS_LABEL[app.status] ?? app.status}
          </span>
          <button
            onClick={() => router.push(`/selection/${app.processId}`)}
            className="text-xs text-accent-blue hover:underline flex items-center gap-0.5"
          >
            Ver processo <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {app.results && app.results.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {app.results.map((r) => (
            <StageResultBadge key={r.id} result={r} />
          ))}
        </div>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        className="self-start flex items-center gap-1 text-xs font-semibold text-text-main opacity-60 hover:opacity-100 hover:text-white transition-all"
      >
        {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        {expanded ? "Ver menos" : "Ver mais"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ApplicationDetail appId={app.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const memberId = resolvedParams.id;
  const router = useRouter();

  const [member, setMember] = useState<Member | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingMember, setLoadingMember] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Member>>({});

  useEffect(() => {
    const role = localStorage.getItem("x-user-role") ?? "";
    setCanEdit(["ADMIN", "PEOPLE"].includes(role));
  }, []);

  useEffect(() => {
    membersService
      .getMemberById(memberId)
      .then((m) => {
        setMember(m);
        if (m) setForm(m);
      })
      .catch(() => {})
      .finally(() => setLoadingMember(false));

    selectionService
      .getMemberApplications(memberId)
      .then(setApplications)
      .catch((err) => {
        const status = err?.response?.status;
        if (status !== 404) console.error("getMemberApplications:", status, err?.message);
      })
      .finally(() => setLoadingApps(false));
  }, [memberId]);

  const handleExportPDF = async () => {
    try {
      await membersService.exportPDF(memberId);
    } catch {
      alert("Erro ao exportar PDF.");
    }
  };

  const handleSave = async () => {
    if (!member) return;
    setSaving(true);
    try {
      const updated = await membersService.updateMember(memberId, {
        name: form.name,
        email: form.email,
        department: form.department,
        position: form.position,
        status: form.status,
        gender: form.gender,
        race: form.race,
        isLgbtqia: form.isLgbtqia,
        universityId: form.universityId,
        interests: form.interests ?? [],
        joinedAt: form.joinedAt,
        leftAt: form.leftAt,
      });
      if (updated) {
        setMember(updated);
        setForm(updated);
      }
      setEditing(false);
    } catch {
      alert("Erro ao salvar. Verifique as permissões.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (member) setForm(member);
    setEditing(false);
  };

  const set = <K extends keyof Member>(k: K, v: Member[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  if (loadingMember) {
    return (
      <div className="p-8 text-[var(--color-text-main)] opacity-70">
        Carregando perfil...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-[var(--color-accent-magenta)] font-bold">
        Membro não encontrado.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 w-full max-w-5xl mx-auto flex flex-col gap-8"
    >
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <User size={32} className="text-[var(--color-accent-blue)]" />
          <div className="flex flex-col gap-0.5">
            <h1 className="text-3xl text-white font-bold">
              {editing ? (
                <input
                  value={form.name ?? ""}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputCls + " text-2xl font-bold"}
                />
              ) : (
                member.name
              )}
            </h1>
            <p className="text-[var(--color-text-main)] opacity-60 text-sm">
              {member.email}
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {editing ? (
            <>
              <Button onClick={handleCancel} variant="secondary" disabled={saving}>
                <X size={16} />
                Cancelar
              </Button>
              <Button onClick={handleSave} variant="primary" disabled={saving}>
                <Save size={16} />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </>
          ) : (
            <>
              {canEdit && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => setEditing(true)} variant="secondary">
                    <Pencil size={16} />
                    Editar
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleExportPDF} variant="primary">
                  <FileText size={16} />
                  Exportar PDF
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 1: Informações Básicas + Demográficos ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="flex flex-col gap-4 h-full">
            <h2 className="text-xl font-bold border-b-[3px] border-[var(--color-tertiary-bg)] pb-2">
              Informações Básicas
            </h2>

            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <Field label="Status">
                    <select
                      value={form.status ?? ""}
                      onChange={(e) => set("status", e.target.value)}
                      className={selectCls}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {label(MEMBER_STATUS_LABEL, s)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Departamento">
                    <select
                      value={form.department ?? ""}
                      onChange={(e) => set("department", e.target.value || null as any)}
                      className={selectCls}
                    >
                      {DEPT_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d ? label(DEPARTMENT_LABEL, d) : "— Nenhum —"}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Cargo">
                    <select
                      value={form.position ?? ""}
                      onChange={(e) => set("position", e.target.value || null as any)}
                      className={selectCls}
                    >
                      {POS_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p ? label(POSITION_LABEL, p) : "— Nenhum —"}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email ?? ""}
                      onChange={(e) => set("email", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="RA">
                    <input
                      type="text"
                      value={form.universityId ?? ""}
                      onChange={(e) => set("universityId", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Data de ingresso">
                    <input
                      type="date"
                      value={toInputDate(form.joinedAt)}
                      onChange={(e) => set("joinedAt", e.target.value || null as any)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Data de saída">
                    <input
                      type="date"
                      value={toInputDate(form.leftAt)}
                      onChange={(e) => set("leftAt", e.target.value || null as any)}
                      className={inputCls}
                    />
                  </Field>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-2.5 text-sm"
                >
                  <Row
                    label="Status"
                    value={
                      <span
                        className={`px-2 py-0.5 rounded-[10px] text-xs font-bold ${MEMBER_STATUS_COLOR[member.status] ?? ""}`}
                      >
                        {label(MEMBER_STATUS_LABEL, member.status)}
                      </span>
                    }
                  />
                  <Row label="Departamento" value={label(DEPARTMENT_LABEL, member.department)} />
                  <Row label="Cargo" value={label(POSITION_LABEL, member.position)} />
                  <Row label="Email" value={member.email} />
                  <Row label="RA" value={member.universityId} />
                  <Row label="Ingressou em" value={formatDate(member.joinedAt)} />
                  <Row label="Saiu em" value={formatDate(member.leftAt)} />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Dados Demográficos */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="flex flex-col gap-4 h-full">
            <h2 className="text-xl font-bold border-b-[3px] border-[var(--color-tertiary-bg)] pb-2">
              Dados Demográficos
            </h2>

            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <Field label="Gênero">
                    <select
                      value={form.gender ?? ""}
                      onChange={(e) => set("gender", e.target.value || null as any)}
                      className={selectCls}
                    >
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g || "— Não informado —"}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Raça/Cor">
                    <select
                      value={form.race ?? ""}
                      onChange={(e) => set("race", e.target.value || null as any)}
                      className={selectCls}
                    >
                      {RACE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r || "— Não informado —"}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="LGBTQIA+">
                    <select
                      value={
                        form.isLgbtqia == null
                          ? ""
                          : form.isLgbtqia
                          ? "true"
                          : "false"
                      }
                      onChange={(e) =>
                        set(
                          "isLgbtqia",
                          e.target.value === ""
                            ? null as any
                            : e.target.value === "true",
                        )
                      }
                      className={selectCls}
                    >
                      <option value="">— Não informado —</option>
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  </Field>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-2.5 text-sm"
                >
                  <Row label="Gênero" value={member.gender} />
                  <Row label="Raça/Cor" value={member.race} />
                  <Row
                    label="LGBTQIA+"
                    value={
                      member.isLgbtqia == null
                        ? null
                        : member.isLgbtqia
                        ? "Sim"
                        : "Não"
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>

      {/* ── Interesses ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-bold border-b-[3px] border-[var(--color-tertiary-bg)] pb-2 flex items-center gap-2">
            <Tag size={18} className="text-[var(--color-accent-blue)]" />
            Áreas de Interesse
          </h2>
          <InterestsTags
            interests={editing ? (form.interests ?? []) : (member.interests ?? [])}
            editing={editing}
            onChange={(tags) => set("interests", tags)}
          />
          {!editing && (member.interests ?? []).length === 0 && (
            <p className="text-xs opacity-40">
              Nenhum interesse cadastrado. Clique em &quot;Editar&quot; para adicionar.
            </p>
          )}
        </Card>
      </motion.div>

      {/* ── PDI ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card variant="educational" className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b-[3px] border-[var(--color-tertiary-bg)] pb-2">
            <h2 className="text-xl font-bold">
              Plano de Desenvolvimento Individual (PDI)
            </h2>
            <Link
              href={`/members/${memberId}/pdi`}
              className="text-xs font-bold flex items-center gap-1 hover:underline"
            >
              Abrir PDI <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-sm opacity-70">
            Acesse e edite o PDI deste membro, exporte em PDF ou CSV com o
            histórico de revisões.
          </p>
        </Card>
      </motion.div>

      {/* ── Processos Seletivos ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b-[3px] border-[var(--color-tertiary-bg)] pb-2">
            <ClipboardList
              size={20}
              className="text-[var(--color-accent-blue)]"
            />
            <h2 className="text-xl font-bold">Processos Seletivos</h2>
          </div>

          {loadingApps ? (
            <p className="text-sm opacity-60">Carregando histórico...</p>
          ) : applications.length === 0 ? (
            <p className="text-sm opacity-50">
              Nenhum processo seletivo registrado para este membro.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {applications.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
