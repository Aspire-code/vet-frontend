import api from "./axios";

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
  services?: string[];
}

export interface VetProfilePayload {
  bio?: string;
  clinic_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  profile_pic_url?: string;
  services?: string[];
}

// --- UPDATED APPOINTMENT INTERFACE ---
export interface Appointment {
  appointment_id: string;
  client_name: string;
  pet_name: string;
  service_name: string;
  appointment_date: string;
  // Included both 'confirmed' and 'approved' to resolve 500 errors and UI visibility
  status: 'pending' | 'confirmed' | 'rejected' | 'approved';
}

export const VetsApi = {
  list: (params?: { q?: string; city?: string; service?: string }) =>
    api.get<Vet[]>("/vetprofile", { params }),

  getById: (vetId: string) =>
    api.get<Vet>(`/vetprofile/${vetId}`),

  getProfileById: (vetId: string) =>
    api.get<Vet | null>(`/vetprofile/${vetId}`),

  createProfile: (data: VetProfilePayload) =>
    api.post("/vetprofile", data),

  updateProfile: (vetId: string, data: VetProfilePayload) =>
    api.put(`/vetprofile/${vetId}`, data),

  getServicesByVetId: (vetId: string) =>
    api.get<{ service_id: string; name: string }[]>(
      `/vetservices/${vetId}`
    ),

  updateServices: (vetId: string, serviceIds: string[]) =>
    api.put(`/vetservices/${vetId}`, { serviceIds }),

  
  getAppointments: (vetId: string) =>
    api.get<Appointment[]>(`/appointments/vet/${vetId}`),


  updateAppointment: (
    appointmentId: string, 
    data: { status: 'confirmed' | 'rejected' | 'approved' }
  ) => api.patch(`/appointments/${appointmentId}`, data),


  deleteAppointment: (appointmentId: string) =>
    api.delete(`/appointments/${appointmentId}`),
};