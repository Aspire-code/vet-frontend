import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vetlink_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // ❌ Removed the alert/console.warn here to prevent the "No token provided" popup 
    // on public routes or during initial load.

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // This catches the 401 (Unauthorized) error seen in your console
    if (error.response?.status === 401) {
      console.error("Session expired. Cleaning up...");

      // ✅ 1. Wipe the expired token so the interceptor stops trying to use it
      localStorage.removeItem("vetlink_token");
      localStorage.removeItem("vetlink_user");

      // ✅ 2. Force a redirect to the login page
      // This stops the "Booking failed" loop and lets the user get a fresh 24h token.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;