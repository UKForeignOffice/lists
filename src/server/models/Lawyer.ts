import { DataTypes } from "sequelize";
// import { logger } from "services/logger";
import { sequelize } from "./sequelize";
// import { Address } from "./Address"

// Table definition
const Model = sequelize.define(
  "Lawyer",
  {
    contactName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    lawFirmName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    telephone: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    legalAid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    proBonoService: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    modelName: "Lawyer",
    tableName: "lawyer",
  }
);

// associations
// Lawyer.hasOne(Address);

// Lawyer.sync({ force: true })
//   .then(() => logger.warn("Modekkkk"))
//   .catch(error => logger.error("XXXX", error))

export class Lawyer extends Model {
  //  add helpers here
}

