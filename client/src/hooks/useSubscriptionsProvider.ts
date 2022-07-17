import { useEffect, useState } from "react";
import { api } from "../api";

export type SubscriptionType = {
  durationInDays: number;
  priceInDollars: number;
  title: string;
  transcriptionSeconds: number;
};

export const useSubscriptionsProvider = (autoFetch = true) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SubscriptionType[]>([]);
  const [error, setError] = useState<any>();

  const fetch = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/subscription`);
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
