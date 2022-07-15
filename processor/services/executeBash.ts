import { exec } from "child_process";

export const executeBash = (script: string) => {
  return new Promise((res, rej) => {
    exec(script, (error, stdout, stderr) => {
      if (error) {
        return rej({ stderr, error });
      }
      res(stdout);
    });
  });
};
