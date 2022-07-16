import { useEffect, useState } from "react";
import { api } from "../api";

export type YoutubeVideoType = {
  status: "Success" | "Processing" | "Error";
  youtubeVideoId: string;
  videos: {
    type: "Clip" | "Short";
    metadataUrl: string;
    subtitlesUrl: string;
    videoUrl: string;
  }[];
};

export const useGeneratedProvider = () => {
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
