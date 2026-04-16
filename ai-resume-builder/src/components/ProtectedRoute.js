import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  // Check if user is logged in
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Check if route requires admin access
  if (adminOnly && userRole !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default ProtectedRoute;