import { Button, CircularProgress } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_ENDPOINT } from "../../api";
import VideoSection from "../../components/VideoSection";
import { UserContext } from "../../context/UserContext";
import { ProcessedVideoType, useProcessedVideosProvider } from "../../hooks/useProcessedVideosProvider";
import { downloadFromLinks } from "../../utils/downloadFromLinks";
import styles from "./styles.module.css";

const YoutubeVideo = () => {
  const userContext = useContext(UserContext);
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();

  const [processedVideos, setProcessedVideos] = useState<ProcessedVideoType>();

  const processedVideosProvider = useProcessedVideosProvider(videoId || "", false);

  useEffect(() => {
    const processedVideosInCache = userContext?.youtubeVideosFullData.find((item) => item.videoId === videoId);
    if (processedVideosInCache) {
      setProcessedVideos({ clips: processedVideosInCache.clips, shorts: processedVideosInCache.shorts });
    } else {
      processedVideosProvider.refetch();
    }
  }, []);

  useEffect(() => {
    if (processedVideosProvider.data && videoId && !processedVideosProvider.loading) {
      setProcessedVideos(processedVideosProvider.data);
      userContext?.setYoutubeVideosFullData((arr) => [...arr, { videoId, ...processedVideosProvider.data }]);
    }
  }, [processedVideosProvider.data]);

  useEffect(() => {
    if (processedVideosProvider.error) {
      navigate("/dashboard/youtube-videos");
    }
  }, [processedVideosProvider.error]);

  return (
    <div style={{ padding: "1rem" }}>
      {!processedVideos ? (
        <CircularProgress />
      ) : (
        <>
          <div className={styles.header}>
            <iframe width="600" height="300" src={`https://www.youtube.com/embed/${videoId}`} />
            <Button
              onClick={() => downloadFromLinks([`${API_ENDPOINT}/v1/user/videos/download/${videoId}`])}
              variant="contained"
              sx={{ marginBottom: "2rem" }}
            >
              Download All
            </Button>
          </div>

          <VideoSection title="Clips" clipVideos={processedVideos.clips} />
          <VideoSection title="Shorts" shortVideos={processedVideos.shorts} />
        </>
      )}
    </div>
  );
};

export default YoutubeVideo;
