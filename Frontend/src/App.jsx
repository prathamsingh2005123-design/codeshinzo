import { Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

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
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

function App() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  /* AUTH CHECK ONLY ONCE */
useEffect(() => {
  dispatch(checkAuth());
}, [dispatch]);
  /* BLOCK UI UNTIL AUTH RESOLVES */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e2330]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId="119229563975-rg28o97on0qc4k68uu7j9jufcbentusl.apps.googleusercontent.com">

      <Routes>

        {/* PUBLIC GUARD */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/" replace />
              : <Login />
          }
        />

        <Route
          path="/signup"
          element={
            isAuthenticated
              ? <Navigate to="/" replace />
              : <Signup />
          }
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Homepage />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/admin"
          element={
            isAuthenticated
              ? <AdminPanel />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/problems/:pid"
          element={
            isAuthenticated
              ? <ProblemPage />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/leaderboard"
          element={
            isAuthenticated
              ? <Leaderboard />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/contests"
          element={
            isAuthenticated
              ? <ContestList />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/contest/:id"
          element={
            isAuthenticated
              ? <ContestPage />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/admin/contest"
          element={
            isAuthenticated
              ? <CreateContest />
              : <Navigate to="/login" replace />
          }
        />

      </Routes>

    </GoogleOAuthProvider>
  );
}

export default App;