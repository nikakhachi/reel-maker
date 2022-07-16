import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { api } from "../api";

const AdminRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await api.get("/v1/auth/validate");
        setIsAuthorized(true);
      } catch (error) {
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return isLoading ? <CircularProgress /> : isAuthorized ? <Outlet /> : <Navigate to="/login" />;
};

export { AdminRoute };
