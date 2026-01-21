import api from "./axios";

export interface ServiceObject {
  service_id: string;
  name: string;
}

export interface Vet {
  vet_id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  clinic_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  profile_pic_url?: string;
  services?: ServiceObject[]; 
}

export interface VetProfilePayload {
  user_id?: string; 
  bio?: string;
  clinic_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  profile_pic_url?: string;
  services?: string[]; 
}

export interface Appointment {
  appointment_id: string;
  client_name: string;
  pet_name: string;
  service_name: string;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'approved';
}

export const VetsApi = {
  list: (params?: { q?: string; location?: string }) =>
    api.get<Vet[]>("/vetprofile", { params }),

  getById: (vetId: string) =>
    api.get<Vet>(`/vetprofile/${vetId}`),

  getProfileById: (vetId: string) =>
    api.get<Vet | null>(`/vetprofile/${vetId}`),

  createProfile: (data: VetProfilePayload) =>
    api.post("/vetprofile", data),

  updateProfile: (vetId: string, data: VetProfilePayload) =>
    api.put(`/vetprofile/${vetId}`, data),

  syncServices: (vetId: string, services: string[]) =>
    api.post("/services/sync", { vet_id: vetId, services }),

  getAppointments: (vetId: string) =>
    api.get<Appointment[]>(`/appointments/vet/${vetId}`),

  /**
   * FINAL FIX: Matches your backend router perfectly.
   * Method: PUT
   * Path: /appointments/:appointmentId/status
   */
  updateAppointment: (
    appointmentId: string, 
    data: { status: 'confirmed' | 'rejected' | 'approved' }
  ) => api.put(`/appointments/${appointmentId}/status`, data),

  deleteAppointment: (appointmentId: string) =>
    api.delete(`/appointments/${appointmentId}`),
};