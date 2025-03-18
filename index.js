import "dotenv/config";
import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";

// import groceryItemsRouter from "./routes/groceryItems.js";

const app = express();
const PORT = process.env.PORT || 5050;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// basic home route
app.get("/", (_req, res) => {
  res.send("Hello from server");
});

app.use("/api/users", usersRouter); //Register user routes

app.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});
