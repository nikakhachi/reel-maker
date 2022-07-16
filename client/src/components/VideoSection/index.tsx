import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import { useState } from "react";
import { YoutubeVideoType } from "../../hooks/useYoutubeVideosProvider";
import { ClipVideoType, ShortVideoType } from "../../hooks/useProcessedVideosProvider";
import styles from "./styles.module.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";

interface IProps {
  youtubeVideos?: YoutubeVideoType[];
  clipVideos?: ClipVideoType[];
  shortVideos?: ShortVideoType[];
  title: "Pending" | "Failed" | "Generated" | "Clips" | "Shorts";
}

const VideoSection = ({ youtubeVideos, title, clipVideos, shortVideos }: IProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  return (
    <>
      {youtubeVideos && (
        <div key={title}>
          <p onClick={() => setIsExpanded(!isExpanded)} className={styles.videoSectionTitle}>
            {title} - {youtubeVideos.length} {!isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          </p>
          <div className={styles.videoCardContainer}>
            {youtubeVideos.map((youtubeVideo) => (
              <div style={isExpanded ? {} : { display: "none" }}>
                <Card key={youtubeVideo.videoId} sx={{ maxWidth: 345 }}>
                  <CardMedia
                    component="iframe"
                    src={`https://www.youtube.com/embed/${youtubeVideo.videoId}`}
                    allow="autoPlay"
                    height="140"
                  />
                  <CardContent>
                    {title === "Generated" && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {youtubeVideo._count.clips} Clips | {youtubeVideo._count.shorts} Shorts
                        </Typography>
                      </>
                    )}
                  </CardContent>
                  <CardActions>
                    {title === "Generated" && (
                      <>
                        <Button onClick={() => navigate(`/dashboard/youtube-videos/${youtubeVideo.videoId}`)} size="small">
                          See All Videos
                        </Button>
                        <Button size="small">Download All</Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
      {clipVideos && (
        <div key={title}>
          <p onClick={() => setIsExpanded(!isExpanded)} className={styles.videoSectionTitle}>
            {title} - {clipVideos.length} {!isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          </p>
          <div className={styles.videoCardContainer}>
            {clipVideos.map((clip) => (
              <div style={isExpanded ? {} : { display: "none" }}>
                <Card key={clip.videoUrl} sx={{ maxWidth: 345 }}>
                  {/* <ReactPlayer url={`https://duypt6g4fe8mq.cloudfront.net/${clip.videoUrl}`} /> */}
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {clip.gist}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {clip.headline}
                    </Typography>
                    {/* <hr />
                    <Typography variant="body2" color="text.secondary">
                      {clip.summary}
                    </Typography> */}
                  </CardContent>
                  <CardActions>
                    <Button size="small">Download</Button>
                  </CardActions>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
      {shortVideos && (
        <div key={title}>
          <p onClick={() => setIsExpanded(!isExpanded)} className={styles.videoSectionTitle}>
            {title} - {shortVideos.length} {!isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          </p>
          <div className={styles.videoCardContainer}>
            {shortVideos.map((short) => (
              <div style={isExpanded ? {} : { display: "none" }}>
                <Card key={short.videoUrl} sx={{ maxWidth: 345 }}>
                  {/* <ReactPlayer url={`https://duypt6g4fe8mq.cloudfront.net/${short.videoUrl}`} /> */}
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {short.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {short.text}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Download</Button>
                  </CardActions>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default VideoSection;
