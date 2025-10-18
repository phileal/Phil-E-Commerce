import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const admin = JSON.parse(localStorage.getItem("currentAdmin"));

  if (!admin) {
    return <Navigate to="/AdminLogin" replace />;
  }

  return children;
}
