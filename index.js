import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import usersRouter from "./routes/users.js";
import groceryItemsRouter from "./routes/groceryItems.js";

// import groceryItemsRouter from "./routes/groceryItems.js";

const app = express();
const PORT = process.env.PORT || 5050;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

//Configure session middleware
app.use(
  session({
    secret:"tester123",
    resave:false,
    saveUninitialized:false,
    cookie:{secure:false, httpOnly: true, maxAge: 24 * 60 * 60* 1000}, //24 hr expiry
  }));
  
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// basic home route
app.get("/", (_req, res) => {
  res.send("Hello from server");
});

app.use("/api/users", usersRouter); //Register user routes
app.use("/api/grocery", groceryItemsRouter);

app.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});
