import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("home-page.html", {
    title: "Home Page",
  });
});

export default router;
