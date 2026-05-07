import { api, downloadFile } from "./api";

export interface Member {
  id: string;
  name: string;
  email: string;
  status: string;
  department: string | null;
  position: string | null;
  gender: string | null;
  race: string | null;
  isLgbtqia: boolean | null;
  universityId: string | null;
  joinedAt: string | null;
  leftAt: string | null;
  interests: string[];
}

export interface MemberFilters {
  q?: string;
  status?: string;
  department?: string;
  position?: string;
  gender?: string;
  race?: string;
  isLgbtqia?: string;
  interests?: string;
  limit?: number;
}

export const membersService = {
  getMembers: async (filters?: MemberFilters): Promise<Member[]> => {
    const params = new URLSearchParams();
    if (filters?.q) params.set("q", filters.q);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.department) params.set("department", filters.department);
    if (filters?.position) params.set("position", filters.position);
    if (filters?.gender) params.set("gender", filters.gender);
    if (filters?.race) params.set("race", filters.race);
    if (filters?.isLgbtqia !== undefined) params.set("isLgbtqia", filters.isLgbtqia);
    if (filters?.interests) params.set("interests", filters.interests);
    if (filters?.limit) params.set("limit", String(filters.limit));

    const query = params.toString();
    const response = await api.get(`/members${query ? `?${query}` : ""}`);
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
      headers: { "Content-Type": "multipart/form-data" },
    });
    return membersService.getMembers();
  },

  updateMember: async (id: string, data: Partial<Omit<Member, "id">>) => {
    const response = await api.patch(`/members/${id}`, data);
    return response.data?.data || null;
  },

  exportCSV: async () => {
    const date = new Date().toISOString().split("T")[0];
    await downloadFile("/export/members/csv", `membros_${date}.csv`);
  },

  exportPDF: async (memberId: string) => {
    await downloadFile(
      `/export/members/${memberId}/pdf`,
      `membro_${memberId}.pdf`,
    );
  },
};
