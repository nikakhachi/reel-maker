import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import { useState } from "react";
import { YoutubeVideoType } from "../../hooks/useGeneratedVideosProvider";
import styles from "./styles.module.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
interface IProps {
  youtubeVideos: YoutubeVideoType[];
  title: "Pending" | "Failed" | "Generated";
}

const VideoSection = ({ youtubeVideos, title }: IProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div key={title}>
      <p onClick={() => setIsExpanded(!isExpanded)} className={styles.videoSectionTitle}>
        {title} - {youtubeVideos.length} {!isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
      </p>
      <div className={styles.videoCardContainer}>
        {youtubeVideos.map((youtubeVideo) => (
          <div style={isExpanded ? {} : { display: "none" }}>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoSection;
