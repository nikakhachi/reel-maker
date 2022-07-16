import { useState, useEffect, useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { api } from "../api";
import { UserContext } from "../context/UserContext";
import AdminLayout from "../layout/admin";

const AdminRoute = () => {
  const userContext = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/v1/auth/validate");
        userContext?.setUser(data);
        setIsAuthorized(true);
      } catch (error) {
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return isLoading ? (
    <CircularProgress />
  ) : isAuthorized ? (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ) : (
    <Navigate to="/login" />
  );
};

export { AdminRoute };
