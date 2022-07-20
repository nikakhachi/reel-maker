const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

export const cutVideo = (inputPath: string, outputPath: string, startTime: number, duration: number) =>
  new Promise((res, rej) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .output(outputPath)
      .withVideoCodec("copy")
      .withAudioCodec("copy")
      .on("end", function (err: any) {
        if (!err) {
          res("");
        } else {
          rej(err);
        }
      })
      .on("error", function (err: any) {
        rej(err);
      })
      .run();
  });
