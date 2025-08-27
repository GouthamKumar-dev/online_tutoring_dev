import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../app/store";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, role } = useSelector((state: RootState) => state.auth);
  if (token && role === "admin") return <Navigate to="/admin" replace />;
  if (token && role === "staff") return <Navigate to="/staff" replace />;
  return <>{children}</>;
};

export default PublicRoute;
