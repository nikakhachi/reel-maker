import { useEffect, useState } from "react";
import { api } from "../api";

export type ShortVideoType = {
  createdAt: string;
  label: string;
  subtitlesUrl: string;
  text: string;
  videoUrl: string;
};

export type ClipVideoType = {
  gist: string;
  headline: string;
  createdAt: string;
  subtitlesUrl: string;
  summary: string;
  videoUrl: string;
};

export type ProcessedVideoType = {
  shorts: ShortVideoType[];
  clips: ClipVideoType[];
};

export const useProcessedVideosProvider = (videoId: string) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProcessedVideoType>({ shorts: [], clips: [] });
  const [error, setError] = useState<any>();

  const fetch = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/user/videos/${videoId}`);
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
