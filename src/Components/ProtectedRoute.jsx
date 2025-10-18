import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const customer = JSON.parse(localStorage.getItem("currentCustomer"));

  if (!customer) {
    return <Navigate to="/" replace />;
  }

  return children;
}
