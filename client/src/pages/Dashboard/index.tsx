import { CircularProgress, Grid, IconButton } from "@mui/material";
import { useGeneratedProvider } from "../../hooks/useGeneratedVideosProvider";
import VideoSection from "./VideoSection";
import RefreshIcon from "@mui/icons-material/Refresh";
import styles from "./styles.module.css";

const Dashboard = () => {
  const generatedVideos = useGeneratedProvider();

  return (
    <div style={{ padding: "1rem" }}>
      <Grid item xs={7}>
        {generatedVideos.loading || !generatedVideos.data ? (
          <CircularProgress />
        ) : (
          <>
            <div className={styles.header}>
              <IconButton size="large" onClick={() => generatedVideos.refetch()}>
                <RefreshIcon fontSize="large" color="primary" />
              </IconButton>
            </div>
            <VideoSection title="Pending" youtubeVideos={generatedVideos.data.filter((item) => item.status === "Processing")} />
            <VideoSection title="Failed" youtubeVideos={generatedVideos.data.filter((item) => item.status === "Error")} />
            <VideoSection title="Generated" youtubeVideos={generatedVideos.data.filter((item) => item.status === "Success")} />
          </>
        )}
      </Grid>
    </div>
  );
};

export default Dashboard;
