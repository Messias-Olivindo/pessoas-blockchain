import { api, downloadFile } from "./api";

export interface Member {
  id: string;
  name: string;
  email: string;
  status: string;
  department: string | null;
  position: string | null;
}

export const membersService = {
  getMembers: async (): Promise<Member[]> => {
    const response = await api.get("/members");
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  getMemberById: async (id: string): Promise<Member | null> => {
    const response = await api.get(`/members/${id}`);
    return response.data?.data || null;
  },

  importMembers: async (file: File): Promise<Member[]> => {
    const formData = new FormData();
    formData.append("file", file);
    await api.post("/import/members", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return membersService.getMembers();
  },

  exportCSV: async () => {
    const date = new Date().toISOString().split("T")[0];
    await downloadFile("/export/members/csv", `membros_${date}.csv`);
  },

  exportPDF: async (memberId: string) => {
    await downloadFile(`/export/members/${memberId}/pdf`, `membro_${memberId}.pdf`);
  }
};
