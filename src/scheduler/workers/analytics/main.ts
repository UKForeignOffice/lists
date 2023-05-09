import { schedulerLogger } from "scheduler/logger";
import {
  allproviderstatus,
  ALLwhereproviderrequired,
  fdservicesprovided,
  intservicesprovided,
  lawareasof,
  LiveLists,
} from "./views";

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
