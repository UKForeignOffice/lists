import { createLogger, transports } from "winston";
import { LOG_LEVEL } from "server/config";
import type { TransformableInfo } from "logform";
import { format } from "logform";

const ignoreHttpGET = format((info: TransformableInfo) => {
  if (typeof info.message === 'string' && info.message.startsWith("HTTP GET")) {
    return false;
  }
  return info;
});

const ignoreHttpPOST = format((info: TransformableInfo) => {
  if (typeof info.message === 'string' && info.message.startsWith("HTTP POST")) {
    return false;
  }
  return info;
});

const formatters = format.combine(
  ignoreHttpGET(),
  ignoreHttpPOST(),
  format.timestamp(),
  format.simple(),
  format.colorize({ all: true })
);

const transportsList = [
  // - Write all logs with level `error` and below to `error.log`
  // - Write all logs with level LOG_LEVEL and below to console.log
  new transports.Console({
    level: LOG_LEVEL,
    format: formatters,
  }),
  new transports.File({ filename: "error.log", level: "error" }),
];

export const logger = createLogger({
  level: LOG_LEVEL,
  format: format.combine(format.errors({ stack: true }), format.json()),
  defaultMeta: { service: "server" },
  transports: transportsList,
});
