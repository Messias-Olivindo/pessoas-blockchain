"use client";

import { Download, Upload, Users, Search, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Table, Column } from "@/components/ui/Table";
import { membersService, Member, MemberFilters } from "@/services/members.service";
import { selectionService, SelectionProcess, Application } from "@/services/selection.service";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MEMBER_STATUS_LABEL, DEPARTMENT_LABEL, POSITION_LABEL, label } from "@/lib/labels";

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
  { value: "CANDIDATE", label: "Candidato" },
  { value: "ALUMNI", label: "Alumni" },
];

const DEPARTMENT_OPTIONS = [
  { value: "", label: "Todos os departamentos" },
  { value: "PEOPLE", label: "People" },
  { value: "MARKETING", label: "Marketing" },
  { value: "PROJECTS", label: "Projetos" },
  { value: "EDUCATIONAL", label: "Educacional" },
];

const POSITION_OPTIONS = [
  { value: "", label: "Todos os cargos" },
  { value: "MEMBER", label: "Membro" },
  { value: "HEAD", label: "Head" },
  { value: "DIRECTOR", label: "Diretor(a)" },
  { value: "PRESIDENT", label: "Presidente" },
];

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-[var(--color-accent-blue)] text-white",
  INACTIVE: "bg-[var(--color-tertiary-bg)] text-[var(--color-text-main)]",
  CANDIDATE: "bg-purple-700 text-white",
  ALUMNI: "bg-yellow-700 text-white",
};

interface SelectFilter {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

function SelectFilter({ label, value, options, onChange }: SelectFilter) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[var(--color-secondary-bg)] border-[3px] border-[var(--color-tertiary-bg)] text-[var(--color-text-main)] text-sm rounded-[12px] px-3 py-2 pr-8 focus:outline-none focus:border-[var(--color-accent-blue)] cursor-pointer min-w-[150px]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-main)] pointer-events-none opacity-60"
      />
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <Users size={48} className="opacity-20" />
      <h2 className="text-xl font-bold text-white">Acesso restrito</h2>
      <p className="text-sm opacity-60 max-w-sm">
        Esta seção é exclusiva para membros da diretoria de Pessoas (ADMIN e PEOPLE).
      </p>
    </div>
  );
}

