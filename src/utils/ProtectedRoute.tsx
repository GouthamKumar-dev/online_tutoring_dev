import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../app/store";

import type { ReactNode } from "react";

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: string[];
}) => {
  const { token, role } = useSelector(
    (state: RootState) =>
      state.auth as { token: string | null; role?: string | null }
  );

  if (!token) {
    // For any protected route without authentication, show unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role!))
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
