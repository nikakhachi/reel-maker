import axios from "axios";
import logger from "../utils/logger";

export const queueAudioForTranscripting = async (audioUrl: string): Promise<string> =>
  new Promise((res, rej) => {
    const assembly = axios.create({
      baseURL: "https://api.assemblyai.com/v2",
      headers: {
        Authorization: process.env.ASSEMBLY_API_KEY || "",
        "Content-Type": "application/json",
      },
    });
    logger.info(`Queing up transcript for url : ${audioUrl}`);
    assembly
      .post("/transcript", {
        audio_url: audioUrl,
        auto_chapters: true,
        iab_categories: true,
      })
      .then(({ data }) => {
        logger.info(`Transcript ID is ${data.id}`);
        res(data.id);
      })
      .catch(rej);
  });
