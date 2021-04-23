import { server } from "./server";
import { PORT, NODE_ENV } from "./config";
import { logger } from "./services/logger";
import {
  startFormRunner,
  isFormRunnerReady,
} from "server/middlewares/form-runner";

async function startServer(): Promise<void> {
  await startFormRunner();

  if (await isFormRunnerReady()) {
    server.listen(PORT, () => {
      logger.info(`Server listening on PORT: ${PORT}, NODE_ENV: ${NODE_ENV}`);
    });
  } else {
    return startServer();
  }
}

startServer().catch((error) => {
  logger.error("Server Start Error: ", error);
});
