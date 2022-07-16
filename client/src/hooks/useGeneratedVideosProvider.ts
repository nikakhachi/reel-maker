import { useEffect, useState } from "react";
import { api } from "../api";

export type YoutubeVideoType = {
  status: "Success" | "Processing" | "Error";
  videoId: string;
  shorts: {
    subtitlesUrl: string;
    videoUrl: string;
    createdAt: Date;
    label: string;
    text: string;
  }[];
  clips: {
    subtitlesUrl: string;
    videoUrl: string;
    createdAt: Date;
    gist: string;
    headline: string;
    summary: string;
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
