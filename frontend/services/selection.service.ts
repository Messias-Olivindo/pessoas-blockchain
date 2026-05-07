import { api, downloadFile } from "./api";

export interface SelectionProcess {
  id: string;
  year: number;
  name: string;
  isActive: boolean;
  stages?: Stage[];
}

export interface Stage {
  id: string;
  title: string;
  order: number;
  questions?: Question[];
}

export interface Question {
  id: string;
  title: string;
  order: number;
  maxScore: number;
  weight: number;
  stageId?: string;
  stage?: { id: string; title: string; order: number };
}

export interface StageResultItem {
  id: string;
  stageId: string;
  status: string;
  score: number | null;
  notes: string | null;
  decidedAt: string | null;
  stage: { id: string; title: string; order: number };
}

export interface AnswerItem {
  id: string;
  questionId: string;
  answerText: string;
  question: {
    id: string;
    title: string;
    order: number;
    stageId: string;
    stage: { id: string; title: string; order: number };
  };
}

export interface EvaluationItem {
  id: string;
  questionId: string;
  score: number | null;
  notes: string | null;
  question: {
    id: string;
    title: string;
    order: number;
    maxScore: number;
    stageId: string;
    stage: { id: string; title: string; order: number };
  };
}

export interface Application {
  id: string;
  memberId: string;
  processId: string;
  status: string;
  notes: string | null;
  appliedAt: string | null;
  member?: {
    id: string;
    name: string;
    email: string;
    gender: string | null;
    race: string | null;
    isLgbtqia: boolean | null;
  };
  process?: { id: string; name: string; year: number };
  results?: StageResultItem[];
  answers?: AnswerItem[];
  evaluations?: EvaluationItem[];
}

export const selectionService = {
  getProcesses: async (): Promise<SelectionProcess[]> => {
    const response = await api.get("/selection/processes");
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  getProcess: async (processId: string): Promise<SelectionProcess | null> => {
    const response = await api.get(`/selection/processes/${processId}`);
    return response.data?.data || null;
  },

  getApplications: async (processId: string): Promise<Application[]> => {
    const response = await api.get(
      `/selection/applications?processId=${processId}&limit=200`,
    );
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  getApplicationDetail: async (applicationId: string): Promise<Application | null> => {
    const response = await api.get(`/selection/applications/${applicationId}`);
    return response.data?.data || null;
  },

  getMemberApplications: async (memberId: string): Promise<Application[]> => {
    const response = await api.get(
      `/selection/applications?memberId=${memberId}&limit=50`,
    );
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  importCandidates: async (
    processId: string,
    file: File,
  ): Promise<Application[]> => {
    const formData = new FormData();
    formData.append("file", file);
    await api.post(`/import/selection?processId=${processId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return selectionService.getApplications(processId);
  },

  exportCSV: async (processId: string) => {
    await downloadFile(
      `/export/selection/${processId}/csv`,
      `selecao_${processId}.csv`,
    );
  },
};
