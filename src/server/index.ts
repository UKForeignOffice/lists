import { server } from "./server";
import { PORT, NODE_ENV } from "./config";
import { logger } from "./services/logger";
import { startFormRunner } from "server/services/form-runner";

startFormRunner()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`Server listening on PORT: ${PORT}, NODE_ENV: ${NODE_ENV}`);
    });
  })
  .catch((error) => {
    logger.error("Server initialization error", error);
  });

process.on("exit", function () {
  logger.info(`Server Stopped`);
});
