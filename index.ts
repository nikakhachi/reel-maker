import * as dotenv from "dotenv";
dotenv.config();
import { downloadAndSaveFile } from "./downloadAndSaveFile";
import { getMp3LinkOfYoutubeVideo } from "./getMp3LinkOfYoutubeVideo";
import { getNlpResultsForAudio } from "./getNlpResultsForAudio";
import { generateReelsAndItsData } from "./generateReelsAndItsData";
import { getMP4LinkOfYoutubeVideo } from "./getMp4LinkOfYoutubeVideo";
import { executeBash } from "./executeBash";

(async () => {
  try {
    const videoId = "kj9z510COyg";
    console.log(videoId);
    const videoUrl = await getMP4LinkOfYoutubeVideo(videoId);
    console.log(videoUrl);
    const mp3Url = await getMp3LinkOfYoutubeVideo(`https://www.youtube.com/watch?v=${videoId}`);
    console.log(mp3Url);
    await Promise.all([downloadAndSaveFile(videoUrl, "video.mp4"), downloadAndSaveFile(mp3Url, "audio.mp3")]);
    await executeBash(`ffmpeg -i video.mp4 -i audio.mp3 -map 0:v -map 1:a -c:v copy -shortest output.mp4`);
    const nlp = await getNlpResultsForAudio(mp3Url);
    await generateReelsAndItsData(nlp);
  } catch (error) {
    console.log(error);
  }
})();
