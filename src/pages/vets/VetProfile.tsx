import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { VetsApi } from "../../api/vets.api";

interface Vet {
  name: string;
  location: string;
  services: string[];
  phone: string;
}

export default function VetProfile(){
  const { id } = useParams();
  const [vet, setVet] = useState<Vet | null>(null);

  if (!id) return <div className="p-6">Invalid vet ID</div>;

  useEffect(()=>{
    (async()=> {
      try {
        const res = await VetsApi.getById(id);
        setVet(res.data);
      } catch (err) { alert(String(err)); }
    })();
  }, [id]);

  if(!vet) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-3xl font-bold">{vet.name}</h1>
        <p className="text-gray-600">{vet.location}</p>
        <p className="mt-4">{(vet.services || []).join(", ")}</p>
        <p className="mt-4">Phone: <a href={`tel:${vet.phone}`} className="text-blue-600">{vet.phone}</a></p>
      </div>
    </div>
  );
}
