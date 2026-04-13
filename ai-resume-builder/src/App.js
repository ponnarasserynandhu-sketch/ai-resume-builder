import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PublicPortfolio from "./pages/PublicPortfolio"; // Add this import
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* PROFILE ROUTE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* PUBLIC PORTFOLIO ROUTE - No authentication required */}
        <Route path="/portfolio/share/:id" element={<PublicPortfolio />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;