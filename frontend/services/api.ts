import axios from "axios";

export const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Instância base do axios
export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

export function setupApiClient(userId?: string, userRole?: string) {
  api.interceptors.request.clear();
  
  api.interceptors.request.use((config) => {
    // Try to get from args, then localStorage, then fallback
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

// Inicializa o interceptor
setupApiClient();
