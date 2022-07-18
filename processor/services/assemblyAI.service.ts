import axios from "axios";
import logger from "../utils/logger";

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
    await new Promise((res, rej) => setTimeout(() => res(""), 20000));
    const processResult = await checkProcess(queueId);
    statusName = processResult.status;
    logger.info(`Status is ${statusName}`);
    if (statusName === "completed") {
      response = processResult;
    } else if (statusName === "error") {
      logger.error("Assembly AI failed to transcript video");
      response = processResult;
    } else {
      logger.info("Retrying");
    }
  } while (statusName !== "completed" && statusName !== "error");
  logger.info("Returning process NLP audio");
  return response;
};
