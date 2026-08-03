const express = require("express");

const notificationController = require("../controllers/notification.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();


// Get My Notifications

router.get(
  "/",
  authMiddleware,
  notificationController.getMyNotifications
);

// Get Notification By ID

router.get(
  "/:id",
  authMiddleware,
  notificationController.getNotificationById
);

// Mark Notification As Read

router.patch(
  "/:id/read",
  authMiddleware,
  notificationController.markAsRead
);

// Mark All Notifications As Read

router.patch(
  "/mark-all-read",
  authMiddleware,
  notificationController.markAllAsRead
);

// Delete Notification

router.delete(
  "/:id",
  authMiddleware,
  notificationController.deleteNotification
);

module.exports = router;