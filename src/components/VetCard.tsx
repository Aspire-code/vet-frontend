interface Vet {
  vet_id: string;         // Unique ID
  name: string;
  email: string;
  phone: string;
  services?: string[];
  location?: string;
  profile_pic_url?: string; // Optional profile picture
}

export default function VetCard({ vet }: { vet: Vet }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex gap-4 items-center">
      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {vet.profile_pic_url ? (
          <img
            src={vet.profile_pic_url}
            alt={vet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xl text-gray-500">
            {vet.name
              ? vet.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
              : "V"}
          </span>
        )}
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-semibold">{vet.name}</h2>
        <p className="text-sm text-gray-600">{vet.location || "Location not set"}</p>
        <p className="text-sm text-gray-700 mt-1">
          {(vet.services || []).slice(0, 3).join(", ")}
        </p>

        <div className="flex gap-3 mt-3">
          <a
            href={`tel:${vet.phone}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl"
          >
            Call
          </a>
          <a
            href={`https://wa.me/${vet.phone?.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-green-600 text-white rounded-xl"
          >
            WhatsApp
          </a>
          <a
            href={`/vets/${vet.vet_id}`}  // <-- Use vet_id for full details
            className="px-4 py-2 border rounded-xl"
          >
            View
          </a>
        </div>
      </div>
    </div>
  );
}
