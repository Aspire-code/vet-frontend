import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/HomePage";
import About from "./pages/AboutPage";
import Contact from "./pages/ContactPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VetList from "./pages/vets/VetList";
import VetProfile from "./pages/vets/VetProfile";
import ClientDashboard from "./pages/dashboards/ClientDashboard";
import VetDashboard from "./pages/dashboards/VetDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
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
          <Route path="/vets" element={<VetList />} />
          <Route path="/vets/:id" element={<VetProfile />} />

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
          <Route path="*" element={<div className="p-6">Page not found</div>} />
        </Routes>
      </main>
    </div>
  );
}
