import { api, downloadFile } from "./api";

export const pdiService = {
  savePdi: async (memberId: string, title: string, content: string) => {
    const response = await api.post(`/pdi`, {
      memberId,
      title,
      content,
    });
    return response.data;
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
