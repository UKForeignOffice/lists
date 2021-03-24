import { User } from "./User"
import { sequelize } from "./sequelize";
import { logger } from "services/logger";

sequelize
  .sync({ 
    force: true,
    // alter: true,
    logging: console.log 
  })
  .then(() => {
    logger.info("Sequelize sync OK");
    console.log(sequelize.models);
  })
  .catch((error) => {
    logger.error("Sequelize sync error:", error);
  });

export const db = sequelize;

