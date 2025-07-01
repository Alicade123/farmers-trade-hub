import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ element, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles.includes(user.role)) {
    return element;
  }
  return <Navigate to="/login" />;
}
