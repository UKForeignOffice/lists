import { getServer } from "./server";
import { PORT, NODE_ENV } from "./config";
import { logger } from "./services/logger";
import { startFormRunner } from "server/services/form-runner";

startFormRunner()
  .then(getServer)
  .then((server) => {
    server.listen(PORT, () => {
      const keys = Object.keys(process.env).join(", ");
      logger.info(`Env Keys ${keys}`);
      logger.info(`Server listening on PORT: ${PORT}, NODE_ENV: ${NODE_ENV}`);
    });
  })
  .catch((error) => {
    logger.error("Server initialization error", error);
  });

process.on("exit", function () {
  logger.info(`Server Stopped`);
});
