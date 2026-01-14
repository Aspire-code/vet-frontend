import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // ✅ ADD THIS
import Navbar from "./components/Navbar";
import Home from "./pages/HomePage";
import About from "./pages/AboutPage";
import Contact from "./pages/ContactPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VetList from "./pages/vets/VetList";
import VetDetails from "./pages/vets/VetDetails";
import ClientDashboard from "./pages/dashboards/ClientDashboard";
import VetDashboard from "./pages/dashboards/VetDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { loading } = useAuth(); // ✅ ADD THIS

  // ✅ BLOCK rendering until auth is hydrated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Vet pages */}
          <Route path="/vets" element={<VetList />} />
          <Route path="/vets/:id" element={<VetDetails />} />

          {/* Protected dashboards */}
          <Route
            path="/dashboard/client"
            element={
              <ProtectedRoute role="CLIENT">
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/vet"
            element={
              <ProtectedRoute role="VET">
                <VetDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="p-6 text-center text-red-500 font-semibold">
                Page not found
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
