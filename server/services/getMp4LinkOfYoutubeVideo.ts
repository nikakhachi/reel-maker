import axios from "axios";
import logger from "../utils/logger";

type YoutubeVideoFormat = "720p" | "480p" | "360p" | "240p" | "144p";

const getVideoUrlByFormat = (data: any, format: YoutubeVideoFormat) =>
  (Object.values(data.link) as string[][]).find((item) => item[3] === "720p" && item[4].includes("video/mp4"))?.[0] as string;

const getVideoUrl = (data: any) => {
  const formats = ["720p", "480p", "360p", "240p", "144p"];
  let videoUrl: string | undefined;
  for (const format of formats) {
    logger.info(`Getting ${format} format`);
    videoUrl = getVideoUrlByFormat(data, format as YoutubeVideoFormat);
    if (videoUrl) break;
  }
  return videoUrl || null;
};

export const getMP4LinkOfYoutubeVideo = (videoId: string): Promise<string> =>
  new Promise((res, rej) => {
    logger.info(`Getting MP4 Url for Video : ${videoId}`);
    const options = {
      method: "GET",
      url: "https://ytstream-download-youtube-videos.p.rapidapi.com/dl",
      params: { id: videoId },
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY || "",
        "X-RapidAPI-Host": "ytstream-download-youtube-videos.p.rapidapi.com",
      },
    };

    axios
      .request(options)
      .then(function ({ data }) {
        if (data.status === "ok") {
          let videoUrl = getVideoUrl(data);
          if (!videoUrl) return rej("Video format is broken");
          logger.info(videoUrl);
          res(videoUrl);
        } else {
          rej(data);
        }
      })
      .catch(rej);
  });
