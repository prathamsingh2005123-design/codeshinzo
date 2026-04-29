import { Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminPanel from "./pages/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Leaderboard from "./pages/Leaderboard";
import ContestList from "./pages/ContestList";
import ContestPage from "./pages/ContestPage";
import CreateContest from "./pages/CreateContest";
import { checkAuth } from "./authslice";

// ── Protected Route ──
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e2330]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ── Admin Route ──
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e2330]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <GoogleOAuthProvider clientId="119229563975-rg28o97on0qc4k68uu7j9jufcbentusl.apps.googleusercontent.com">
      <Routes>

        {/* ── PUBLIC ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── PROTECTED ── */}
        <Route path="/" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
        <Route path="/problems/:pid" element={<ProtectedRoute><ProblemPage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/contests" element={<ProtectedRoute><ContestList /></ProtectedRoute>} />
        <Route path="/contest/:id" element={<ProtectedRoute><ContestPage /></ProtectedRoute>} />

        {/* ── ADMIN ONLY ── */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/contest" element={<AdminRoute><CreateContest /></AdminRoute>} />

      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;