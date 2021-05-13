import express from "express";
import { ensureAuthenticated } from "server/services/auth";

const router = express.Router();

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.send("Hello");
});

export default router;
