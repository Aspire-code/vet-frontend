import { useEffect, useState } from "react";
import { VetsApi } from "../../api/vets.api";
import VetCard from "../../components/VetCard";
import SearchBar from "../../components/SearchBar";
import { useAuth } from "../../context/AuthContext";

interface Vet {
  user_id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  services?: string[];
  location?: string;
}

interface Filter {
  q?: string;
  location?: string;
}

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (filter: Filter) => {
    try {
      setLoading(true);
      setError(null);
      const res = await VetsApi.list(filter);
      setVets(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load vets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header with greeting and logout */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          {user && (
            <h2 className="text-2xl font-semibold text-blue-700">
              Hello, {user.name}!
            </h2>
          )}
          <button
            onClick={logout}
            className="mt-4 sm:mt-0 px-4 py-2 bg-red-500 text-white rounded-xl shadow hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-blue-600 text-center sm:text-left">
          Find a Vet
        </h1>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            value={q}
            onChange={(val) => {
              setQ(val);
              load({ q: val });
            }}
            className="shadow-md"
          />
        </div>

        {/* Loading & Error */}
        {loading && (
          <p className="text-gray-500 text-center my-4">Loading vets...</p>
        )}
        {error && (
          <p className="text-red-500 text-center my-4 font-medium">{error}</p>
        )}

        {/* Vet List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vets.length === 0 && !loading && !error && (
            <p className="text-gray-500 text-center col-span-full">
              No vets found. Try a different search.
            </p>
          )}

          {vets.map((v) => (
            <div
              key={v.user_id}
              className="transform hover:scale-105 transition-all duration-300"
            >
              <VetCard vet={v} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
