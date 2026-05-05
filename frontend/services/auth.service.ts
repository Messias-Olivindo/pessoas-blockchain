import { getBaseUrl } from "./api";

export const authService = {
  getGoogleAuthUrl: () => {
    return `${getBaseUrl()}/auth/google`;
  },
  
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("x-user-id");
      localStorage.removeItem("x-user-role");
    }
  },

  isAuthenticated: () => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("x-user-id");
    }
    return false;
  }
};
