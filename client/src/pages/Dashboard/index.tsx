import { useContext, useEffect, useState } from "react";
import { Button, IconButton } from "@mui/material";
import { useYoutubeVideosProvider, YoutubeVideoType } from "../../hooks/useYoutubeVideosProvider";
import VideoSection from "../../components/VideoSection";
import RefreshIcon from "@mui/icons-material/Refresh";
import styles from "./styles.module.css";
import { UserContext } from "../../context/UserContext";
import Loader from "../../components/Loader";
import ProcessVideoDialog from "../../components/ProcessVideoDialog";

const Dashboard = () => {
  const userContext = useContext(UserContext);

  const [youtubeVideos, setYoutubeVideos] = useState<null | YoutubeVideoType[]>(null);
  const [processVideoDialogOpen, setProcessVideoDialogOpen] = useState(false);

  const youtubeVideosProvider = useYoutubeVideosProvider(false);

  useEffect(() => {
    if (userContext?.youtubeVideos.length) {
      setYoutubeVideos(userContext?.youtubeVideos);
    } else {
      youtubeVideosProvider.refetch();
    }
  }, []);

  useEffect(() => {
    if (youtubeVideosProvider.data) {
      setYoutubeVideos(youtubeVideosProvider.data);
      userContext?.setYoutubeVideos(youtubeVideosProvider.data);
    }
  }, [youtubeVideosProvider.data]);

  const pendingVideos = youtubeVideos?.filter((item) => item.status.name === "Processing");
  const failedVideos = youtubeVideos?.filter((item) => item.status.name === "Error");
  const generatedVideos = youtubeVideos?.filter((item) => item.status.name === "Success");

  return (
    <div style={{ padding: "1rem" }}>
      {!youtubeVideos ? (
        <Loader />
      ) : (
        <>
          <div className={styles.header}>
            <IconButton
              size="small"
              onClick={() => {
                setYoutubeVideos(null);
                youtubeVideosProvider.refetch();
              }}
            >
              <RefreshIcon fontSize="medium" color="primary" />
            </IconButton>
            <Button onClick={() => setProcessVideoDialogOpen(true)} size="large" variant="contained">
              Process New Video
            </Button>
          </div>
          {pendingVideos?.length ? <VideoSection title="Pending" youtubeVideos={pendingVideos} /> : null}
          {failedVideos?.length ? <VideoSection title="Failed" youtubeVideos={failedVideos} /> : null}
          <VideoSection title="Generated" youtubeVideos={generatedVideos} />
          <ProcessVideoDialog
            open={processVideoDialogOpen}
            handleClose={(refetch) => {
              setProcessVideoDialogOpen(false);
              if (refetch) {
                setYoutubeVideos(null);
                youtubeVideosProvider.refetch();
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
