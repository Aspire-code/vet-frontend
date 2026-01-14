import api from "./axios";

export const AuthApi = {
  // Register a new user
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: "CLIENT" | "VET"; 
    phone?: string;
  }) => api.post("/auth/register", data),

  // Login existing user
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  // ✅ UPDATED LOGOUT: Clears both User and Token to prevent 401 loops
  logout: () => {
    localStorage.removeItem("vetlink_user");
    localStorage.removeItem("vetlink_token"); // ✅ Must clear this to stop "No token" alerts
    console.log("AuthApi: Local storage cleared");
  },

  // Fetch current user profile using the token in the header
  me: () => api.get("/auth/me"),
};