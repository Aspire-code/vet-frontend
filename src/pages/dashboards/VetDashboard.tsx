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

  const [services, setServices] = useState<string[]>([]); // Array of service names
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
      setAppointments([]);
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
        // Map existing service objects to string array for the UI tags
        if (Array.isArray(profileData.services)) {
          setServices(profileData.services.map((s: ServiceObject) => s.name));
        }
      }
    } catch (error) {
      console.error("Profile load error:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    loadMyProfile();
    loadAppointments();
  }, [user?.id, loadMyProfile, loadAppointments]);

  // --- HANDLERS ---

  const handleUpdateStatus = async (appointmentId: string, status: 'confirmed' | 'rejected') => {
    try {
      setUpdatingId(appointmentId);
      await VetsApi.updateAppointment(appointmentId, { status });
      await loadAppointments();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Error updating status. Please check connectivity.");
    } finally {
      setUpdatingId(null);
    }
  };

  const addService = () => {
    const trimmedService = serviceInput.trim();
    // Normalize to Sentence case to avoid "grooming" vs "Grooming" duplicates
    const formattedService = trimmedService.charAt(0).toUpperCase() + trimmedService.slice(1).toLowerCase();
    
    if (!trimmedService || services.includes(formattedService)) return;
    setServices(prev => [...prev, formattedService]);
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
      
      // The payload includes all profile info PLUS the services array
      // Your backend should use these strings to sync with the Services table
      const payload = { 
        ...info, 
        services,
        user_id: user.id 
      };

      if (isNewVet) {
        await VetsApi.createProfile(payload as any);
      } else {
        await VetsApi.updateProfile(user.id, payload);
      }
      
      await loadMyProfile();
      alert("Profile and Services updated! Clients can now see these services on your card.");
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

                    return (
                      <tr key={appt.appointment_id} className="text-sm hover:bg-gray-50 transition">
                        <td className="py-4">
                          <p className="font-bold text-gray-800">{appt.client_name || "Client"}</p>
                          <p className="text-[10px] text-indigo-400 font-bold uppercase">{appt.pet_name}</p>
                        </td>
                        <td className="py-4 text-gray-600">{appt.service_name}</td>
                        <td className="py-4 text-gray-600">{formattedDate}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              appt.status === 'confirmed' || appt.status === 'approved' ? 'bg-green-100 text-green-700' :
                              appt.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
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
            <h2 className="text-3xl font-bold text-indigo-600">Vet Profile & Services</h2>
            <span className={`px-4 py-1 text-xs font-bold rounded-full ${isNewVet ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
              {isNewVet ? "NEW PROFILE" : "LIVE ON DASHBOARD"}
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
                    className="p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 font-medium"
                    value={info[key]}
                    onChange={(e) => updateInfoField(key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          <label className="text-xs text-gray-400 mb-1 ml-1">Professional Bio</label>
          <textarea
            className="w-full p-4 border rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 font-medium"
            rows={4}
            value={info.bio}
            onChange={(e) => updateInfoField('bio', e.target.value)}
          />

          {/* DYNAMIC SERVICES SECTION */}
          <div className="mb-10 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
            <p className="font-bold text-indigo-900 mb-2">Services You Provide</p>
            <p className="text-xs text-indigo-500 mb-4">Click a service tag to remove it. Clients search for you based on these.</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {services.map((s) => (
                <button 
                  key={s} 
                  onClick={() => removeService(s)} 
                  className="px-4 py-2 text-sm rounded-full bg-white text-indigo-700 border border-indigo-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center gap-2 font-bold shadow-sm"
                >
                  {s} <span className="text-[10px]">✕</span>
                </button>
              ))}
              {services.length === 0 && <p className="text-sm text-gray-400 italic">No services added yet.</p>}
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-inner"
                placeholder="e.g. Vaccination, Grooming, Surgery..."
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addService()}
              />
              <button onClick={addService} className="px-8 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                Add
              </button>
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-lg hover:opacity-90 transition disabled:opacity-50 shadow-xl shadow-indigo-200"
          >
            {saving ? "SAVING CHANGES..." : isNewVet ? "CREATE PUBLIC PROFILE" : "UPDATE PUBLIC PROFILE"}
          </button>
        </div>
      </div>
    </div>
  );
}