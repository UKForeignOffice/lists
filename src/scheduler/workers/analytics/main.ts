import { schedulerLogger } from "scheduler/logger";
import {
  allproviderstatus,
  ALLwhereproviderrequired,
  fdservicesprovided,
  intservicesprovided,
  lawareasof,
  LiveLists,
} from "./views";

/**
 * This task queries tables and pushes them into google sheets.
 * note: currently disabled due to drive/information ownership dispute.
 */
export async function main() {
  schedulerLogger.info("Starting analytics process");

  const tasks = await Promise.allSettled([
    lawareasof(),
    fdservicesprovided(),
    LiveLists(),
    allproviderstatus(),
    ALLwhereproviderrequired(),
    intservicesprovided(),
  ]);
  schedulerLogger.info("Analytics process ended");
  return tasks;
}
