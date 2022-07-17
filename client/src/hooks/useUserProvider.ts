import { useEffect, useState } from "react";
import { api } from "../api";
import { UserType } from "../context/UserContext";

export const useUserProvider = (autoFetch = true) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserType>();
  const [error, setError] = useState<any>();

  const fetch = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/user`);
      setData(response.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) fetch();
  }, []);

  const refetch = () => {
    fetch();
  };

  return {
    data,
    refetch,
    loading,
    error,
  };
};
