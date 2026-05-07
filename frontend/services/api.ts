import axios from "axios";

export const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { "Content-Type": "application/json" },
});

export function setupApiClient(userId?: string, userRole?: string) {
  api.interceptors.request.clear();
  api.interceptors.request.use((config) => {
    let id = userId;
    let role = userRole;
    if (typeof window !== "undefined") {
      if (!id) id = localStorage.getItem("x-user-id") || "";
      if (!role) role = localStorage.getItem("x-user-role") || "";
    }
    if (id) config.headers["x-user-id"] = id;
    if (role) config.headers["x-user-role"] = role;
    return config;
  });
}

// Sessão inválida → limpa localStorage e redireciona para /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== "undefined" && err?.response?.status === 401) {
      localStorage.removeItem("x-user-id");
      localStorage.removeItem("x-user-role");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

setupApiClient();

/**
 * Download a file from the API using authenticated axios (with x-user-id/x-user-role headers).
 * This is necessary because `window.open()` opens a raw browser request without custom headers,
 * causing 401 errors on protected export endpoints.
 */
export async function downloadFile(path: string, filename: string): Promise<void> {
  const response = await api.get(path, { responseType: "blob" });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
