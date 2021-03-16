import { server } from "./server";
import { PORT, NODE_ENV } from "./config";
import { logger } from "./services/logger";

server.listen(PORT, () => {
  logger.info(`Server listening on PORT: ${PORT}, NODE_ENV: ${NODE_ENV}`);
});
