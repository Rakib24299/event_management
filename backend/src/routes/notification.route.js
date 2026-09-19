const express = require("express");

const notificationController =
    require("../controllers/notification.controller");

const authMiddleware =
    require("../middlewares/auth.middleware");

const roleMiddleware =
    require("../middlewares/role.middleware");

const router = express.Router();


// USER ROUTES


// Get My Notifications

router.get(

    "/",

    authMiddleware,

    notificationController.getMyNotifications

);


// Get Unread Count

router.get(

    "/unread-count",

    authMiddleware,

    notificationController.getUnreadCount

);


// Mark All Notifications As Read

router.patch(

    "/mark-all-read",

    authMiddleware,

    notificationController.markAllAsRead

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


// Delete My Notification

router.delete(

    "/:id",

    authMiddleware,

    notificationController.deleteNotification

);


// ADMIN ROUTES


// Get All Notifications

router.get(

    "/admin/all",

    authMiddleware,

    roleMiddleware("admin"),

    notificationController.getAllNotifications

);


// Get Notification Statistics

router.get(

    "/admin/stats",

    authMiddleware,

    roleMiddleware("admin"),

    notificationController.getNotificationStats

);


// Send Notification From Admin

router.post(

    "/admin/send",

    authMiddleware,

    roleMiddleware("admin"),

    notificationController.sendAdminNotification

);


// Delete Notification From Admin

router.delete(

    "/admin/:id",

    authMiddleware,

    roleMiddleware("admin"),

    notificationController.deleteNotificationByAdmin

);


module.exports = router;