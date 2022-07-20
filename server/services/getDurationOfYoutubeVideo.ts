import axios from "axios";
import logger from "../utils/logger";

const handleRawYoutubeDuration = (rawDuration: string) => {
  const durationArray = rawDuration.replace(/PT/gi, "").split(/H|M|S/).slice(0, -1);
  if (durationArray.length === 1) return Number(durationArray[0]);
  if (durationArray.length === 2) return Number(durationArray[0]) * 60 + Number(durationArray[1]);
  if (durationArray.length === 3) return Number(Number(durationArray[0]) * 60 * 60 + durationArray[1]) * 60 + Number(durationArray[2]);
};

export const getDurationOfYoutubeVideo = (videoId: string): Promise<number> =>
  new Promise((res, rej) => {
    logger.info(`Getting Video Duration from youtube v3 rapidapi`);
    const options = {
      method: "GET",
      url: "https://youtube-v31.p.rapidapi.com/videos",
      params: { part: "contentDetails", id: videoId },
      headers: {
        "X-RapidAPI-Key": "a03f5cce26mshe3706aeb4dc8914p1202d8jsn2b1f254524e5",
        "X-RapidAPI-Host": "youtube-v31.p.rapidapi.com",
      },
    };

    axios
      .request(options)
      .then(function (response) {
        const rawDuration = response?.data?.items?.[0]?.contentDetails?.duration;
        if (!rawDuration) {
          console.log(response.data);
          logger.error("No DUration Found");
          return rej("");
        }
        const duration = handleRawYoutubeDuration(rawDuration);
        if (!duration) {
          console.log(rawDuration);
          logger.error("Cant process youtube video duration");
          return rej("");
        }
        res(duration);
      })
      .catch(function (error) {
        rej(error);
      });
  });
