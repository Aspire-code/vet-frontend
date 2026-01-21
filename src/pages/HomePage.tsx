import { useState } from "react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import VetCard from "../components/VetCard";

import { VetsApi } from "../api/vets.api"; // ✅ CORRECT API IMPORT

// Images
import AliceImg from "../assets/images/emloyee.jpg.jpg";
import SarahImg from "../assets/images/dr.jpg.jpg";
import BobImg from "../assets/images/hr.jpg.jpg";

interface Vet {
  user_id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  services?: string[];
  location?: string;
}

export default function Home() {
  const testimonials = [
    {
      name: "Alice Brown",
      role: "Client",
      message: "Finding a vet has never been easier!",
      image: AliceImg,
    },
    {
      name: "Dr. Sarah White",
      role: "Vet",
      message: "This platform helped me reach new clients.",
      image: SarahImg,
    },
    {
      name: "Bob Green",
      role: "Client",
      message: "Simple and effective.",
      image: BobImg,
    },
  ];

  const [q, setQ] = useState("");
  const [results, setResults] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (term: string) => {
    try {
      setQ(term);
      setLoading(true);
      const res = await VetsApi.list({ q: term });
      setResults(res.data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="h-[320px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col justify-center items-center px-4 text-center">
        <h1 className="text-4xl font-bold">
          Nyeri County Animal Health Services Platform
        </h1>
        <p className="mt-3 text-lg">
          Search trusted vets near you and connect instantly
        </p>

        <div className="mt-6 w-full max-w-2xl">
          <SearchBar value={q} onChange={search} />
        </div>

        <Link
          to="/register"
          className="mt-5 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold"
        >
          Get Started
        </Link>
      </section>

      {/* About Section */}
      <section className="py-12 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4 text-blue-600">
          About VetLink
        </h2>
        <p className="max-w-3xl mx-auto text-gray-700">
          VetLink connects veterinarians with clients who need expert care
          for their pets and animals across different locations.
        </p>
        <Link
          to="/about"
          className="mt-5 inline-block px-6 py-3 bg-blue-600 text-white rounded-xl"
        >
          Learn More
        </Link>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
          What Our Users Say
        </h2>

        <div className="grid md:grid-cols-3 gap-6 px-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow flex flex-col items-center"
            >
              <div className="w-24 h-24 mb-4">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover rounded-full border-4 border-blue-600"
                />
              </div>

              <p className="text-gray-700 italic text-center">
                "{t.message}"
              </p>
              <h4 className="mt-4 font-bold">{t.name}</h4>
              <p className="text-sm text-gray-500">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Results */}
      <section className="py-12 px-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">
          Quick Results
        </h2>

        <div className="space-y-4 max-w-4xl mx-auto">
          {loading && <p className="text-gray-500">Loading...</p>}

          {!loading && results.length === 0 && (
            <p className="text-gray-500">
              Search for vets by name, service, or location to see results.
            </p>
          )}

          {results.map((vet) => (
            <VetCard key={vet.user_id} vet={vet} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
