import "dotenv/config";
import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";
import groceryItemsRouter from "./routes/groceryItems.js";
import shoppingListRouter from "./routes/shoppingList-routes.js";
import notificationsRouter from "./routes/notifications-routes.js";
import { scheduler } from "./schedulers/scheduler.js";

scheduler();

const app = express();
const PORT = process.env.PORT || 5050;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

//Enable CORS
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//Middleware to parse JSON requests
app.use(express.json());

// basic home route
app.get("/", (_req, res) => {
  res.send("Hello from server");
});

app.use("/api/users", usersRouter); //Register user routes
app.use("/api/grocery", groceryItemsRouter);
app.use("/api/shopping-list", shoppingListRouter);
app.use("/api/notifications", notificationsRouter);

app.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});
