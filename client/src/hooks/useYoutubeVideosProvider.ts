import { useEffect, useState } from "react";
import { api } from "../api";

export type YoutubeVideoType = {
  status: { name: "Success" | "Processing" | "Error" };
  videoId: string;
  _count: { clips: number; shorts: number };
};

export const useYoutubeVideosProvider = (autoFetch = true) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<YoutubeVideoType[]>();
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
