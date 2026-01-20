import api from "./axios";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "canceled"
  | "completed";

export interface BookAppointmentPayload {
  client_id: string;
  vet_id: string;
  service_id: string;
  scheduled_time: string; // YYYY-MM-DD HH:mm:ss
  status?: AppointmentStatus; // optional
}

export const AppointmentsApi = {
  book: ({
    client_id,
    vet_id,
    service_id,
    scheduled_time,
    status = "pending", // default status
  }: BookAppointmentPayload) => {
    if (!client_id || !vet_id || !service_id || !scheduled_time) {
      throw new Error("Missing required booking fields");
    }

    return api.post("/appointments", {
      client_id,
      vet_id,
      service_id,
      scheduled_time,
      status,
    });
  },

  getMy: () => api.get("/appointments/my-appointments"),

  cancel: (appointment_id: string) =>
    api.delete(`/appointments/${appointment_id}`),

  updateStatus: (
    appointment_id: string,
    status: AppointmentStatus
  ) =>
    api.patch(`/appointments/${appointment_id}/status`, { status }),
};
