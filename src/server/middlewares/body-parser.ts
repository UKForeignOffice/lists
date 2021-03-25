import { RequestHandler } from "express";
import bodyParser from "body-parser";

export default (): RequestHandler[] => [
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true }),
];
