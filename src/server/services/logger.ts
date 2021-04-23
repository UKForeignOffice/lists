import { createLogger, format, transports } from "winston";
import { PapertrailTransport } from "winston-papertrail-transport";

import { LOG_LEVEL, LOCAL_DEV, isTest } from "server/config";

const ignoreHttpGET = format((info) => {
  if (info.message.startsWith("HTTP GET")) {
    return false;
  }
  return info;
});

const ignoreHttpPOST = format((info) => {
  if (info.message.startsWith("HTTP POST")) {
    return false;
  }
  return info;
});

const transportsList = [
  // - Write all logs with level `error` and below to `error.log`
  // - Write all logs with level LOG_LEVEL and below to console.log
  new transports.Console({
    level: LOG_LEVEL,
    format: format.combine(
      ignoreHttpGET(),
      ignoreHttpPOST(),
      format.timestamp(),
      format.simple(),
      format.colorize({ all: true })
    ),
    silent: isTest,
  }),
  new transports.File({ filename: "error.log", level: "error" }),
];

// Debug dev only
if (!LOCAL_DEV && !isTest) {
  transportsList.push(
    new PapertrailTransport({
      host: "logs.papertrailapp.com",
      port: 48692,
    }) as any
  );
}

export const logger = createLogger({
  level: LOG_LEVEL,
  format: format.json(),
  defaultMeta: { service: "server" },
  transports: transportsList,
});
