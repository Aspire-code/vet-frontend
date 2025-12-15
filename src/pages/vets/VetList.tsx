import { useEffect, useState } from "react";
import VetCard from "../../components/VetCard";
import { VetsApi } from "../../api/vets.api";
import SearchBar from "../../components/SearchBar";

interface Vet {
  user_id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  services?: string[];
  location?: string;
}

export default function VetList() {
  const [q, setQ] = useState("");
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async (filter: { q?: string; location?: string } = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await VetsApi.list(filter);
      setVets(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load vets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({});
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">All Vets</h1>

      <div className="mb-4">
        <SearchBar
          value={q}
          onChange={(val: string) => {
            setQ(val);
            load({ q: val });
          }}
        />
      </div>

      {loading && <p className="text-gray-500">Loading vets...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && vets.length === 0 && (
        <p className="text-gray-500">No vets found. Try another search.</p>
      )}

      <div className="space-y-4">
        {vets.map((v) => (
          <VetCard vet={v} key={v.user_id} />
        ))}
      </div>
    </div>
  );
}
