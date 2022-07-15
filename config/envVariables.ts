const ENV_VARIABLES = [
  "NODE_ENV",
  "PORT",
  "SESSION_SECRET",
  "JWT_KEY",
  "JWT_REFRESH_KEY",
  "DATABASE_URL",
  "ASSEMBLY_API_KEY",
  "RAPID_API_KEY",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY_ID",
  "AWS_REGION",
  "AWS_S3_BUCKET_NAME",
  "AWS_CLOUDFRONT_URL",
];
const NODE_ENV_OPTIONS = ["development", "production", "testing"];

export { ENV_VARIABLES, NODE_ENV_OPTIONS };
