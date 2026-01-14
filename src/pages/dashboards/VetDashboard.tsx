import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { VetsApi } from "../../api/vets.api";
import axios from 'axios'; // Import axios for error checking

interface VetProfile {
    bio?: string;
    clinic_name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
}

interface ServiceObject {
    service_id: string;
    name: string;
}

interface Vet {
    vet_id: string;
    name: string;
    email: string;
    phone?: string;
    clinic_name?: string;
    city?: string;
    state?: string;
    services?: ServiceObject[]; 
}

export default function VetDashboard() {
    const { user } = useAuth();

    const [profile, setProfile] = useState<VetProfile | null>(null);
    const [info, setInfo] = useState<VetProfile>({
        bio: "",
        clinic_name: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
    });

    const [services, setServices] = useState<string[]>([]);
    const [allVets, setAllVets] = useState<Vet[]>([]);
    const [serviceInput, setServiceInput] = useState("");
    const [saving, setSaving] = useState(false);

    const isNewVet = !profile;

    const loadMyProfile = async () => {
        if (!user?.id) return;

        try {
            const res = await VetsApi.getProfileById(user.id);
            
            if (res.data) {
                setProfile(res.data);
                setInfo({
                    bio: res.data.bio || "",
                    clinic_name: res.data.clinic_name || "",
                    address: res.data.address || "",
                    city: res.data.city || "",
                    state: res.data.state || "",
                    zip_code: res.data.zip_code || "",
                }); 

                if (res.data.services && Array.isArray(res.data.services)) {
                    // Map the incoming array of {service_id, name} objects to simple strings (names)
                    setServices(res.data.services.map((s: ServiceObject) => s.name));
                } else {
                    setServices([]); // Ensure services is an empty array if none are found
                }
            }
        } catch (error) {
            // Only log an error if it's not the expected 404 (i.e., new vet)
            if (axios.isAxiosError(error) && error.response?.status !== 404) {
                 console.error("Failed to load user profile:", error);
            } else if (!axios.isAxiosError(error)) {
                 console.error("Failed to load user profile:", error);
            }
        }
    };

    const loadAllVets = async () => {
        try {
            // NOTE: The backend now returns aggregated services correctly
            const res = await VetsApi.list({}); 
            setAllVets(res.data);
        } catch (error) {
            // Gracefully handle 404 for the list endpoint (often means no vets found)
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setAllVets([]);
            } else {
                console.error("Failed to load all vets:", error);
            }
        }
    };

    useEffect(() => {
        if (!user?.id) return;
        loadMyProfile();
        loadAllVets();
    }, [user]);

    const addService = () => {
        const trimmedService = serviceInput.trim();
        if (!trimmedService) return;
        if (services.includes(trimmedService)) return; 

        setServices([...services, trimmedService]);
        setServiceInput("");
    };

    const removeService = (s: string) => {
        setServices(services.filter((x) => x !== s));
    };

    const saveProfile = async () => {
        if (!user?.id) return alert("User not logged in.");

        try {
            setSaving(true);
            
            const profileData = {
                ...info,
                services, // Send the list of service NAMES
            };

            if (isNewVet) {
                await VetsApi.createProfile({
                    ...profileData,
                    user_id: user.id,
                });
                alert("Profile created successfully!");
            } else {
                await VetsApi.updateProfile(user.id, profileData);
                alert("Profile updated successfully!");
            }

            // --- REFRESH DATA AFTER SAVE ---
            await loadMyProfile();
            await loadAllVets();
            // --- ---
        } catch (error) {
            console.error("Error saving profile:", error);
            alert(
                "Failed to save profile. Check the console for server details (likely a 500 error)."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto space-y-14">
                <div className="bg-white p-10 rounded-3xl shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-indigo-600">Vet Profile</h2>
                        <span
                            className={`px-4 py-1 text-xs font-bold rounded-full ${
                                isNewVet
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-green-100 text-green-700"
                            }`}
                        >
                            {isNewVet ? "NEW VET" : "ACTIVE"}
                        </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-6">
                        {isNewVet
                            ? "Complete your profile to appear in client searches."
                            : "Update your profile details anytime."}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[
                            ["Clinic Name", "clinic_name"],
                            ["Address", "address"],
                            ["City", "city"],
                            ["State", "state"],
                            ["Zip Code", "zip_code"],
                        ].map(([label, key]) => (
                            <input
                                key={key}
                                className="p-4 border rounded-xl"
                                placeholder={label}
                                value={(info as any)?.[key] || ""}
                                onChange={(e) =>
                                    setInfo({ ...info, [key]: e.target.value })
                                }
                            />
                        ))}
                    </div>

                    <textarea
                        className="w-full p-4 border rounded-xl mb-6"
                        placeholder="Short bio about your clinic"
                        value={info.bio || ""}
                        onChange={(e) =>
                            setInfo({ ...info, bio: e.target.value })
                        }
                    />

                    <div className="mb-6">
                        <p className="font-semibold mb-2">Services Offered</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                            {services.map((s) => (
                                <span
                                    key={s}
                                    onClick={() => removeService(s)}
                                    className="cursor-pointer px-3 py-1 text-sm rounded-full bg-indigo-100 hover:bg-indigo-200"
                                >
                                    {s} ✕
                                </span>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                className="flex-1 p-3 border rounded-xl"
                                placeholder="Add service"
                                value={serviceInput}
                                onChange={(e) => setServiceInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addService()}
                            />
                            <button
                                onClick={addService}
                                className="px-6 bg-indigo-600 text-white rounded-xl"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold"
                    >
                        {saving
                            ? "Saving..."
                            : isNewVet
                            ? "Create Profile"
                            : "Update Profile"}
                    </button>
                </div>

                <div className="bg-white p-10 rounded-3xl shadow-xl">
                    <h2 className="text-2xl font-bold text-indigo-600 mb-8">
                        All Registered Vets
                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allVets.map((v) => (
                            <div
                                key={v.vet_id}
                                className="p-6 rounded-2xl bg-gray-50 shadow hover:shadow-lg transition"
                            >
                                <h3 className="text-lg font-bold">{v.name}</h3>
                                <p className="text-sm text-gray-500">{v.email}</p>

                                <p className="mt-2 text-sm">
                                    {v.clinic_name} — {v.city}, {v.state}
                                </p>

                                {v.services?.length ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {v.services.map((service) => (
                                            <span
                                                // FIX: Use a compound key to guarantee uniqueness across the entire list
                                                key={`${v.vet_id}-${service.service_id}`} 
                                                className="px-2 py-1 text-xs rounded-full bg-white shadow"
                                            >
                                                {service.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-3">
                                        No services listed
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}