import axios from "axios";

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

const queAudioForProcessing = async (audioUrl: string): Promise<{ id: string; status: string }> =>
  new Promise((res, rej) => {
    const assembly = axios.create({
      baseURL: "https://api.assemblyai.com/v2",
      headers: {
        Authorization: process.env.ASSEMBLY_API_KEY || "",
        "Content-Type": "application/json",
      },
    });

    assembly
      .post("/transcript", {
        audio_url: audioUrl,
        auto_chapters: true,
        iab_categories: true,
      })
      .then(({ data }) => {
        res(data);
      })
      .catch(rej);
  });

export const getNlpResultsForAudio = async (audioUrl: string) => {
  console.log("Queuing up the audio for Nlp processing");
  const status = await queAudioForProcessing(audioUrl);
  console.log(status);
  console.log("Audio is queued up");
  let statusName: "queued" | "processing" | "completed" | "error" = "queued";
  let response: any;
  do {
    console.log("Waiting couple of seconds to check the status");
    await new Promise((res, rej) => setTimeout(() => res(""), 30000));
    const processResult = await checkProcess(status.id);
    statusName = processResult.status;
    console.log("Status is ", statusName);
    if (statusName === "completed") {
      response = processResult;
    } else {
      console.log("Retrying");
    }
  } while (statusName !== "completed");
  console.log("Returning process NLP audio");
  return response;
};
