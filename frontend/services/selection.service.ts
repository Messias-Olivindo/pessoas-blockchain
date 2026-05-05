import { api, getBaseUrl } from "./api";

export interface SelectionProcess {
  id: string;
  year: number;
  name: string;
  isActive: boolean;
}

export interface Application {
  id: string;
  memberId: string;
  status: string;
  member?: {
    name: string;
    email: string;
  };
}

export const selectionService = {
  getProcesses: async (): Promise<SelectionProcess[]> => {
    const response = await api.get("/selection/processes");
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  getApplications: async (processId: string): Promise<Application[]> => {
    const response = await api.get(`/selection/applications?processId=${processId}`);
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  importCandidates: async (processId: string, file: File): Promise<Application[]> => {
    const formData = new FormData();
    formData.append("file", file);
    await api.post(`/import/selection?processId=${processId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return selectionService.getApplications(processId);
  },

  getExportUrl: (processId: string) => {
    return `${getBaseUrl()}/export/selection/${processId}/csv`;
  }
};
