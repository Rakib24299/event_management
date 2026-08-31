const Notification = require("../models/Notification");
const User = require("../models/User");
const AppError = require("../utils/AppError");


// ======================================================
// CREATE SINGLE NOTIFICATION
// ======================================================

const createNotification = async (payload) => {

    const notification = await Notification.create({

        user: payload.user,

        title: payload.title,

        message: payload.message,

        type: payload.type || "system",

        isRead: false,

    });

    return notification;
};


// ======================================================
// GET MY NOTIFICATIONS
// ======================================================

const getMyNotifications = async (userId) => {

    const notifications = await Notification.find({

        user: userId,

    })
        .sort({
            createdAt: -1,
        });

    return notifications;
};


// ======================================================
// GET NOTIFICATION BY ID
// ======================================================

const getNotificationById = async (
    notificationId
) => {

    const notification =
        await Notification.findById(
            notificationId
        );

    if (!notification) {

        throw new AppError(
            "Notification not found.",
            404
        );

    }

    return notification;
};


// ======================================================
// MARK AS READ
// ======================================================

const markAsRead = async (
    notificationId,
    userId
) => {

    const notification =
        await Notification.findById(
            notificationId
        );

    if (!notification) {

        throw new AppError(
            "Notification not found.",
            404
        );

    }


    if (
        notification.user.toString() !==
        userId.toString()
    ) {

        throw new AppError(
            "You are not authorized to access this notification.",
            403
        );

    }


    if (notification.isRead) {

        throw new AppError(
            "Notification is already marked as read.",
            400
        );

    }


    notification.isRead = true;

    await notification.save();


    return {

        message:
            "Notification marked as read.",

    };

};


// ======================================================
// MARK ALL AS READ
// ======================================================

const markAllAsRead = async (
    userId
) => {

    await Notification.updateMany(

        {
            user: userId,

            isRead: false,
        },

        {
            isRead: true,
        }

    );


    return {

        message:
            "All notifications marked as read.",

    };

};


// ======================================================
// DELETE MY NOTIFICATION
// ======================================================

const deleteNotification = async (
    notificationId,
    userId
) => {

    const notification =
        await Notification.findById(
            notificationId
        );

    if (!notification) {

        throw new AppError(
            "Notification not found.",
            404
        );

    }


    if (
        notification.user.toString() !==
        userId.toString()
    ) {

        throw new AppError(
            "You are not authorized to delete this notification.",
            403
        );

    }


    await notification.deleteOne();


    return {

        message:
            "Notification deleted successfully.",

    };

};


// ======================================================
// CREATE BULK NOTIFICATIONS
// ======================================================

const createBulkNotifications = async ({
    users,
    title,
    message,
    type,
}) => {

    if (
        !users ||
        users.length === 0
    ) {

        return [];

    }


    const notifications =
        users.map((userId) => ({

            user: userId,

            title,

            message,

            type:
                type || "system",

            isRead: false,

        }));


    return await Notification.insertMany(
        notifications
    );

};


// ======================================================
// ADMIN: GET ALL NOTIFICATIONS
// ======================================================

const getAllNotifications = async () => {

    const notifications =
        await Notification.find()

            .populate(
                "user",
                "name email role profileImage"
            )

            .sort({
                createdAt: -1,
            });


    return notifications;
};


// ======================================================
// ADMIN: GET NOTIFICATION STATISTICS
// ======================================================

const getNotificationStats = async () => {

    const total =
        await Notification.countDocuments();


    const read =
        await Notification.countDocuments({

            isRead: true,

        });


    const unread =
        await Notification.countDocuments({

            isRead: false,

        });


    return {

        total,

        read,

        unread,

    };

};


// ======================================================
// ADMIN: SEND NOTIFICATION
// ======================================================

const sendAdminNotification = async ({
    recipientType,
    userId,
    title,
    message,
    type,
}) => {

    // -----------------------------------------------
    // Validate title
    // -----------------------------------------------

    if (
        !title ||
        !title.trim()
    ) {

        throw new AppError(
            "Notification title is required.",
            400
        );

    }


    // -----------------------------------------------
    // Validate message
    // -----------------------------------------------

    if (
        !message ||
        !message.trim()
    ) {

        throw new AppError(
            "Notification message is required.",
            400
        );

    }


    // -----------------------------------------------
    // Specific User
    // -----------------------------------------------

    if (
        recipientType === "user"
    ) {

        if (!userId) {

            throw new AppError(
                "User ID is required.",
                400
            );

        }


        const user =
            await User.findById(
                userId
            );

        if (!user) {

            throw new AppError(
                "User not found.",
                404
            );

        }


        const notification =
            await createNotification({

                user: user._id,

                title: title.trim(),

                message: message.trim(),

                type:
                    type || "system",

            });


        return {

            recipientCount: 1,

            notifications: [
                notification,
            ],

        };

    }


    // -----------------------------------------------
    // Select Recipients
    // -----------------------------------------------

    let userQuery = {};


    if (
        recipientType === "all-users"
    ) {

        userQuery = {

            role: "user",

        };

    }


    else if (
        recipientType === "all-organizers"
    ) {

        userQuery = {

            role: "organizer",

        };

    }


    else if (
        recipientType === "all"
    ) {

        userQuery = {

            role: {
                $in: [
                    "user",
                    "organizer",
                ],
            },

        };

    }


    else {

        throw new AppError(
            "Invalid recipient type.",
            400
        );

    }


    // -----------------------------------------------
    // Find Users
    // -----------------------------------------------

    const users =
        await User.find(
            userQuery
        ).select("_id");


    if (
        users.length === 0
    ) {

        return {

            recipientCount: 0,

            notifications: [],

        };

    }


    // -----------------------------------------------
    // Extract IDs
    // -----------------------------------------------

    const userIds =
        users.map(
            user => user._id
        );


    // -----------------------------------------------
    // Bulk Create
    // -----------------------------------------------

    const notifications =
        await createBulkNotifications({

            users: userIds,

            title: title.trim(),

            message: message.trim(),

            type:
                type || "system",

        });


    return {

        recipientCount:
            notifications.length,

        notifications,

    };

};


// ======================================================
// GET UNREAD COUNT
// ======================================================

const getUnreadCount = async (userId) => {

    const count =
        await Notification.countDocuments({

            user: userId,

            isRead: false,

        });


    return {

        unreadCount: count,

    };

};


// ======================================================
// ADMIN: DELETE NOTIFICATION
// ======================================================

const deleteNotificationByAdmin = async (
    notificationId
) => {

    const notification =
        await Notification.findById(
            notificationId
        );


    if (!notification) {

        throw new AppError(
            "Notification not found.",
            404
        );

    }


    await notification.deleteOne();


    return {

        message:
            "Notification deleted successfully.",

    };

};


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

    createBulkNotifications,

    getAllNotifications,

    getNotificationStats,

    sendAdminNotification,

    deleteNotificationByAdmin,

    getUnreadCount,

};