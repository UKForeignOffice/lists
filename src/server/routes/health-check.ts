import express from "express";

const router = express.Router();

router.get("/health-check", (req, res) => {
  res.send({ status: "OK" });
});

router.get("/ping", (req, res) => {
  res.send({ status: "OK" });
});

export default router;
