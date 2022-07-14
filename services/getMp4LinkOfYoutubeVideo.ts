import axios from "axios";
import logger from "../utils/logger";

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
          const adaptive480p = (Object.values(data.link) as string[][]).find(
            (item) => item[3] === "720p" && item[4].includes("video/mp4")
          )?.[0] as string;
          if (!adaptive480p) {
            rej("Cant find 720 video/mp4 link");
          }
          logger.debug(adaptive480p);
          res(adaptive480p);
        } else {
          rej(data);
        }
      })
      .catch(rej);
  });
