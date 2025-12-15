import api from "./axios";

export const UsersApi = {
  getProfile: () => api.get("/users/me"),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put("/users/me", data),

  deleteAccount: () => api.delete("/users/me"),
};
