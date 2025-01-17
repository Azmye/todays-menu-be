import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({
    message: "This is initial setup!",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running on PORT :${PORT}`);
});
