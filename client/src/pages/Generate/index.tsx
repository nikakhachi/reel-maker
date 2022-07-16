import { Button, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { SnackbarContext } from "../../context/SnackbarContext";

const Generate = () => {
  const snackbarContext = useContext(SnackbarContext);
  const navigate = useNavigate();

  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState("");
  const [isVideoProcessingLoading, setIsVideoProcessingLoading] = useState(false);

  const handleProcessVideo = async () => {
    setIsVideoProcessingLoading(true);
    try {
      await api.post(`/v1/user/generate-video`, { youtubeVideoUrl });
      navigate("/dashboard");
    } catch (e: any) {
      snackbarContext?.openSnackbar(e?.response?.data?.message || "Error", "error");
    } finally {
      setIsVideoProcessingLoading(false);
    }
  };
  return (
    <div>
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
  );
};

export default Generate;
