import { sequelize } from "./sequelize";
import { DataTypes } from "sequelize";
import { logger } from "services/logger";


// Table definition
const Model = sequelize.define(
  "Address",
  {
    firsLine: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    secondLine: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    postCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    modelName: "Address",
    tableName: "address",
  }
);

export class Address extends Model {
  //  add helpers here
}
