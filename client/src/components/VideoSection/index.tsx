import { Button, Card, CardActions, CardContent, CardMedia, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { YoutubeVideoType } from "../../hooks/useYoutubeVideosProvider";
import { ClipVideoType, ShortVideoType } from "../../hooks/useProcessedVideosProvider";
import styles from "./styles.module.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useNavigate } from "react-router-dom";
import { downloadFromLinks } from "../../utils/downloadFromLinks";
import InfoIcon from "@mui/icons-material/Info";
import { api, API_ENDPOINT } from "../../api";
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
              <div key={youtubeVideo.videoId} style={isExpanded ? {} : { display: "none" }}>
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
                        <Button
                          variant="outlined"
                          onClick={() => navigate(`/dashboard/youtube-videos/${youtubeVideo.videoId}`)}
                          size="small"
                        >
                          See All Videos
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => downloadFromLinks([`${API_ENDPOINT}/v1/user/videos/download/${youtubeVideo.videoId}`])}
                        >
                          Download All
                        </Button>
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
              <div key={clip.videoUrl} style={isExpanded ? {} : { display: "none" }}>
                <Card key={clip.videoUrl} sx={{ maxWidth: 345, border: "1px solid lightgrey" }}>
                  <video width="100%" src={`https://duypt6g4fe8mq.cloudfront.net/${clip.videoUrl}`} />
                  <CardContent sx={{ minHeight: 180 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {clip.gist}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {clip.headline}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        downloadFromLinks([
                          `https://duypt6g4fe8mq.cloudfront.net/${clip.videoUrl}`,
                          `https://duypt6g4fe8mq.cloudfront.net/${clip.subtitlesUrl}`,
                        ])
                      }
                      size="small"
                    >
                      Download
                    </Button>
                    <Tooltip title={<Typography variant="subtitle2">{clip.summary}</Typography>}>
                      <InfoIcon color="primary" />
                    </Tooltip>
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
              <div key={short.videoUrl} style={isExpanded ? {} : { display: "none" }}>
                <Card key={short.videoUrl} sx={{ maxWidth: 345, border: "1px solid lightgrey" }}>
                  <video width="100%" src={`https://duypt6g4fe8mq.cloudfront.net/${short.videoUrl}`} />
                  <CardContent sx={{ minHeight: 300 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {short.label
                        .split(">")
                        .slice(-1)[0]
                        .split(/(?=[A-Z])/)
                        .join(" ")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {short.text}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        downloadFromLinks([
                          `https://duypt6g4fe8mq.cloudfront.net/${short.videoUrl}`,
                          `https://duypt6g4fe8mq.cloudfront.net/${short.subtitlesUrl}`,
                        ])
                      }
                      size="small"
                    >
                      Download
                    </Button>
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
