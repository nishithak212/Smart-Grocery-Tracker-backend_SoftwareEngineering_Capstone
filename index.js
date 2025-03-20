import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import usersRouter from "./routes/users.js";
import groceryItemsRouter from "./routes/groceryItems.js";
import shoppingListRouter from "./routes/shoppingList-routes.js";
import notificationsRouter from "./routes/notifications-routes.js";
import { runNotificationScheduler } from "./schedulers/notificationScheduler.js";

// import groceryItemsRouter from "./routes/groceryItems.js";

runNotificationScheduler();
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

//Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    }, //24 hr validity
  })
);

app.use((req, res, next) => {
  console.log("Session Data:", req.session);
  next();
});

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
