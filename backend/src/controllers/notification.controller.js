const notificationService =
    require("../services/notification.service");

const catchAsync =
    require("../utils/catchAsync");


// ======================================================
// CREATE NOTIFICATION
// ======================================================

const createNotification =
    catchAsync(async (req, res) => {

        const result =
            await notificationService.createNotification(
                req.body
            );


        return res.status(201).json({

            success: true,

            message:
                "Notification created successfully.",

            data: result,

        });

    });


// ======================================================
// GET MY NOTIFICATIONS
// ======================================================

const getMyNotifications =
    catchAsync(async (req, res) => {

        const result =
            await notificationService.getMyNotifications(
                req.user.id
            );


        return res.status(200).json({

            success: true,

            data: result,

        });

    });


// ======================================================
// GET NOTIFICATION BY ID
// ======================================================

const getNotificationById =
    catchAsync(async (req, res) => {

        const result =
            await notificationService.getNotificationById(
                req.params.id
            );


        return res.status(200).json({

            success: true,

            data: result,

        });

    });


// ======================================================
// MARK AS READ
// ======================================================

const markAsRead =
    catchAsync(async (req, res) => {

        const result =
            await notificationService.markAsRead(

                req.params.id,

                req.user.id

            );


        return res.status(200).json({

            success: true,

            message: result.message,

        });

    });


// ======================================================
// MARK ALL AS READ
// ======================================================

const markAllAsRead =
    catchAsync(async (req, res) => {

        const result =
            await notificationService.markAllAsRead(
                req.user.id
            );


        return res.status(200).json({

            success: true,

            message: result.message,

        });

    });


// ======================================================
// DELETE MY NOTIFICATION
// ======================================================

const deleteNotification =
    catchAsync(async (req, res) => {

        const result =
            await notificationService.deleteNotification(

                req.params.id,

                req.user.id

            );


        return res.status(200).json({

            success: true,

            message: result.message,

        });

    });


// ======================================================
// GET UNREAD COUNT
// ======================================================

const getUnreadCount =
    catchAsync(async (req, res) => {

        const result =
            await notificationService.getUnreadCount(
                req.user.id
            );


        return res.status(200).json({

            success: true,

            data: result,

        });

    });


// ======================================================
// ADMIN: GET ALL NOTIFICATIONS
// ======================================================

const getAllNotifications =
    catchAsync(async (req, res) => {

        const result =
            await notificationService.getAllNotifications();


        return res.status(200).json({

            success: true,

            message:
                "All notifications fetched successfully.",

            data: result,

        });

    });


// ======================================================
// ADMIN: GET NOTIFICATION STATS
// ======================================================

const getNotificationStats =
    catchAsync(async (req, res) => {

        const result =
            await notificationService.getNotificationStats();


        return res.status(200).json({

            success: true,

            message:
                "Notification statistics fetched successfully.",

            data: result,

        });

    });


// ======================================================
// ADMIN: SEND NOTIFICATION
// ======================================================

const sendAdminNotification =
    catchAsync(async (req, res) => {

        const result =
            await notificationService.sendAdminNotification(
                req.body
            );


        return res.status(201).json({

            success: true,

            message:
                "Notification sent successfully.",

            data: result,

        });

    });


// ======================================================
// ADMIN: DELETE NOTIFICATION
// ======================================================

const deleteNotificationByAdmin =
    catchAsync(async (req, res) => {

        const result =
            await notificationService.deleteNotificationByAdmin(
                req.params.id
            );


        return res.status(200).json({

            success: true,

            message: result.message,

        });

    });


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createNotification,

    getMyNotifications,

    getNotificationById,

    markAsRead,

    markAllAsRead,

    deleteNotification,

    getAllNotifications,

    getNotificationStats,

    sendAdminNotification,

    deleteNotificationByAdmin,

    getUnreadCount,

};