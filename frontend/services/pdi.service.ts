import { api, downloadFile } from "./api";

export interface PdiEntry {
  id: string;
  memberId: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const pdiService = {
  getPdis: async (memberId?: string): Promise<PdiEntry[]> => {
    const url = memberId ? `/pdi?memberId=${memberId}` : `/pdi`;
    const response = await api.get(url);
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  savePdi: async (memberId: string, title: string, content: string): Promise<PdiEntry | null> => {
    const response = await api.post(`/pdi`, { memberId, title, content });
    return response.data?.data ?? null;
  },

  updatePdi: async (pdiId: string, title: string, content: string): Promise<PdiEntry | null> => {
    const response = await api.patch(`/pdi/${pdiId}`, { title, content });
    return response.data?.data ?? null;
  },

  exportCSV: async (memberId: string) => {
    const date = new Date().toISOString().split("T")[0];
    await downloadFile(
      `/export/pdi/csv?memberId=${memberId}`,
      `pdi_${memberId}_${date}.csv`,
    );
  },

  exportPDF: async (memberId: string) => {
    await downloadFile(
      `/export/members/${memberId}/pdf`,
      `membro_${memberId}.pdf`,
    );
  },
};
