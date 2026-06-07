import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage/LandingPage";
import Features from "./components/Features/Features";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CreateResume from "./pages/CreateResume";
import ViewResumes from "./pages/ViewResumes";
import EditResume from "./pages/EditResumes";
import Portfolio from "./pages/Portfolio";
import PublicPortfolio from "./pages/PublicPortfolio";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Features Page */}
        <Route 
          path="/features" 
          element={
            <>
              <Navbar />
              <Features />
              <Footer />
            </>
          } 
        />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-resume"
          element={
            <ProtectedRoute>
              <CreateResume />
            </ProtectedRoute>
          }
        />

        <Route
          path="/view-resumes"
          element={
            <ProtectedRoute>
              <ViewResumes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <EditResume />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes - Only accessible by admin users */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Public Portfolio Route - No authentication required */}
        <Route path="/portfolio/share/:id" element={<PublicPortfolio />} />

        {/* Catch all route - 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// 404 Not Found Component
function NotFound() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      flexDirection: "column",
      gap: "1rem",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
    }}>
      <h1 style={{ fontSize: "4rem", margin: 0, color: "#3b82f6" }}>404</h1>
      <h2 style={{ color: "#1e293b" }}>Page Not Found</h2>
      <p style={{ color: "#64748b" }}>The page you're looking for doesn't exist.</p>
      <a href="/" style={{
        padding: "0.75rem 1.5rem",
        background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
        color: "white",
        textDecoration: "none",
        borderRadius: "0.5rem",
        fontWeight: 600
      }}>Go to Home</a>
    </div>
  );
}

export default App;