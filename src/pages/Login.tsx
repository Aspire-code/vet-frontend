import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ Auto redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "VET") {
        navigate("/dashboard/vet", { replace: true });
      } else {
        navigate("/dashboard/client", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setSubmitting(true);

      // ✅ THIS updates AuthContext FIRST
      const loggedUser = await login(form);

      // ✅ Navigate AFTER context update
      if (loggedUser.role === "VET") {
        navigate("/dashboard/vet", { replace: true });
      } else {
        navigate("/dashboard/client", { replace: true });
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <form
        onSubmit={submitForm}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Login to VetLink
        </h1>

        {error && (
          <p className="mb-4 text-center text-red-500 font-semibold">
            {error}
          </p>
        )}

        <label className="block mb-2 font-semibold">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-xl mb-4"
        />

        <label className="block mb-2 font-semibold">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-xl mb-6"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
