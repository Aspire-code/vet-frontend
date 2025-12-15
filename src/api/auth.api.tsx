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


  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  logout: () => {
    localStorage.removeItem("vetlink_user"); 
  },
  me: () => api.get("/auth/me"),
};
