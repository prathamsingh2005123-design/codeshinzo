import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://codeshinzo-backend.onrender.com/api",
  withCredentials: true,
});

// 🔥 REQUEST INTERCEPTOR (MAIN FIX)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosClient;