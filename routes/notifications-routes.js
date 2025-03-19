import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import * as notificationsController from "../controllers/notifications-controller.js";

const router = express.Router();

//Get unread notifications
router.route("/").get(authenticateUser, notificationsController.getNotifications);

//Mark notifications as read
router.route("/mark-read").put(authenticateUser, notificationsController.markNotificationsAsRead);

//Delete a single notification
router.route("/:id").delete(authenticateUser, notificationsController.deleteNotification);



export default router;