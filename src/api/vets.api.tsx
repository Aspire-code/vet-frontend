import api from "./axios";

export const VetsApi = {
  list: (params?: { q?: string; location?: string }) =>
    api.get("/vets", { params }),

  create: (data: any) => api.post("/vets", data),

  getById: (id: string) => api.get(`/vets/${id}`),

  updateProfile: (id: string, data: any) =>
    api.put(`/vets/${id}`, data),

  updateServices: (id: string, services: string[]) =>
    api.put(`/vets/${id}/services`, { services }),
};
