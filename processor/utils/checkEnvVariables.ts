import logger from "./logger";

const ENV_VARIABLES = [
  "NODE_ENV",
  "PORT",
  "ACCESS_KEY",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY_ID",
  "AWS_REGION",
  "AWS_S3_BUCKET_NAME",
  "ASSEMBLY_API_KEY",
  "SERVER_ENDPOINT",
];
const NODE_ENV_OPTIONS = ["development", "production", "testing"];

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
