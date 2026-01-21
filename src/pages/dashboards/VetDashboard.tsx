import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { VetsApi } from "../../api/vets.api";

// --- INTERFACES ---
interface Appointment {
  appointment_id: string; client_name: string; pet_name: string;
  service_name: string; appointment_date: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'approved';
}
interface VetProfile { bio: string; clinic_name: string; address: string; city: string; state: string; zip_code: string; }
interface ServiceObject { service_id: string; name: string; }
interface Vet { vet_id: string; name: string; email: string; phone?: string; clinic_name?: string; city?: string; state?: string; services?: ServiceObject[]; }

export default function VetDashboard() {
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'profile' | 'directory' | 'settings'>('overview');

  // --- EXISTING STATE ---
  const [profile, setProfile] = useState<VetProfile | null>(null);
  const [info, setInfo] = useState<VetProfile>({ bio: "", clinic_name: "", address: "", city: "", state: "", zip_code: "" });
  const [services, setServices] = useState<string[]>([]);
  const [allVets, setAllVets] = useState<Vet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceInput, setServiceInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isNewVet = !profile;

  // --- DERIVED STATS ---
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed' || a.status === 'approved').length,
    };
  }, [appointments]);

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
          bio: profileData.bio ?? "", clinic_name: profileData.clinic_name ?? "",
          address: profileData.address ?? "", city: profileData.city ?? "",
          state: profileData.state ?? "", zip_code: profileData.zip_code ?? "",
        });
        setServices(Array.isArray(profileData.services) ? profileData.services.map((s: ServiceObject) => s.name) : []);
      }
    } catch (error) {}
  }, [user?.id]);

  const loadAllVets = useCallback(async () => {
    try {
      const res = await VetsApi.list({});
      const fetchedVets = res.data?.data || (res.data as Vet[]);
      setAllVets(Array.isArray(fetchedVets) ? fetchedVets : []);
    } catch (error) {}
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    loadMyProfile(); loadAllVets(); loadAppointments();
  }, [user?.id, loadMyProfile, loadAllVets, loadAppointments]);

  // --- HANDLERS ---
  const handleUpdateStatus = async (appointmentId: string, status: 'approved' | 'rejected') => {
    try {
      setUpdatingId(appointmentId);
      const finalStatus = status === 'approved' ? 'confirmed' : 'rejected';
      await VetsApi.updateAppointment(appointmentId, { status: finalStatus });
      await loadAppointments();
    } catch (error: any) {
      console.error("Update failed:", error.response?.data || error.message);
      alert(`Update failed: ${error.response?.data?.message || "Check backend console"}`);
    } finally { 
      setUpdatingId(null); 
    }
  };

  const addService = () => {
    const trimmed = serviceInput.trim();
    if (!trimmed || services.includes(trimmed)) return;
    setServices(prev => [...prev, trimmed]);
    setServiceInput("");
  };

  const removeService = (s: string) => setServices(prev => prev.filter(x => x !== s));
  const updateInfoField = (key: keyof VetProfile, value: string) => setInfo(prev => ({ ...prev, [key]: value }));

  const saveProfile = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      const payload = { ...info, services };
      if (isNewVet) await VetsApi.createProfile({ ...payload, user_id: user.id } as any);
      else await VetsApi.updateProfile(user.id, payload);
      alert("Success!");
      await loadMyProfile();
      setActiveTab('overview');
    } catch (error) { alert("Failed to save."); } finally { setSaving(false); }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-900">
      
      {/* VERTICAL SIDEBAR */}
      <aside className="w-72 bg-[#3d2b1f] flex flex-col fixed h-full z-20 shadow-2xl">
        <div className="p-8 mb-4">
          <h1 className="text-2xl font-black text-amber-50 tracking-tighter">VETLINK<span className="text-amber-500">.</span></h1>
          <p className="text-[10px] font-bold text-amber-200/40 tracking-widest mt-1 uppercase">Portal Management</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'requests', label: 'Appointments' },
            { id: 'profile', label: 'My Profile' },
            { id: 'directory', label: 'Vet Network' },
            { id: 'settings', label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? 'bg-amber-500 text-[#3d2b1f] shadow-lg shadow-black/20' 
                : 'text-amber-100/50 hover:bg-white/5 hover:text-amber-50'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="bg-white/5 p-4 rounded-2xl mb-4 border border-white/5">
            <p className="text-xs font-black text-amber-50 truncate">{user?.name || "Dr. Administrator"}</p>
            <p className="text-[9px] font-bold text-amber-200/30 uppercase tracking-tighter">Verified Provider</p>
          </div>
          <button 
            onClick={logout}
            className="w-full py-3 text-xs font-black text-rose-300 bg-rose-500/10 rounded-xl hover:bg-rose-500/20 transition-all uppercase tracking-widest"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-12 bg-[#F8FAFC]">

        {/* TAB 0: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Overview</h2>
              <p className="text-slate-400 font-medium mt-1">Snapshot of your clinical operations.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Bookings</p>
                <p className="text-5xl font-black text-slate-900">{stats.total}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">Pending</p>
                <p className="text-5xl font-black text-slate-900">{stats.pending}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Confirmed</p>
                <p className="text-5xl font-black text-slate-900">{stats.confirmed}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: REQUESTS */}
        {activeTab === 'requests' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="mb-10 flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Appointments</h2>
                <p className="text-slate-400 font-medium mt-1">Process and review your incoming visits.</p>
              </div>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                {appointments.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-10 py-6">Patient</th>
                        <th className="px-10 py-6">Service</th>
                        <th className="px-10 py-6">Date</th>
                        <th className="px-10 py-6">Status</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {appointments.map((appt) => (
                        <tr key={appt.appointment_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6">
                            <div className="font-bold text-slate-800">{appt.client_name || "Guest"}</div>
                            <div className="text-[10px] font-black text-indigo-500 uppercase">{appt.pet_name}</div>
                          </td>
                          <td className="px-10 py-6">
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">{appt.service_name}</span>
                          </td>
                          <td className="px-10 py-6 text-sm font-medium text-slate-400">
                            {new Date(appt.appointment_date).toLocaleDateString()}
                          </td>
                          <td className="px-10 py-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              appt.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                              appt.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 
                              'bg-emerald-100 text-emerald-600'
                            }`}>{appt.status}</span>
                          </td>
                          <td className="px-10 py-6 text-right space-x-2">
                            {appt.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(appt.appointment_id, 'approved')} 
                                  disabled={updatingId === appt.appointment_id}
                                  className="text-[10px] font-black text-emerald-600 uppercase hover:underline disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(appt.appointment_id, 'rejected')} 
                                  disabled={updatingId === appt.appointment_id}
                                  className="text-[10px] font-black text-rose-600 uppercase hover:underline disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-24 text-center font-black text-slate-300 uppercase tracking-widest">No Records Found</div>
                )}
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-right-4 duration-500">
             <header className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Clinic Profile</h2>
              <p className="text-slate-400 font-medium mt-1">Maintain your professional clinical presence.</p>
            </header>
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="grid grid-cols-2 gap-8 mb-10">
                {(['clinic_name', 'address', 'city', 'state', 'zip_code'] as const).map(key => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{key.replace('_', ' ')}</label>
                    <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-100" value={info[key]} onChange={(e) => updateInfoField(key, e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="space-y-2 mb-10">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio</label>
                <textarea className="w-full p-6 bg-slate-50 border-none rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-indigo-100" rows={4} value={info.bio} onChange={(e) => updateInfoField('bio', e.target.value)} />
              </div>

              {/* SERVICE MANAGEMENT */}
              <div className="space-y-4 mb-10 p-8 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Offered Services</label>
                
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="e.g. Vaccination, Surgery..."
                    className="flex-1 p-4 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-200"
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addService()}
                  />
                  <button 
                    onClick={addService}
                    className="px-6 bg-amber-500 text-[#3d2b1f] font-black rounded-xl text-xs uppercase tracking-widest hover:bg-amber-400 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {services.map((s) => (
                    <div key={s} className="group flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm hover:border-rose-200 transition-all">
                      <span className="text-xs font-bold text-slate-700">{s}</span>
                      <button 
                        onClick={() => removeService(s)}
                        className="text-slate-300 group-hover:text-rose-500 font-black text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic">No services listed yet.</p>
                  )}
                </div>
              </div>

              <button onClick={saveProfile} disabled={saving} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100">
                {saving ? "Processing..." : "Commit Changes"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: DIRECTORY */}
        {activeTab === 'directory' && (
           <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="mb-10">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Vet Network</h2>
              </header>
              <div className="grid grid-cols-3 gap-8">
                {allVets.map(v => (
                  <div key={v.vet_id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-800">{v.name}</h3>
                      <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-2">{v.clinic_name || 'Individual'}</p>
                      <p className="text-xs text-slate-400 mt-1">{v.city}, {v.state}</p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-1 border-t border-slate-50 pt-4">
                      {v.services?.map(s => (
                        <span key={s.service_id} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded uppercase tracking-tighter">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}

        {/* TAB 4: SETTINGS - NEWLY ADDED CONTENT */}
        {activeTab === 'settings' && (
           <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl">
              <header className="mb-10">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Settings</h2>
                <p className="text-slate-400 font-medium mt-1">Manage account security and portal preferences.</p>
              </header>

              <div className="grid grid-cols-1 gap-6">
                {/* SECURITY BOX */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-amber-100 rounded-2xl text-xl">🔐</div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800">Security & Privacy</h3>
                      <p className="text-xs text-slate-400 font-medium">Protect your clinical data access.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold text-slate-700">Two-Factor Authentication</p>
                        <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Recommended</p>
                      </div>
                      <button className="px-4 py-2 bg-white border border-slate-200 text-[10px] font-black uppercase rounded-xl hover:bg-slate-100 transition-all">Enable</button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold text-slate-700">Password Update</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Last changed: 2 months ago</p>
                      </div>
                      <button className="px-4 py-2 bg-white border border-slate-200 text-[10px] font-black uppercase rounded-xl hover:bg-slate-100 transition-all">Change</button>
                    </div>
                  </div>
                </div>

                {/* NOTIFICATIONS BOX */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-indigo-100 rounded-2xl text-xl">🔔</div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800">Alert Preferences</h3>
                      <p className="text-xs text-slate-400 font-medium">Control how you get appointment updates.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-xs font-bold text-slate-600">Email Notifications</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-xs font-bold text-slate-600">SMS Appointment Alerts</span>
                    </label>
                  </div>
                </div>

                {/* SYSTEM STATUS */}
                <div className="bg-[#3d2b1f] p-8 rounded-[2.5rem] text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black tracking-tight">Portal Health</h3>
                      <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">All Systems Operational</p>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-1.5 h-6 bg-emerald-400 rounded-full opacity-80 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
           </div>
        )}

      </main>
    </div>
  );
}