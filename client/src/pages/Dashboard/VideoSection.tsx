import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import { YoutubeVideoType } from "../../hooks/useGeneratedVideosProvider";
import styles from "./styles.module.css";

interface IProps {
  youtubeVideos: YoutubeVideoType[];
  title: "Pending" | "Failed" | "Generated";
}

const VideoSection = ({ youtubeVideos, title }: IProps) => {
  return (
    <div key={title}>
      <p className={styles.videoSectionTitle}>{title}</p>
      <div className={styles.videoCardContainer}>
        {youtubeVideos.map((youtubeVideo) => (
          <Card key={youtubeVideo.videoId} sx={{ maxWidth: 345 }}>
            <CardMedia component="iframe" src={`https://www.youtube.com/embed/${youtubeVideo.videoId}`} allow="autoPlay" height="140" />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {youtubeVideo.videoId}
              </Typography>
              {title === "Generated" && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    {youtubeVideo.clips.length} Clips | {youtubeVideo.shorts.length} Shorts
                  </Typography>
                </>
              )}
            </CardContent>
            <CardActions>
              {title === "Generated" && (
                <>
                  <Button size="small">See All Videos</Button>
                  <Button size="small">Download All</Button>
                </>
              )}
            </CardActions>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VideoSection;
