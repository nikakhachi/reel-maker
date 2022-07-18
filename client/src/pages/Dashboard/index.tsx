import { useContext, useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import { useYoutubeVideosProvider, YoutubeVideoType } from "../../hooks/useYoutubeVideosProvider";
import VideoSection from "../../components/VideoSection";
import RefreshIcon from "@mui/icons-material/Refresh";
import styles from "./styles.module.css";
import { UserContext } from "../../context/UserContext";
import Loader from "../../components/Loader";

const Dashboard = () => {
  const userContext = useContext(UserContext);

  const [youtubeVideos, setYoutubeVideos] = useState<null | YoutubeVideoType[]>(null);

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

  return (
    <div style={{ padding: "1rem" }}>
      {!youtubeVideos ? (
        <Loader />
      ) : (
        <>
          <div className={styles.header}>
            <IconButton
              size="large"
              onClick={() => {
                setYoutubeVideos(null);
                youtubeVideosProvider.refetch();
              }}
            >
              <RefreshIcon fontSize="large" color="primary" />
            </IconButton>
          </div>
          <VideoSection title="Pending" youtubeVideos={youtubeVideos.filter((item) => item.status.name === "Processing")} />
          <VideoSection title="Failed" youtubeVideos={youtubeVideos.filter((item) => item.status.name === "Error")} />
          <VideoSection title="Generated" youtubeVideos={youtubeVideos.filter((item) => item.status.name === "Success")} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
