import express from "express";
import db from "./db";

const app = express();

app.get("/", (req, res) => {
  res.json({
    message: "This is initial setup!",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Running on PORT :${PORT}`);
});
