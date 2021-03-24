import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize"

export class User extends Model {}

User.init(
  {
    firstName: DataTypes.TEXT,
    lastName: DataTypes.TEXT,
  },
  { sequelize }
);

console.log("XXXCXCXCXCX")

User.sync({force: true})
  .then(() => console.log("BBBB"))
  .catch((err) => console.log("BBBB", err))

const user = User.build({ firstname: "Jane", lastname: "Doe" });