import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { VetsApi } from "../../api/vets.api";

interface Vet {
  user_id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  services?: string[];
}

export default function VetDashboard() {
  const { user, logout, setUser } = useAuth();

  // Form for updating own profile
  const [info, setInfo] = useState({
    phone: user?.phone || "",
    location: user?.location || "",
  });

  const [serviceInput, setServiceInput] = useState("");
  const [services, setServices] = useState<string[]>(user?.services || []);
  const [saving, setSaving] = useState(false);

  // All vets directory
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all vets
  const loadVets = async () => {
    try {
      setLoading(true);
      const res = await VetsApi.list({});
      setVets(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load vets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVets();
  }, []);

  // Add a new service to own profile
  const addService = () => {
    if (serviceInput.trim() && !services.includes(serviceInput.trim())) {
      setServices([...services, serviceInput.trim()]);
      setServiceInput("");
    }
  };

  const removeService = (s: string) => {
    setServices(services.filter((svc) => svc !== s));
  };

  // Save profile update
  const updateProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        services,
        phone: info.phone,
        location: info.location,
      };
      const res = await VetsApi.updateProfile(user!.user_id, payload);

      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem("vetlink_user", JSON.stringify(updatedUser));
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-700">Vet Dashboard</h1>
          <button
            onClick={logout}
            className="px-5 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Greeting & Profile Update */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl space-y-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Hello, {user?.name}!</h2>

          <div className="space-y-4">
            {/* Phone */}
            <label className="block">
              <div className="text-sm text-gray-500 mb-2">Phone</div>
              <input
                type="text"
                placeholder="+1 234 567 890"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={info.phone}
                onChange={(e) => setInfo({ ...info, phone: e.target.value })}
              />
            </label>

            {/* Location */}
            <label className="block">
              <div className="text-sm text-gray-500 mb-2">Location</div>
              <input
                type="text"
                placeholder="City, State, Country"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={info.location}
                onChange={(e) => setInfo({ ...info, location: e.target.value })}
              />
            </label>

            {/* Services as tags */}
            <div>
              <div className="text-sm text-gray-500 mb-2">Services</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {services.map((s) => (
                  <span
                    key={s}
                    className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-300"
                    onClick={() => removeService(s)}
                  >
                    {s} &times;
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 p-4 border rounded-xl focus:ring-2 focus:ring-blue-400"
                  placeholder="Add a service"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
                />
                <button
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition"
                  onClick={addService}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              className={`w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={updateProfile}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        {/* Vet Directory */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl space-y-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">All Vets</h2>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vets.map((v) => (
              <div key={v.user_id} className="bg-gradient-to-tr from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-105">
                <h3 className="text-xl font-bold text-purple-700">{v.name}</h3>
                <p className="text-sm text-gray-700">Role: {v.role}</p>
                {v.location && <p className="text-sm text-gray-700">Location: {v.location}</p>}
                <p className="text-sm text-gray-700">Email: {v.email}</p>
                {v.phone && <p className="text-sm text-gray-700">Phone: {v.phone}</p>}
                {v.services && v.services.length > 0 && <p className="text-sm text-gray-700 mt-2 truncate">Services: {v.services.join(", ")}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
