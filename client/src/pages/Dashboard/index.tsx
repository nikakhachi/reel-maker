import { Button, Card, CardActions, CardContent, CardMedia, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { api } from "../../api";
import { SnackbarContext } from "../../context/SnackbarContext";
import { useGeneratedProvider, YoutubeVideoType } from "../../hooks/useGeneratedVideosProvider";
import styles from "./styles.module.css";

const Dashboard = () => {
  const generatedVideos = useGeneratedProvider();

  const [selectedYoutubeVideo, setSelectedYoutubeVideo] = useState<null | YoutubeVideoType>(null);

  return (
    <div style={{ padding: "1rem" }}>
      <Grid item xs={7}>
        {generatedVideos.loading || !generatedVideos.data ? (
          <CircularProgress />
        ) : (
          <div className={styles.videoCardContainer}>
            {!selectedYoutubeVideo ? (
              <>
                {generatedVideos.data.map((youtubeVideo) => (
                  <Card sx={{ maxWidth: 345 }}>
                    <CardMedia
                      component="iframe"
                      src={`https://www.youtube.com/embed/${youtubeVideo.youtubeVideoId}`}
                      allow="autoPlay"
                      height="140"
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {youtubeVideo.youtubeVideoId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {youtubeVideo.videos.length} Videos
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => setSelectedYoutubeVideo(youtubeVideo)}>
                        See All Videos
                      </Button>
                      <Button size="small">Download All</Button>
                    </CardActions>
                  </Card>
                ))}
              </>
            ) : (
              <>
                {selectedYoutubeVideo.videos.map((generatedVideo) => (
                  <Card sx={{ maxWidth: 345 }}>
                    {/* <CardMedia
                  component="iframe"
                  src={`https://www.youtube.com/embed/${youtubeVideo.youtubeVideoId}`}
                  allow="autoPlay"
                  height="140"
                /> */}
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {generatedVideo.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {generatedVideo.type}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">Download All</Button>
                    </CardActions>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </Grid>
    </div>
  );
};

export default Dashboard;
