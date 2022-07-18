import { useState, useEffect, useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../api";
import { UserContext } from "../context/UserContext";
import AdminLayout from "../layout/admin";
import Loader from "../components/Loader";

const AdminRoute = () => {
  const userContext = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/v1/user");
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
    <Loader />
  ) : isAuthorized ? (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ) : (
    <Navigate to="/login" />
  );
};

export { AdminRoute };
