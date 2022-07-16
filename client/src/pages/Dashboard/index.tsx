import { CircularProgress, Grid, IconButton } from "@mui/material";
import { useYoutubeVideosProvider } from "../../hooks/useYoutubeVideosProvider";
import VideoSection from "../../components/VideoSection";
import RefreshIcon from "@mui/icons-material/Refresh";
import styles from "./styles.module.css";

const Dashboard = () => {
  const youtubeVideos = useYoutubeVideosProvider();

  return (
    <div style={{ padding: "1rem" }}>
      {youtubeVideos.loading || !youtubeVideos.data ? (
        <CircularProgress />
      ) : (
        <>
          <div className={styles.header}>
            <IconButton size="large" onClick={() => youtubeVideos.refetch()}>
              <RefreshIcon fontSize="large" color="primary" />
            </IconButton>
          </div>
          <VideoSection title="Pending" youtubeVideos={youtubeVideos.data.filter((item) => item.status.name === "Processing")} />
          <VideoSection title="Failed" youtubeVideos={youtubeVideos.data.filter((item) => item.status.name === "Error")} />
          <VideoSection title="Generated" youtubeVideos={youtubeVideos.data.filter((item) => item.status.name === "Success")} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
