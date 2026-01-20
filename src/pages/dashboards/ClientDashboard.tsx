import { useEffect, useState } from "react";
import { VetsApi } from "../../api/vets.api";
import { AppointmentsApi } from "../../api/appointments.api";
import { PaymentsApi } from "../../api/payments.api";

export default function ClientDashboard() {
  const [vets, setVets] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedVet, setSelectedVet] = useState<any>(null);
  // NEW: State to track which specific service from the vet is chosen
  const [selectedService, setSelectedService] = useState<any>(null); 
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [petName, setPetName] = useState("");

  const deposit = 1000;
  const today = new Date().toISOString().split("T")[0];

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      setLoading(true);
      await AppointmentsApi.cancel(appointmentId);
      alert("Appointment cancelled successfully.");
      await loadAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel appointment.");
    } finally {
      setLoading(false);
    }
  };

  const searchVets = async () => {
    try {
      const res = await VetsApi.list({ location, q: service });
      const data = res.data?.data || res.data;
      setVets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load vets", err);
    }
  };

  const loadAppointments = async () => {
    const token = localStorage.getItem("vetlink_token");
    if (!token) return;
    try {
      const res = await AppointmentsApi.getMy();
      setAppointments(res.data?.data || []);
    } catch (err: any) {
      console.error("Failed to load appointments", err);
    }
  };

  const bookAndPay = async () => {
    // UPDATED: Include selectedService in validation
    if (!selectedVet || !date || !time || !petName || !selectedService) {
      alert("Please fill in the pet name, date, time, and select a service.");
      return;
    }

    setLoading(true);
    try {
      const userStr = localStorage.getItem("vetlink_user");
      if (!userStr) return;
      
      const client = JSON.parse(userStr);
      const clientId = client.id || client.user_id;
      const newAppointmentId = `APP-${Date.now()}`;
      const vetIdForDb = selectedVet.vet_id || selectedVet.user_id;

      const scheduledTime = `${date} ${time}:00.000`;

      await AppointmentsApi.book({
        appointment_id: newAppointmentId,
        client_id: clientId,
        vet_id: vetIdForDb,
        // UPDATED: Use the actual service ID and name selected by the user
        service_id: selectedService.service_id || "S1", 
        service_name: selectedService.name, 
        scheduled_time: scheduledTime,
        status: 'pending',
        pet_name: petName
      } as any);

      await PaymentsApi.createDeposit({
        client_id: clientId,
        vet_id: vetIdForDb,
        amount: deposit,
        currency: "KES",
        description: `${selectedService.name} deposit for ${petName}`,
        client_phone: client.phone || "0000000000",
        appointment_time: scheduledTime,
        appointment_id: newAppointmentId
      });

      alert(`Success! ${selectedService.name} is now PENDING.`);
      setSelectedVet(null);
      setSelectedService(null);
      setPetName("");
      setDate("");
      setTime("");
      await loadAppointments();
    } catch (err: any) {
      alert("Booking Error: Ensure the Vet has a completed profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchVets();
    loadAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-10 text-gray-900">VetConnect</h1>

        {/* SEARCH SECTION */}
        <div className="mb-12 bg-white rounded-[2rem] shadow-sm p-8 flex flex-col md:flex-row gap-4 border border-gray-100">
          <input className="bg-gray-50 rounded-2xl px-6 py-4 w-full outline-none focus:ring-2 focus:ring-blue-500 font-medium" placeholder="City (e.g. Nyeri)" value={location} onChange={(e) => setLocation(e.target.value)} />
          <input className="bg-gray-50 rounded-2xl px-6 py-4 w-full outline-none focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Service (e.g. Surgery)" value={service} onChange={(e) => setService(e.target.value)} />
          <button onClick={searchVets} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-lg shadow-blue-100">Search</button>
        </div>

        {/* VET LIST */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {vets.map((vet) => (
            <div key={vet.vet_id || vet.user_id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all group">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{vet.name}</h2>
                <p className="text-sm font-bold text-pink-500 mb-1 flex items-center">
                  <span className="mr-1">📍</span> {vet.city || "Nyeri"}
                </p>
                <p className="text-sm text-gray-400 italic mb-6">{vet.clinic_name || "Muthui Vets Limited"}</p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {vet.services && vet.services.length > 0 ? (
                    vet.services.map((s: any) => (
                      <span key={s.service_id || s} className="bg-blue-50 text-blue-600 text-[11px] px-4 py-1.5 rounded-full font-bold border border-blue-100">
                        {s.name || s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-gray-300">General Consultation</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedVet(vet)} 
                className="w-full bg-[#00a63e] hover:bg-[#008f35] text-white py-4 rounded-2xl font-bold text-lg transition-transform active:scale-95"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>

        {/* MY APPOINTMENTS */}
        <div className="max-w-4xl">
          <h2 className="text-2xl font-black mb-8 text-gray-900 flex items-center">
            My Appointments <span className="ml-3 bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">{appointments.length}</span>
          </h2>
          <div className="space-y-4">
            {appointments.length > 0 ? appointments.map((a) => (
              <div key={a.appointment_id} className="bg-white rounded-[2rem] p-6 border border-gray-50 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 font-bold">
                    {a.pet_name?.charAt(0) || "P"}
                  </div>
                  <div>
                    {/* UPDATED: This now correctly reflects the service name saved during booking */}
                    <p className="font-bold text-gray-900">{a.service_name || "Checkup"}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Vet: {a.vet_name}</p>
                    <p className="text-[11px] text-blue-500 mt-1">{new Date(a.scheduled_time).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    a.status === 'confirmed' || a.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    a.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {a.status}
                  </span>
                  {a.status === 'pending' && (
                    <button onClick={() => handleCancelAppointment(a.appointment_id)} className="p-2 hover:bg-red-50 rounded-xl transition-colors">
                      ❌
                    </button>
                  )}
                </div>
              </div>
            )) : (
              <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold">No upcoming visits.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      {selectedVet && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Book Visit</h2>
            <p className="text-sm text-gray-400 mb-8 font-medium">With {selectedVet.name}</p>
            
            <div className="space-y-6">
              {/* NEW: SERVICE SELECTION DROPDOWN */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Choose Service</label>
                <select 
                  className="bg-gray-50 rounded-2xl px-5 py-4 w-full mt-1 outline-none focus:ring-2 focus:ring-blue-500 font-bold appearance-none cursor-pointer"
                  value={selectedService ? JSON.stringify(selectedService) : ""}
                  onChange={(e) => setSelectedService(JSON.parse(e.target.value))}
                >
                  <option value="" disabled>-- Select a service --</option>
                  {selectedVet.services?.map((s: any) => (
                    <option key={s.service_id || s} value={JSON.stringify(s)}>
                      {s.name || s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pet Name</label>
                <input type="text" className="bg-gray-50 rounded-2xl px-5 py-4 w-full mt-1 outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={petName} onChange={(e) => setPetName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                  <input type="date" className="bg-gray-50 rounded-2xl px-5 py-4 w-full mt-1 outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Time</label>
                  <input type="time" className="bg-gray-50 rounded-2xl px-5 py-4 w-full mt-1 outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={() => { setSelectedVet(null); setSelectedService(null); }} className="flex-1 text-gray-400 font-bold py-4">Cancel</button>
              <button disabled={loading} onClick={bookAndPay} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform">
                {loading ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}