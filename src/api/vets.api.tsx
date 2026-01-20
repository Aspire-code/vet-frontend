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
  // This ensures the client-side code can always find the array of objects
  // needed to render the "Vaccination", "Grooming", etc. badges.
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
  // This is what the Vet sends to the backend as simple text tags
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
  /**
   * Fetches the list of Vets. 
   * The backend result for each Vet should include the joined services table
   * so that the Client Dashboard can render the badges immediately.
   */
  list: (params?: { q?: string; location?: string }) =>
    api.get<Vet[]>("/vetprofile", { params }),

  getById: (vetId: string) =>
    api.get<Vet>(`/vetprofile/${vetId}`),

  getProfileById: (vetId: string) =>
    api.get<Vet | null>(`/vetprofile/${vetId}`),

  createProfile: (data: VetProfilePayload) =>
    api.post("/vetprofile", data),

  /**
   * When the Vet updates their profile, we send the array of service strings.
   * Your backend should process these strings, ensure they exist in the 
   * 'Services' table, and update the 'VetServices' join table.
   */
  updateProfile: (vetId: string, data: VetProfilePayload) =>
    api.put(`/vetprofile/${vetId}`, data),

  syncServices: (vetId: string, services: string[]) =>
    api.post("/services/sync", { vet_id: vetId, services }),

  getAppointments: (vetId: string) =>
    api.get<Appointment[]>(`/appointments/vet/${vetId}`),

  updateAppointment: (
    appointmentId: string, 
    data: { status: 'confirmed' | 'rejected' | 'approved' }
  ) => api.patch(`/appointments/${appointmentId}`, data),

  deleteAppointment: (appointmentId: string) =>
    api.delete(`/appointments/${appointmentId}`),
};