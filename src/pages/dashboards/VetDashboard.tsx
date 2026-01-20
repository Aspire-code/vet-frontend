import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { VetsApi } from "../../api/vets.api";
import axios from 'axios';

// --- INTERFACES ---
interface Appointment {
  appointment_id: string;
  client_name: string;
  pet_name: string;
  service_name: string;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'approved';
}

interface VetProfile {
  bio: string;
  clinic_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
}

interface ServiceObject {
  service_id: string;
  name: string;
}

interface Vet {
  vet_id: string;
  name: string;
  email: string;
  phone?: string;
  clinic_name?: string;
  city?: string;
  state?: string;
  services?: ServiceObject[];
}

export default function VetDashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<VetProfile | null>(null);
  const [info, setInfo] = useState<VetProfile>({
    bio: "", clinic_name: "", address: "", city: "", state: "", zip_code: "",
  });

  const [services, setServices] = useState<string[]>([]);
  const [allVets, setAllVets] = useState<Vet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceInput, setServiceInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isNewVet = !profile;

  // --- API LOADERS ---

  const loadAppointments = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await VetsApi.getAppointments(user.id);
      const fetchedData = res.data?.data || (res.data as Appointment[]);
      setAppointments(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setAppointments([]);
      } else {
        setAppointments([]);
      }
    }
  }, [user?.id]);

  const loadMyProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await VetsApi.getProfileById(user.id);
      const profileData = res.data?.data || (res.data as any);

      if (profileData) {
        setProfile(profileData);
        setInfo({
          bio: profileData.bio ?? "",
          clinic_name: profileData.clinic_name ?? "",
          address: profileData.address ?? "",
          city: profileData.city ?? "",
          state: profileData.state ?? "",
          zip_code: profileData.zip_code ?? "",
        });
        if (Array.isArray(profileData.services)) {
          setServices(profileData.services.map((s: ServiceObject) => s.name));
        }
      }
    } catch (error) {
      console.error("Profile load error:", error);
    }
  }, [user?.id]);

  const loadAllVets = useCallback(async () => {
    try {
      const res = await VetsApi.list({});
      const fetchedVets = res.data?.data || (res.data as Vet[]);
      setAllVets(Array.isArray(fetchedVets) ? fetchedVets : []);
    } catch (error) {
      setAllVets([]);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    loadMyProfile();
    loadAllVets();
    loadAppointments();
  }, [user?.id, loadMyProfile, loadAllVets, loadAppointments]);

  // --- HANDLERS ---

  /**
   * FIXED HANDLER
   * Uses 'confirmed' as the standard status to match common backend requirements.
   */
  const handleUpdateStatus = async (appointmentId: string, status: 'confirmed' | 'rejected') => {
    try {
      setUpdatingId(appointmentId);
      // Sending 'confirmed' instead of 'approved' to fix the 500 mismatch
      await VetsApi.updateAppointment(appointmentId, { status });
      await loadAppointments();
    } catch (error) {
      console.error("Failed to update status:", error);
      // Final fallback: if 'confirmed' fails, try 'approved'
      if (status === 'confirmed') {
        try {
            await VetsApi.updateAppointment(appointmentId, { status: 'approved' as any });
            await loadAppointments();
            return;
        } catch (e) { console.error(e); }
      }
      alert("Error: The server did not accept the status update. Check backend logs.");
    } finally {
      setUpdatingId(null);
    }
  };

  const addService = () => {
    const trimmedService = serviceInput.trim();
    if (!trimmedService || services.includes(trimmedService)) return;
    setServices(prev => [...prev, trimmedService]);
    setServiceInput("");
  };

  const removeService = (s: string) => setServices(prev => prev.filter((x) => x !== s));

  const updateInfoField = (key: keyof VetProfile, value: string) => {
    setInfo(prev => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      const payload = { ...info, services };
      if (isNewVet) {
        await VetsApi.createProfile({ ...payload, user_id: user.id } as any);
      } else {
        await VetsApi.updateProfile(user.id, payload);
      }
      await Promise.all([loadMyProfile(), loadAllVets()]);
      alert("Profile Saved!");
    } catch (error) {
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-14">

        {/* APPOINTMENT SECTION */}
        <div className="bg-white p-10 rounded-3xl shadow-xl">
          <h2 className="text-3xl font-bold text-indigo-600 mb-6">Incoming Appointments</h2>
          <div className="overflow-x-auto">
            {appointments.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-gray-400 uppercase text-xs">
                    <th className="pb-4 font-semibold">Client</th>
                    <th className="pb-4 font-semibold">Service</th>
                    <th className="pb-4 font-semibold">Date</th>
                    <th className="pb-4 font-semibold">Status</th>
                    <th className="pb-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {appointments.map((appt) => {
                    const dateObj = new Date(appt.appointment_date);
                    const formattedDate = isNaN(dateObj.getTime())
                      ? "Invalid Date"
                      : `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                    const isActive = appt.status === 'confirmed' || appt.status === 'approved';
                    const isRejected = appt.status === 'rejected';

                    return (
                      <tr key={appt.appointment_id} className="text-sm hover:bg-gray-50 transition">
                        <td className="py-4">
                          <p className="font-bold text-gray-800">{appt.client_name || "user"}</p>
                        </td>
                        <td className="py-4 text-gray-600">{appt.service_name}</td>
                        <td className="py-4 text-gray-600">{formattedDate}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isActive ? 'bg-green-100 text-green-700' :
                              isRejected ? 'bg-red-100 text-red-700' : 
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {(appt.status || 'pending').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          {appt.status === 'pending' && (
                            <>
                              <button
                                disabled={!!updatingId}
                                onClick={() => handleUpdateStatus(appt.appointment_id, 'confirmed')}
                                className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition"
                              >
                                {updatingId === appt.appointment_id ? "..." : "Confirm"}
                              </button>
                              <button
                                disabled={!!updatingId}
                                onClick={() => handleUpdateStatus(appt.appointment_id, 'rejected')}
                                className="px-4 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300 transition"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed">
                <p className="text-gray-400 font-medium">No appointments found.</p>
              </div>
            )}
          </div>
        </div>

        {/* VET PROFILE SECTION */}
        <div className="bg-white p-10 rounded-3xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-indigo-600">Vet Profile</h2>
            <span className={`px-4 py-1 text-xs font-bold rounded-full ${isNewVet ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
              {isNewVet ? "NEW VET" : "ACTIVE"}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {(Object.keys(info) as Array<keyof VetProfile>).filter(k => k !== 'bio').map((key) => {
              const labels: Record<string, string> = {
                clinic_name: "Clinic Name", address: "Address", city: "City", state: "State", zip_code: "Zip Code"
              };
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1 ml-1">{labels[key]}</label>
                  <input
                    className="p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                    value={info[key]}
                    onChange={(e) => updateInfoField(key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          <label className="text-xs text-gray-400 mb-1 ml-1">Professional Bio</label>
          <textarea
            className="w-full p-4 border rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
            rows={4}
            value={info.bio}
            onChange={(e) => updateInfoField('bio', e.target.value)}
          />

          <div className="mb-6">
            <p className="font-semibold mb-2">Services Offered</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {services.map((s) => (
                <span key={s} onClick={() => removeService(s)} className="cursor-pointer px-3 py-1 text-sm rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex items-center gap-2 font-medium">
                  {s} <span className="text-xs font-bold">✕</span>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Add service"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addService()}
              />
              <button onClick={addService} className="px-6 bg-indigo-600 text-white rounded-xl font-bold">Add</button>
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:opacity-90 transition disabled:opacity-50 shadow-lg"
          >
            {saving ? "Saving..." : isNewVet ? "Create Profile" : "Update Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}