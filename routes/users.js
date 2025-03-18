import express from "express";
import * as usersContoller from "../controllers/users-controller.js";

const router = express.Router();

router.route("/register").post(usersContoller.registerUser);

router.route("/login").post(usersContoller.loginUser);

export default router;
