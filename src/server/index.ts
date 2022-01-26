import { PORT, NODE_ENV } from "./config";
import { getServer } from "./server";
import { logger } from "./services/logger";
import { startFormRunner } from "server/components/formRunner";

async function initApp(): Promise<void> {
  await startFormRunner();
  const server = await getServer();

  server.listen(PORT, () => {
    logger.info(`Server listening on PORT: ${PORT}, NODE_ENV: ${NODE_ENV}`);
  });

  process.on("exit", function () {
    logger.info(`Server Stopped`);
  });
}
initApp().catch((error) => {
  logger.error("Server initialization error", error);
  process.exit(1);
});
