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

const checkProcess = async (id: string): Promise<any> =>
  new Promise((res, rej) => {
    const assembly = axios.create({
      baseURL: "https://api.assemblyai.com/v2",
      headers: {
        authorization: process.env.ASSEMBLY_API_KEY || "",
        "content-type": "application/json",
      },
    });
    assembly
      .get(`/transcript/${id}`)
      .then(({ data }) => {
        res(data);
      })
      .catch(rej);
  });

export const getAudioTranscriptResults = async (queueId: string) => {
  let statusName: "queued" | "processing" | "completed" | "error" = "queued";
  let response: any;
  do {
    logger.info("Waiting couple of seconds to check the status");
    await new Promise((res, rej) => setTimeout(() => res(""), 10000));
    const processResult = await checkProcess(queueId);
    statusName = processResult.status;
    logger.info(`Status is ${statusName}`);
    if (statusName === "completed") {
      response = processResult;
    } else {
      logger.info("Retrying");
    }
  } while (statusName !== "completed");
  logger.info("Returning process NLP audio");
  return response;
};
