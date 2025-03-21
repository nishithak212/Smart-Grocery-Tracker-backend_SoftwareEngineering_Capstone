import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import * as notificationsController from "../controllers/notifications-controller.js";

const router = express.Router();

//Get unread notifications
router
  .route("/")
  .get(authenticateUser, notificationsController.getNotifications);

//Mark notifications as read
router
  .route("/mark-read/:id")
  .put(authenticateUser, notificationsController.markNotificationsAsRead);

export default router;
