import { server } from "./server";
import { PORT, NODE_ENV } from "./config";
import { logger } from "./services/logger";
import dotenv from "dotenv";

dotenv.config();

server.listen(PORT, () => {
  logger.info(`Server listening on PORT: ${PORT}, NODE_ENV: ${NODE_ENV}`);
});
