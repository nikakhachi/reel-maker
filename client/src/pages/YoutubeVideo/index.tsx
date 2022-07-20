import { Button, CircularProgress, Pagination, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_ENDPOINT } from "../../api";
import Loader from "../../components/Loader";
import VideoSection from "../../components/VideoSection";
import { SnackbarContext } from "../../context/SnackbarContext";
import { UserContext } from "../../context/UserContext";
import { ProcessedVideoType, useProcessedVideosProvider } from "../../hooks/useProcessedVideosProvider";
import { downloadFromLinks } from "../../utils/downloadFromLinks";
import styles from "./styles.module.css";

const YoutubeVideo = () => {
  const userContext = useContext(UserContext);
  const snackbarContext = useContext(SnackbarContext);

  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();

  const [areAllDownloading, setAreAllDownloading] = useState(false);
  const [processedVideos, setProcessedVideos] = useState<ProcessedVideoType>();

  const processedVideosProvider = useProcessedVideosProvider(videoId || "", false);
  const [alignment, setAlignment] = useState<"clips" | "shorts">("clips");
  const [page, setPage] = useState(1);
  const VIDEOS_PER_PAGE = 8;

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

  const handleAllDownload = async () => {
    setAreAllDownloading(true);
    try {
      await downloadFromLinks([`${API_ENDPOINT}/v1/user/videos/download/${videoId}`]);
      snackbarContext?.openSnackbar("Downloading has started", "success");
    } catch (error) {
      snackbarContext?.openSnackbar("Error while downloading video", "error");
    } finally {
      setAreAllDownloading(false);
    }
  };

  const handleChange = (event: React.MouseEvent<HTMLElement>, newAlignment: "shorts" | "clips") => {
    setPage(1);
    setAlignment(newAlignment);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <div style={{ padding: "1rem" }}>
      {!processedVideos ? (
        <Loader />
      ) : (
        <>
          <div className={styles.header}>
            {/* <iframe width="300" height="150" src={`https://www.youtube.com/embed/${videoId}`} /> */}
            <Typography variant="h2">{videoId}</Typography>
            <Button onClick={handleAllDownload} variant="contained" sx={{ marginBottom: "2rem" }} disabled={areAllDownloading}>
              {areAllDownloading ? <CircularProgress size="1.5rem" /> : "Download All"}
            </Button>
          </div>
          <ToggleButtonGroup color="primary" value={alignment} exclusive onChange={handleChange}>
            <ToggleButton value="clips">Clips</ToggleButton>
            <ToggleButton value="shorts">Shorts</ToggleButton>
          </ToggleButtonGroup>
          <br />
          <br />
          <Pagination
            count={Math.ceil(processedVideos[alignment === "clips" ? "clips" : "shorts"].length / 10)}
            page={page}
            onChange={handlePageChange}
          />
          {alignment === "clips" ? (
            <VideoSection title="Clips" clipVideos={processedVideos.clips.slice((page - 1) * VIDEOS_PER_PAGE, page * VIDEOS_PER_PAGE)} />
          ) : (
            <VideoSection title="Shorts" shortVideos={processedVideos.shorts.slice((page - 1) * VIDEOS_PER_PAGE, page * VIDEOS_PER_PAGE)} />
          )}
          <Pagination
            count={Math.ceil(processedVideos[alignment === "clips" ? "clips" : "shorts"].length / 10)}
            page={page}
            onChange={handlePageChange}
          />
          <br />
        </>
      )}
    </div>
  );
};

export default YoutubeVideo;
