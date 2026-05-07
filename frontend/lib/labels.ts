// Central translation map for all enum values displayed in the UI

export const MEMBER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  CANDIDATE: "Candidato",
  ALUMNI: "Alumni",
};

export const DEPARTMENT_LABEL: Record<string, string> = {
  PEOPLE: "Pessoas",
  MARKETING: "Marketing",
  PROJECTS: "Projetos",
  EDUCATIONAL: "Educacional",
  TECHNOLOGY: "Tecnologia",
  FINANCE: "Financeiro",
};

export const POSITION_LABEL: Record<string, string> = {
  MEMBER: "Membro",
  HEAD: "Líder",
  DIRECTOR: "Diretor(a)",
  PRESIDENT: "Presidente",
  VICE_PRESIDENT: "Vice-presidente",
};

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  SUBMITTED: "Submetido",
  IN_REVIEW: "Em revisão",
  APPROVED: "Aprovado",
  REJECTED: "Reprovado",
  WITHDRAWN: "Retirado",
};

export const STAGE_RESULT_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  PASSED: "Aprovado",
  FAILED: "Reprovado",
  SKIPPED: "Ignorado",
};

export const USER_ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  PEOPLE: "Pessoas",
  INTERVIEWER: "Entrevistador",
};

export const USER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

export const GENDER_LABEL: Record<string, string> = {
  Masculino: "Masculino",
  Feminino: "Feminino",
  "Não-binário": "Não-binário",
  "Prefiro não informar": "Prefiro não informar",
};

export const RACE_LABEL: Record<string, string> = {
  Branco: "Branco",
  Pardo: "Pardo",
  Preto: "Preto",
  Amarelo: "Amarelo",
  Indígena: "Indígena",
  "Prefiro não informar": "Prefiro não informar",
};

/** Returns a label or falls back to the raw value. */
export function label(
  map: Record<string, string>,
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return map[value] ?? value;
}
