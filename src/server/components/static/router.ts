import express from "express";
export const staticRouter = express.Router();

/**
 * For pages that do not need a controller
 **/

const STATIC_DIR = "static";

staticRouter.get("/privacy", (req, res) => {
  return res.render(`${STATIC_DIR}/privacy-notice`);
});
