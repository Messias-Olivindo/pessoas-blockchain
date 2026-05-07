import { api } from "./api";

export type UserRole = "ADMIN" | "PEOPLE" | "INTERVIEWER";
export type UserStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface PlatformUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export const usersService = {
  getUsers: async (filters?: {
    role?: string;
    status?: string;
    q?: string;
    limit?: number;
  }): Promise<PlatformUser[]> => {
    const params = new URLSearchParams();
    if (filters?.role) params.set("role", filters.role);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.q) params.set("q", filters.q);
    if (filters?.limit) params.set("limit", String(filters.limit));
    const query = params.toString();
    const response = await api.get(`/users${query ? `?${query}` : ""}`);
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  approveUser: async (id: string, status: UserStatus): Promise<PlatformUser> => {
    const response = await api.patch(`/users/${id}/approve`, { status });
    return response.data?.data;
  },

  updateRole: async (id: string, role: UserRole): Promise<PlatformUser> => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data?.data;
  },
};
