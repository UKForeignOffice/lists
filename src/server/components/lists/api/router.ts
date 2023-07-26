import express from "express";
import cors from "cors";
import { listsApiPostController } from "./controllers";

const apiRouter = express.Router();

apiRouter.post("/api/lists", cors(), listsApiPostController);

export default apiRouter;

// TODO put this in middleware
// const secretKey = "my-secret-key";

// const timestamp = req.headers["timestamp"];

// const signature = crypto.createHmac("sha512", secretKey)
// .update(timestamp.toString())
// .digest("hex");

// if (signature !== req.headers["signature"]) {
//   res.status(401).send("Unauthorized");
//   return;
// }
