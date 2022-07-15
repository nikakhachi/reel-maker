import { ENV_VARIABLES, NODE_ENV_OPTIONS } from "./config/envVariables";
import logger from "./utils/logger";

const checkEnvVariables = () => {
  for (const item of ENV_VARIABLES) {
    if (!Object.keys(process.env).includes(item)) {
      logger.error(`${item} env variable is missing. Exiting`);
      process.exit();
    }
  }
  if (!process.env.NODE_ENV || !NODE_ENV_OPTIONS.includes(process.env.NODE_ENV)) {
    logger.error(`NODE_ENV should have value from one of these : ${JSON.stringify(NODE_ENV_OPTIONS)}`);
    process.exit();
  }
};

export { checkEnvVariables };
