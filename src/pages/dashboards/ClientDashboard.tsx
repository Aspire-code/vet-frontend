import { useEffect, useState } from "react";
import { VetsApi } from "../../api/vets.api";
import { AppointmentsApi } from "../../api/appointments.api";
import { PaymentsApi } from "../../api/payments.api";

export default function ClientDashboard() {
  const [vets, setVets] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");

  const [selectedVet, setSelectedVet] = useState<any>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const deposit = 1000;
  const today = new Date().toISOString().split("T")[0];

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
    if (!token) {
      console.warn("No token found, skipping appointment fetch.");
      return;
    }

    try {
      const res = await AppointmentsApi.getMy();
      // ✅ SYNC: Handle the { data: appointments } structure from your controller
      const fetchedData = res.data?.data || []; 
      setAppointments(fetchedData);
    } catch (err: any) {
      console.error("Failed to load appointments", err);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await AppointmentsApi.cancel(appointmentId);
      await loadAppointments(); 
    } catch (err) {
      alert("Failed to cancel appointment");
    }
  };

  const bookAndPay = async () => {
    if (!selectedVet || !date) return;

    if (date < today) {
      alert("Please select a current or future date.");
      return;
    }

    try {
      // ✅ UUID SYNC: Use vet_id or user_id for database consistency
      const vetId = selectedVet.vet_id || selectedVet.user_id;
      const scheduled_time = `${date} ${time || "09:00:00"}`;

      const booking = await AppointmentsApi.book({
        vet_id: vetId, 
        service_id: "S1",            
        scheduled_time,
        reason: "Consultation",
        depositAmount: deposit,
      });

      // ✅ Use the returned appointment_id for the payment reference
      const appointmentId = booking.data?.appointment_id || booking.data?.data?.appointment_id;

      await PaymentsApi.payDeposit({
        appointmentId: appointmentId, 
        amount: deposit,
        method: "mpesa",
      });

      setSelectedVet(null);
      setDate("");
      setTime("");
      
      await loadAppointments(); 
      alert("Success! Your appointment is confirmed.");
    } catch (err: any) {
      console.error("Booking failed", err);
      const msg = err.response?.data?.message || "Booking failed. Please check your connection.";
      alert(msg);
    }
  };

  useEffect(() => {
    searchVets();
    loadAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
        VetConnect Dashboard
      </h1>

      {/* SEARCH SECTION */}
      <div className="max-w-5xl mx-auto mb-10 bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row gap-4 border border-gray-200">
        <input
          className="border border-gray-300 rounded-lg px-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="City (e.g. Nairobi)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          className="border border-gray-300 rounded-lg px-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Service (e.g. Vaccination)"
          value={service}
          onChange={(e) => setService(e.target.value)}
        />
        <button
          onClick={searchVets}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition"
        >
          Find Vets
        </button>
      </div>

      {/* VET LIST */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-14">
        {vets.map((vet) => (
          <div key={vet.vet_id || vet.user_id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">{vet.name}</h2>
            <p className="text-sm text-gray-500 mb-2">📍 {vet.city || "Remote"}</p>
            <p className="text-sm text-gray-600 italic mb-4 line-clamp-2">{vet.bio}</p>
            <button
              onClick={() => setSelectedVet(vet)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition"
            >
              Book Now
            </button>
          </div>
        ))}
      </div>

      {/* MY APPOINTMENTS SECTION - Connected to Database Rows */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">My Appointments</h2>
        {appointments.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No upcoming appointments found in the database.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((a) => (
              <div key={a.appointment_id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  {/* ✅ UI SYNC: Rendering data from SQL table columns */}
                  <p className="font-bold text-blue-600">{a.service_name || a.service || "General Consultation"}</p>
                  <p className="text-sm text-gray-600">Vet: <span className="font-medium">{a.vet_name || "Assigned Vet"}</span></p>
                  <p className="text-xs text-gray-400">
                    {/* Format the DATETIME from the database */}
                    {new Date(a.scheduled_time || `${a.date} ${a.time}`).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                    a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {a.status}
                  </span>
                  {a.status !== 'canceled' && (
                    <button 
                      onClick={() => handleCancel(a.appointment_id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {selectedVet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Confirm Booking</h2>
            <p className="text-gray-500 mb-6">With {selectedVet.name}</p>
            <div className="space-y-4">
              <input 
                type="date" 
                className="border rounded-lg px-4 py-3 w-full mt-1" 
                value={date} 
                min={today}
                onChange={(e) => setDate(e.target.value)} 
              />
              <input 
                type="time" 
                className="border rounded-lg px-4 py-3 w-full mt-1" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
              />
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setSelectedVet(null)} className="flex-1 border border-gray-300 rounded-lg py-3">Back</button>
              <button onClick={bookAndPay} className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-bold">Pay & Book</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}