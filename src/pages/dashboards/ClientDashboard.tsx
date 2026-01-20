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
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [petName, setPetName] = useState("");

  const deposit = 1000;
  const today = new Date().toISOString().split("T")[0];

  // --- NEW: CANCELLATION HANDLER ---
  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      setLoading(true);
      // Calls the delete/cancel endpoint in your AppointmentsApi
      await AppointmentsApi.cancel(appointmentId);
      alert("Appointment cancelled successfully.");
      await loadAppointments(); // Refresh the list
    } catch (err: any) {
      console.error("Cancellation Error:", err);
      alert(err.response?.data?.message || "Failed to cancel appointment.");
    } finally {
      setLoading(false);
    }
  };

  const searchVets = async () => {
    try {
      const res = await VetsApi.list({ location, q: service });
      setVets(res.data || []);
    } catch (err) {
      console.error("Failed to load vets", err);
    }
  };

  const loadAppointments = async () => {
    const token = localStorage.getItem("vetlink_token");
    if (!token) return;
    try {
      const res = await AppointmentsApi.getMy();
      const fetchedData = res.data?.data || [];
      setAppointments(fetchedData);
    } catch (err: any) {
      console.error("Failed to load appointments", err);
    }
  };

  const bookAndPay = async () => {
    if (!selectedVet || !date || !time || !petName) {
      alert("Please fill in the pet name, date, and time.");
      return;
    }

    setLoading(true);
    try {
      const userStr = localStorage.getItem("vetlink_user");
      if (!userStr) {
        alert("Please log in to book.");
        setLoading(false);
        return;
      }
      const client = JSON.parse(userStr);
      const clientId = client.id || client.user_id;
      const newAppointmentId = `APP-${Date.now()}`;
      const vetIdForDb = selectedVet.vet_id || selectedVet.user_id;

      if (!vetIdForDb) {
        alert("The selected vet does not have a valid profile ID.");
        setLoading(false);
        return;
      }

      const scheduledTime = `${date} ${time}:00.000`;

      await AppointmentsApi.book({
        appointment_id: newAppointmentId,
        client_id: clientId,
        vet_id: vetIdForDb,
        service_id: "S1",
        scheduled_time: scheduledTime,
        status: 'pending',
        pet_name: petName
      } as any);

      await PaymentsApi.createDeposit({
        client_id: clientId,
        vet_id: vetIdForDb,
        amount: deposit,
        currency: "KES",
        description: `Consultation deposit for ${petName}`,
        client_phone: client.phone || "0000000000",
        appointment_time: scheduledTime,
        appointment_id: newAppointmentId
      });

      alert("Booking Success! Your appointment is currently PENDING.");
      setSelectedVet(null);
      setPetName("");
      setDate("");
      setTime("");
      await loadAppointments();
    } catch (err: any) {
      console.error("Detailed Booking Error:", err);
      const dbError = err.response?.data?.message || "";
      if (dbError.includes("FOREIGN KEY") || dbError.includes("Vet ID")) {
        alert("Database Error: The selected Vet is not fully registered in the Profile system.");
      } else {
        alert(dbError || "Internal server error during booking");
      }
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
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">VetConnect Dashboard</h1>

      {/* SEARCH SECTION */}
      <div className="max-w-5xl mx-auto mb-10 bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row gap-4 border border-gray-200">
        <input className="border border-gray-300 rounded-lg px-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-500" placeholder="City" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input className="border border-gray-300 rounded-lg px-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-500" placeholder="Service" value={service} onChange={(e) => setService(e.target.value)} />
        <button onClick={searchVets} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition">Find Vets</button>
      </div>

      {/* VET LIST */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-14">
        {vets.map((vet) => (
          <div key={vet.vet_id || vet.user_id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{vet.name}</h2>
              <p className="text-sm text-gray-500 mb-2">📍 {vet.city || "Remote"}</p>
              <p className="text-xs text-gray-400 mb-4 italic">{vet.clinic_name || "Independent Practitioner"}</p>
            </div>
            <button onClick={() => setSelectedVet(vet)} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors">Book Now</button>
          </div>
        ))}
      </div>

      {/* MY APPOINTMENTS */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">My Appointments</h2>
        <div className="grid gap-4">
          {appointments.length > 0 ? appointments.map((a) => (
            <div key={a.appointment_id} className="bg-white rounded-xl p-5 border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-6">
                <div>
                  <p className="font-bold text-blue-600">{a.service_name || "Consultation"}</p>
                  <p className="text-sm text-gray-600 font-medium">Vet: {a.vet_name}</p>
                  <p className="text-xs text-gray-400">{new Date(a.scheduled_time).toLocaleString()}</p>
                  {a.pet_name && <p className="text-[10px] text-indigo-400 uppercase mt-1">Pet: {a.pet_name}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  a.status === 'confirmed' || a.status === 'approved' ? 'bg-green-100 text-green-700' : 
                  a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  {a.status}
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2">
                {a.status === 'pending' && (
                  <button 
                    onClick={() => handleCancelAppointment(a.appointment_id)}
                    disabled={loading}
                    className="text-xs font-bold text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )) : <p className="text-gray-400 italic">No appointments found.</p>}
        </div>
      </div>

      {/* BOOKING MODAL */}
      {selectedVet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-1">Book with {selectedVet.name}</h2>
            <p className="text-sm text-gray-500 mb-6">Booking Fee: KES {deposit.toLocaleString()}</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Pet Name</label>
                <input type="text" placeholder="e.g. Buddy" className="border rounded-lg px-4 py-3 w-full mt-1 outline-none focus:ring-2 focus:ring-blue-500" value={petName} onChange={(e) => setPetName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                  <input type="date" className="border rounded-lg px-4 py-3 w-full mt-1 outline-none focus:ring-2 focus:ring-blue-500" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Time</label>
                  <input type="time" className="border rounded-lg px-4 py-3 w-full mt-1 outline-none focus:ring-2 focus:ring-blue-500" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button disabled={loading} onClick={() => setSelectedVet(null)} className="flex-1 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition">Close</button>
              <button disabled={loading} onClick={bookAndPay} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                {loading ? "Processing..." : "Pay & Book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}