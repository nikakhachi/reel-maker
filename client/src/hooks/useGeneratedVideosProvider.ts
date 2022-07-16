import { useEffect, useState } from "react";
import { api } from "../api";

export const useGeneratedProvider = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>();
  const [error, setError] = useState<any>();

  const fetch = async () => {
    setLoading(true);
    try {
      const response = await api.get("/v1/user/videos");
      setData(response.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
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
