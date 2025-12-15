import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthApi } from "../api/auth.api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CLIENT", // Uppercase to match backend
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await AuthApi.register(form);

      // Redirect to login page after successful registration
      navigate("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error registering user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <form
        onSubmit={submitForm}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Create VetLink Account
        </h1>

        {error && (
          <p className="mb-4 text-center text-red-500 font-semibold">{error}</p>
        )}

        {/* Name */}
        <label className="block mb-2 font-semibold">Full Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-xl mb-4 focus:outline-blue-600"
          placeholder="Enter your full name"
        />

        {/* Email */}
        <label className="block mb-2 font-semibold">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-xl mb-4 focus:outline-blue-600"
          placeholder="Enter email address"
        />

        {/* Phone */}
        <label className="block mb-2 font-semibold">Phone Number</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-xl mb-4 focus:outline-blue-600"
          placeholder="+254 700 000000"
        />

        {/* Role */}
        <label className="block mb-2 font-semibold">Register As</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-3 border rounded-xl mb-4 focus:outline-blue-600"
        >
          <option value="CLIENT">Client</option>
          <option value="VET">Veterinarian (Vet)</option>
        </select>

        {/* Password */}
        <label className="block mb-2 font-semibold">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-xl mb-6 focus:outline-blue-600"
          placeholder="Create a password"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
