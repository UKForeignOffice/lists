import { server } from "./server";
import { PORT, NODE_ENV } from "./config";
import { logger } from "./services/logger";
import {
  startFormRunner,
  isFormRunnerReady,
} from "server/middlewares/form-runner";

function startServer(): void {
  if (isFormRunnerReady()) {
    server.listen(PORT, () => {
      logger.info(`Server listening on PORT: ${PORT}, NODE_ENV: ${NODE_ENV}`);
    });
  } else {
    setTimeout(startServer, 100);
  }
}

startFormRunner();
startServer();
