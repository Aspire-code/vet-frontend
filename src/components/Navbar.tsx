import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };                   

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition"
        >
          VetLink
        </Link>

        {/* Center Links */}
        <div className="flex-1 flex justify-center gap-6">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-semibold transition"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-blue-600 hover:text-blue-800 font-semibold transition"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-blue-600 hover:text-blue-800 font-semibold transition"
          >
            Contact
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-blue-600 font-medium">
                Hello, {user.name}!
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-red-500 text-red-500 rounded-xl hover:bg-red-50 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
