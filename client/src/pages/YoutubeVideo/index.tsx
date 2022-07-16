import { CircularProgress } from "@mui/material";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VideoSection from "../../components/VideoSection";
import { useProcessedVideosProvider } from "../../hooks/useProcessedVideosProvider";
import styles from "./styles.module.css";

const YoutubeVideo = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();

  const processedVideos = useProcessedVideosProvider(videoId || "");

  useEffect(() => {
    if (processedVideos.error) {
      navigate("/dashboard/youtube-videos");
    }
  }, [processedVideos.error]);

  return (
    <div style={{ padding: "1rem" }}>
      {processedVideos.loading ? (
        <CircularProgress />
      ) : (
        <>
          <div className={styles.header}>
            <iframe width="600" height="300" src={`https://www.youtube.com/embed/${videoId}`} />
          </div>
          <VideoSection title="Clips" clipVideos={processedVideos.data.clips} />
          <VideoSection title="Shorts" shortVideos={processedVideos.data.shorts} />
        </>
      )}
    </div>
  );
};

export default YoutubeVideo;
