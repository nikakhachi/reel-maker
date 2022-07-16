import { Button, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { SnackbarContext } from "../../context/SnackbarContext";
import styles from "./styles.module.css";

const Generate = () => {
  const snackbarContext = useContext(SnackbarContext);
  const navigate = useNavigate();

  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState("");
  const [isVideoProcessingLoading, setIsVideoProcessingLoading] = useState(false);

  const handleProcessVideo = async () => {
    if (!youtubeVideoUrl) return snackbarContext?.openSnackbar("Youtube Video Url is not Provided", "error");
    if (!/^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/.test(youtubeVideoUrl))
      return snackbarContext?.openSnackbar("Invalid Url", "error");
    setIsVideoProcessingLoading(true);
    try {
      await api.post(`/v1/user/generate-video`, { youtubeVideoUrl });
      navigate("/dashboard/youtube-videos");
    } catch (e: any) {
      snackbarContext?.openSnackbar(e?.response?.data?.message || "Error", "error");
    } finally {
      setIsVideoProcessingLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <Typography variant="h5">Generate Video</Typography>
        <TextField
          value={youtubeVideoUrl}
          onChange={(e) => setYoutubeVideoUrl(e.target.value)}
          fullWidth
          label="Youtube Video Link"
          variant="outlined"
        />

        {isVideoProcessingLoading ? (
          <CircularProgress size="1.5rem" />
        ) : (
          <Button onClick={handleProcessVideo} variant="contained">
            Process
          </Button>
        )}
      </div>
    </div>
  );
};

export default Generate;
