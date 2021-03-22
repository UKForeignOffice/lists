import express from "express";
import { prisma } from "../models/prisma-client";
import { populateDb } from "../models/data/populate-database";

const router = express.Router();

router.get("/populate-db", (req, res) => {
  populateDb(prisma)
    .then((result) => {
      res.send({ result });
    })
    .catch((error) => {
      res.send({ error });
    });
});

export default router;
