import { Sequelize } from 'sequelize';
import { DATABASE_URL } from "config";
import { logger } from "services/logger";

console.log(DATABASE_URL);
export const sequelize = new Sequelize(DATABASE_URL ?? "", {
  logging: logger.debug.bind(logger),
});

sequelize
  .authenticate()
  .then(() =>
    logger.info("Database: connection successful")
  )
  .catch((error) =>
    logger.info("Database: unable to connect", error)
  );
