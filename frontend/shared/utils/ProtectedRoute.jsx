import { Navigate, Outlet } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useAuth } from "./AuthProvider";
import { AUTH_URL } from "./constants";

function ProtectedRoute({ roles = [] }) {
  const { user, isAuth, loading } = useAuth();
  
  if (loading) {
    return <CircularProgress color="secondary" />;
  }

  if (!isAuth) {
    return <Navigate to={`${AUTH_URL}/login`} />;
  }

  if (roles.length > 0) {
    const userRole = user?.access_level;
    if (!roles.includes(userRole)) {
      return <Navigate to={AUTH_URL} />
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;