import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VetsApi } from "../../api/vets.api";

interface Vet {
  vet_id: string;
  name: string;
  email: string;
  phone: string;
  bio?: string;
  clinic_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  services?: string[];
  profile_pic_url?: string;
}

export default function VetDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vet, setVet] = useState<Vet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchVet = async () => {
      try {
        setLoading(true);
        const res = await VetsApi.getById(id); // id corresponds to vet_id
        setVet(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load vet details.");
      } finally {
        setLoading(false);
      }
    };

    fetchVet();
  }, [id]);

  if (loading) return <p className="text-center my-6">Loading vet details...</p>;
  if (error) return <p className="text-center my-6 text-red-500">{error}</p>;
  if (!vet) return <p className="text-center my-6">Vet not found.</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-xl"
      >
        Back
      </button>

      <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <img
            src={vet.profile_pic_url || "/default-avatar.png"}
            alt={vet.name}
            className="w-32 h-32 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{vet.name}</h2>
            {vet.clinic_name && <p className="text-gray-600 mt-1">{vet.clinic_name}</p>}
            {(vet.address || vet.city || vet.state || vet.zip_code) && (
              <p className="text-gray-600">
                {[vet.address, vet.city, vet.state, vet.zip_code].filter(Boolean).join(", ")}
              </p>
            )}
            <p className="text-gray-600 mt-1">{vet.phone}</p>
            {vet.bio && <p className="text-gray-700 mt-3">{vet.bio}</p>}

            {vet.services && vet.services.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold">Services:</h3>
                <ul className="list-disc list-inside">
                  {vet.services.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