export default function MembersPage() {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [displayedMembers, setDisplayedMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const router = useRouter();

  const role =
    typeof window !== "undefined"
      ? (localStorage.getItem("x-user-role") ?? "")
      : "";
  const canAccess = role === "ADMIN" || role === "PEOPLE";

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [processFilter, setProcessFilter] = useState("");
  const [interestsFilter, setInterestsFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Selection process options
  const [processes, setProcesses] = useState<SelectionProcess[]>([]);
  const [processApplicants, setProcessApplicants] = useState<Set<string>>(new Set());

  // Debounce timer
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load processes for filter
  useEffect(() => {
    selectionService.getProcesses().then(setProcesses).catch(() => {});
  }, []);

  // When process filter changes, load applicants
  useEffect(() => {
    if (!processFilter) {
      setProcessApplicants(new Set());
      return;
    }
    selectionService.getApplications(processFilter).then((apps: Application[]) => {
      setProcessApplicants(new Set(apps.map((a) => a.memberId)));
    }).catch(() => setProcessApplicants(new Set()));
  }, [processFilter]);

  // Fetch members from server whenever server-side filters change
  const fetchMembers = useCallback(async (filters: MemberFilters) => {
    setLoading(true);
    try {
      const data = await membersService.getMembers({ ...filters, limit: 200 });
      setAllMembers(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (canAccess) fetchMembers({ limit: 200 });
    else setLoading(false);
  }, [fetchMembers, canAccess]);

  // Re-fetch when server-side filters change (with debounce for search)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMembers({
        q: search || undefined,
        status: statusFilter || undefined,
        department: deptFilter || undefined,
        position: positionFilter || undefined,
        interests: interestsFilter || undefined,
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, statusFilter, deptFilter, positionFilter, interestsFilter, fetchMembers]);

  // Client-side filter for process (cross-reference)
  useEffect(() => {
    if (!processFilter || processApplicants.size === 0) {
      setDisplayedMembers(allMembers);
    } else {
      setDisplayedMembers(allMembers.filter((m) => processApplicants.has(m.id)));
    }
  }, [allMembers, processFilter, processApplicants]);

  const activeFilterCount = [search, statusFilter, deptFilter, positionFilter, processFilter, interestsFilter].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDeptFilter("");
    setPositionFilter("");
    setProcessFilter("");
    setInterestsFilter("");
  };

  const handleExportCSV = async () => {
    try {
      await membersService.exportCSV();
    } catch {
      alert("Erro ao exportar CSV.");
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
          const data = await membersService.importMembers(file);
          setAllMembers(data);
          alert("Membros importados com sucesso!");
        } catch {
          alert("Erro ao importar membros.");
        } finally {
          setImporting(false);
        }
      }
    };
    fileInput.click();
  };

  const columns: Column<Member>[] = [
    {
      key: "name",
      header: "Nome",
      render: (m) => <span className="font-medium text-white">{m.name}</span>,
    },
    { key: "email", header: "Email" },
    {
      key: "department",
      header: "Departamento",
      render: (m) =>
        m.department ? (
          label(DEPARTMENT_LABEL, m.department)
        ) : (
          <span className="opacity-40">—</span>
        ),
    },
    {
      key: "position",
      header: "Cargo",
      render: (m) =>
        m.position ? (
          label(POSITION_LABEL, m.position)
        ) : (
          <span className="opacity-40">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (m) => (
        <span
          className={`px-2 py-1 rounded-[10px] text-xs font-bold ${STATUS_BADGE[m.status] ?? "bg-[var(--color-tertiary-bg)]"}`}
        >
          {label(MEMBER_STATUS_LABEL, m.status)}
        </span>
      ),
    },
    {
      key: "interests",
      header: "Interesses",
      render: (m) =>
        m.interests && m.interests.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {m.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="px-2 py-0.5 rounded-full text-xs bg-tertiary-bg text-text-main whitespace-nowrap"
              >
                {interest}
              </span>
            ))}
            {m.interests.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-tertiary-bg opacity-50 whitespace-nowrap">
                +{m.interests.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className="opacity-30 text-xs">—</span>
        ),
    },
  ];

  if (!canAccess) return <AccessDenied />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 w-full max-w-7xl mx-auto flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Users size={32} className="text-[var(--color-accent-blue)]" />
          <div>
            <h1 className="text-3xl text-white font-bold">Membros do Clube</h1>
            {!loading && (
              <p className="text-sm opacity-60 mt-0.5">
                {displayedMembers.length} membro{displayedMembers.length !== 1 ? "s" : ""}
                {activeFilterCount > 0 ? " encontrado(s)" : " no total"}
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

      {/* Search + filters bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-main)] opacity-50"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="w-full bg-[var(--color-secondary-bg)] border-[3px] border-[var(--color-tertiary-bg)] text-[var(--color-text-main)] text-sm rounded-[12px] pl-9 pr-4 py-2 focus:outline-none focus:border-[var(--color-accent-blue)] placeholder:opacity-40"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Toggle filters */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] border-[3px] text-sm font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? "border-[var(--color-accent-blue)] text-[var(--color-accent-blue)]"
                : "border-[var(--color-tertiary-bg)] text-[var(--color-text-main)]"
            }`}
          >
            <ChevronDown
              size={14}
              className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
            Filtros
            {activeFilterCount > 0 && (
              <span className="bg-[var(--color-accent-blue)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </motion.button>

          {activeFilterCount > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-[var(--color-accent-magenta)] hover:opacity-80"
            >
              <X size={14} />
              Limpar
            </motion.button>
          )}
        </div>

        {/* Filter dropdowns */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3 pt-1">
                <SelectFilter
                  label="Status"
                  value={statusFilter}
                  options={STATUS_OPTIONS}
                  onChange={setStatusFilter}
                />
                <SelectFilter
                  label="Departamento"
                  value={deptFilter}
                  options={DEPARTMENT_OPTIONS}
                  onChange={setDeptFilter}
                />
                <SelectFilter
                  label="Cargo"
                  value={positionFilter}
                  options={POSITION_OPTIONS}
                  onChange={setPositionFilter}
                />
                <div className="relative">
                  <select
                    value={processFilter}
                    onChange={(e) => setProcessFilter(e.target.value)}
                    className="appearance-none bg-[var(--color-secondary-bg)] border-[3px] border-[var(--color-tertiary-bg)] text-[var(--color-text-main)] text-sm rounded-[12px] px-3 py-2 pr-8 focus:outline-none focus:border-[var(--color-accent-blue)] cursor-pointer min-w-[200px]"
                  >
                    <option value="">Todos os processos</option>
                    {processes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.year})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-main)] pointer-events-none opacity-60"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={interestsFilter}
                    onChange={(e) => setInterestsFilter(e.target.value)}
                    placeholder="Filtrar por interesse..."
                    className="bg-secondary-bg border-[3px] border-tertiary-bg text-text-main text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-accent-blue min-w-45 placeholder:opacity-40"
                  />
                  {interestsFilter && (
                    <button
                      onClick={() => setInterestsFilter("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card w-full min-h-[400px] flex items-center justify-center">
          <p className="opacity-60">Carregando membros...</p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={displayedMembers}
          emptyMessage="Nenhum membro encontrado com os filtros aplicados."
          onRowClick={(member) => router.push(`/members/${member.id}`)}
        />
      )}
    </motion.div>
  );
}
