import { PORT, NODE_ENV, RATE_LIMITING_ENABLED } from "./config";
import { getServer } from "./server";
import { logger } from "./services/logger";

async function initApp(): Promise<void> {
  const server = await getServer();

  server.listen(PORT, () => {
    logger.info(`Server listening on PORT: ${PORT}, NODE_ENV: ${NODE_ENV}`);
    logger.info(`Rate limiting is ${RATE_LIMITING_ENABLED ? "ENABLED" : "DISABLED"}`);
  });

  process.on("exit", function () {
    logger.info(`Server Stopped`);
  });
}

initApp().catch((error) => {
  logger.error("Server initialization error", error);
  process.exit(1);
});
