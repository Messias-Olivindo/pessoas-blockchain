import { api, getBaseUrl } from "./api";

export const pdiService = {
  savePdi: async (memberId: string, title: string, content: string) => {
    const response = await api.post(`/pdi`, {
      memberId,
      title,
      content,
    });
    return response.data;
  },

  getExportUrl: (memberId: string) => {
    return `${getBaseUrl()}/export/pdi/csv?memberId=${memberId}`;
  }
};
