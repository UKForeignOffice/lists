import { server } from "./server";
import { PORT, NODE_ENV } from "./config";
import { logger } from "./services/logger";
import { isFormRunnerReady } from "server/middlewares";

function startServer(): void {
  if (isFormRunnerReady()) {
    server.listen(PORT, () => {
      logger.info(`Server listening on PORT: ${PORT}, NODE_ENV: ${NODE_ENV}`);
    });
  } else {
    setTimeout(startServer, 100);
  }
}

startServer();
