import winston, { transport, Logger, Logform } from "winston";

const { combine, colorize, json, errors, printf, timestamp, metadata } = winston.format;

const PRODUCTION_ENV: boolean = process.env.NODE_ENV === "production";
const TESTING_ENV: boolean = process.env.NODE_ENV === "testing";

const localFormat = printf(
  ({ timestamp, level, message, stack }: Logform.TransformableInfo) => `${timestamp} ${level}: ${stack || message}`
);

const environmentFormat = printf(({ level, message, stack, metadata }: Logform.TransformableInfo) => {
  let metadt = "";
  if (JSON.stringify(metadata) !== "{}") {
    metadt = JSON.stringify(metadata, null, 2);
  }
  return `[${level.toUpperCase()}] ${stack || message} ${metadt}`;
});

const ConsoleTransport: transport = new winston.transports.Console({
  level: PRODUCTION_ENV ? "info" : "debug",
  format:
    !PRODUCTION_ENV && !TESTING_ENV
      ? combine(
          colorize(),
          timestamp({ format: "HH:mm:ss" }),
          errors({ stack: "true" }),
          metadata({ fillExcept: ["message", "level", "timestamp"] }),
          localFormat
        )
      : combine(errors({ stack: "true" }), metadata({ fillExcept: ["message", "level", "timestamp"] }), environmentFormat),
});

const ErrorLogsTransport: transport = new winston.transports.File({
  level: "error",
  filename: "logs/errors.log",
  format: combine(timestamp(), json()),
});

const logger: Logger = winston.createLogger({
  transports: [ConsoleTransport, ErrorLogsTransport],
});

export default logger;
