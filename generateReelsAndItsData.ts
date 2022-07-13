import { v4 } from "uuid";
import fs from "fs";
import path from "path";
import { writeFile } from "fs";
import { executeBash } from "./executeBash";

export const generateReelsAndItsData = async (nlpData: any) => {
  const currentWorkingDir = process.cwd();
  for (const chapter of nlpData.chapters) {
    const id = v4();
    console.log(`Generating : ${chapter.gist}`);
    const dir = path.resolve(path.join(currentWorkingDir, id));
    fs.mkdirSync(dir);
    const reelSubtitles = nlpData.words
      .slice(
        nlpData.words.findIndex((item: any) => item.start === chapter.start),
        nlpData.words.findIndex((item: any) => item.end === chapter.end) + 1
      )
      .map((item: any) => ({ ...item, start: item.start - chapter.start, end: item.end - chapter.start }));
    writeFile(`${currentWorkingDir}/${id}/subtitles.json`, JSON.stringify(reelSubtitles, null, 2), (err) => err && console.log(err));
    writeFile(`${currentWorkingDir}/${id}/metadata.json`, JSON.stringify(chapter, null, 2), (err) => err && console.log(err));
    await executeBash(
      `ffmpeg -i ${currentWorkingDir}/output.mp4 -ss ${chapter.start / 1000} -to ${chapter.end / 1000} ${currentWorkingDir}/${id}/reel.mp4`
    );
    console.log(`Chapter ${chapter.gist} has generated`);
  }
};
