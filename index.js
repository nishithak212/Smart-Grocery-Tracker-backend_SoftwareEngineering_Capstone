import "dotenv/config";
import express from "express";
const app = express();

const PORT = process.env.PORT || 5050;

// basic home route
app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

app.listen(PORT, () => {
  console.log(`running at http://localhost:${PORT}`);
});