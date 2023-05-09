import { lawareasof } from "./views/lawareasof";
import { fdservicesprovided } from "./views/fdservicesprovided";
import { LiveLists } from "./views/LiveLists";
import { allproviderstatus } from "./views/allproviderstatus";
import { ALLwhereproviderrequired } from "./views/ALLwhereproviderrequired";
import { schedulerLogger } from "scheduler/logger";

export async function main() {
  schedulerLogger.info("Starting analytics process");

  const tasks = await Promise.allSettled([
    lawareasof(),
    fdservicesprovided(),
    LiveLists(),
    allproviderstatus(),
    ALLwhereproviderrequired(),
  ]);
  schedulerLogger.info("Analytics process ended");
  return tasks;
}
