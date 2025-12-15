import api from "./axios";

export const AppointmentsApi = {
  book: (data: {
    vetId: string;
    date: string;
    reason: string;
  }) => api.post("/appointments", data),

  myAppointments: () => api.get("/appointments/my"),

  cancel: (id: string) => api.delete(`/appointments/${id}`),
};
