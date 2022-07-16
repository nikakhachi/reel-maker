import { Button, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { api } from "../../api";
import { SnackbarContext } from "../../context/SnackbarContext";
import { useGeneratedProvider } from "../../hooks/useGeneratedVideosProvider";

const Dashboard = () => {
  const snackbarContext = useContext(SnackbarContext);
  const generatedVideos = useGeneratedProvider();

  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState("");
  const [isVideoProcessingLoading, setIsVideoProcessingLoading] = useState(false);

  const handleProcessVideo = async () => {
    setIsVideoProcessingLoading(true);
    try {
      await api.post(`/v1/user/generate-video`, { youtubeVideoUrl });
      generatedVideos.refetch();
    } catch (e: any) {
      snackbarContext?.openSnackbar(e?.response?.data?.message || "Error", "error");
    } finally {
      setIsVideoProcessingLoading(false);
    }
  };

  return (
    <Grid container xs={12} justifyContent="center" marginTop={20} gap={5}>
      <Grid item xs={7}>
        <Typography variant="h2">Dashboard</Typography>
      </Grid>
      <Grid item xs={7}>
        <Typography variant="h5">Generate Video</Typography>
      </Grid>
      <Grid item xs={7}>
        <TextField
          value={youtubeVideoUrl}
          onChange={(e) => setYoutubeVideoUrl(e.target.value)}
          fullWidth
          label="Youtube Video Link"
          variant="outlined"
        />
      </Grid>
      <Grid item xs={7}>
        {isVideoProcessingLoading ? (
          <CircularProgress size="1.5rem" />
        ) : (
          <Button onClick={handleProcessVideo} variant="contained">
            Process
          </Button>
        )}
      </Grid>
      <Grid item xs={7}>
        <Typography variant="h5">Videos</Typography>
      </Grid>
      <Grid item xs={7}>
        {generatedVideos.loading ? <CircularProgress /> : <p>{JSON.stringify(generatedVideos.data)}</p>}
      </Grid>
    </Grid>
  );
};

export default Dashboard;
