import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { readSession } from "../auth/session";

export default function ProtectedRoute({ children, temporary = false, roles }: {
  children: React.ReactNode;
  temporary?: boolean;
  roles?: string[];
}) {
  const auth = useContext(AuthContext);
  const location = useLocation();
  const { claims } = readSession(localStorage);
  if (!auth?.user || !claims) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (temporary && claims.type !== "TEMP") return <Navigate to="/dashboard" replace />;
  if (!temporary && claims.type !== "ACCESS") return <Navigate to="/selecionar-organizacao" replace />;
  if (roles && !roles.includes(claims.role || "")) return <Navigate to="/dashboard" replace />;
  return children;
}
