import api from "./axios";

export const AppointmentsApi = {
  /**
   * Book an appointment
   * Matches the SQL schema: vet_id, service_id, scheduled_time
   */
  book: (data: {
    vet_id: string;
    service_id: string;
    scheduled_time: string;
    reason?: string;
    depositAmount?: number;
  }) => api.post("/appointments", data),

  /**
   * ✅ SYNCED: Matches appointmentController.ts endpoint
   */
  getMy: () => api.get("/appointments/my-appointments"),

  /**
   * Cancel an appointment
   */
  cancel: (appointment_id: string) =>
    api.delete(`/appointments/${appointment_id}`),
    
  /**
   * Update appointment status
   */
  updateStatus: (appointment_id: string, status: 'confirmed' | 'canceled' | 'completed') =>
    api.patch(`/appointments/${appointment_id}/status`, { status }),
};