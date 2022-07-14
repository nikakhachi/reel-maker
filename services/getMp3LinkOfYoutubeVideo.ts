import axios from "axios";

const createProcess = (
  videoUrl: string
): Promise<{
  guid: string;
  message: string;
  file?: string;
  YoutubeAPI: any;
}> =>
  new Promise((res, rej) => {
    const options = {
      method: "GET",
      url: "https://t-one-youtube-converter.p.rapidapi.com/api/v1/createProcess",
      params: {
        url: videoUrl,
        format: "mp3",
        responseFormat: "json",
        lang: "en",
      },
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY || "",
        "X-RapidAPI-Host": "t-one-youtube-converter.p.rapidapi.com",
      },
    };

    axios
      .request(options)
      .then(function (response) {
        res(response.data);
      })
      .catch(function (error) {
        rej(error);
      });
  });

const checkStatus = (
  id: string
): Promise<{
  guid: string;
  message: string;
  file?: string;
  YoutubeApi: any;
}> =>
  new Promise((res, rej) => {
    const options = {
      method: "GET",
      url: "https://t-one-youtube-converter.p.rapidapi.com/api/v1/statusProcess",
      params: { guid: id, responseFormat: "json", lang: "it" },
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY || "",
        "X-RapidAPI-Host": "t-one-youtube-converter.p.rapidapi.com",
      },
    };

    axios
      .request(options)
      .then(function (response) {
        res(response.data);
      })
      .catch(function (error) {
        rej(error);
      });
  });

export const getMp3LinkOfYoutubeVideo = async (videoUrl: string) => {
  console.log("Creating Process for Youtube to Mp3");
  const createdProcess = await createProcess(videoUrl);
  console.log(createdProcess);
  console.log("Process Created");
  if (createdProcess.YoutubeAPI.urlMp3) {
    console.log("Video has already been processed. Returning Url");
    return createdProcess.YoutubeAPI.urlMp3;
  }
  let url: string | boolean | undefined = false;
  do {
    console.log("Waiting couple of seconds for status check");
    await new Promise((res, rej) => setTimeout(() => res(""), 5000));
    console.log("Checking Status for the video");
    const processStatus = await checkStatus(createdProcess.guid);
    console.log(processStatus);
    url = processStatus.file;
  } while (!url);
  console.log("Video has been processed, returning Url");
  return url;
};
