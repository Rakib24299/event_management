const Notification = require("../models/Notification");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const {
    getIO,
} = require("../config/socket");


// SOCKET EMIT HELPER
//
// Sends a real-time notification to the user's
// Socket.IO room.
//
// Room format:
// user_<userId>
//
// Socket errors must never break the normal
// notification/database operation.

const emitNotification = (
    notification
) => {

    try {

        if (
            !notification ||
            !notification.user
        ) {
            return;
        }


        const io =
            getIO();


        if (!io) {

            console.warn(
                "⚠️ Socket.IO instance is not available."
            );

            return;

        }


        // NOTIFICATION REAL TIME
        //REAL TIME NOTIFICATION

        const userId =
            notification.user.toString();

// notificaton for user
        const roomName =
            `user_${userId}`;

// notification for user

        io.to(roomName).emit( "newNotification",  notification  );


        console.log(
            `🔔 Real-time notification sent to ${roomName}`
        );


    } catch (socketError) {

        console.error(
            "❌ Socket notification emit failed:",
            socketError.message
        );

    }

};


// CREATE SINGLE NOTIFICATION
//CREATE NOTIFICATION

const createNotification =
    async (
        payload
    ) => {

        const notification =
            await Notification.create({

                user:
                    payload.user,

                title:
                    payload.title,

                message:
                    payload.message,

                type:
                    payload.type || "system",

                isRead:
                    false,

            });


        // REAL-TIME NOTIFICATION
        

        emitNotification(
            notification
        );


        return notification;

    };


// GET MY NOTIFICATIONS

const getMyNotifications =
    async (
        userId
    ) => {

        const notifications =
            await Notification.find({

                user:
                    userId,

            })
                .sort({

                    createdAt:
                        -1,

                });


        return notifications;

    };


// GET NOTIFICATION BY ID

const getNotificationById =
    async (
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


// MARK AS READ

const markAsRead =
    async (
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


        if (
            notification.isRead
        ) {

            throw new AppError(
                "Notification is already marked as read.",
                400
            );

        }


        notification.isRead =
            true;


        await notification.save();


        return {

            message:
                "Notification marked as read.",

        };

    };


// MARK ALL AS READ

const markAllAsRead =
    async (
        userId
    ) => {

        await Notification.updateMany(

            {
                user:
                    userId,

                isRead:
                    false,

            },

            {
                isRead:
                    true,

            }

        );


        return {

            message:
                "All notifications marked as read.",

        };

    };


// DELETE MY NOTIFICATION

const deleteNotification =
    async (
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


// CREATE BULK NOTIFICATIONS

const createBulkNotifications =
    async ({
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
            users.map(
                (userId) => ({

                    user:
                        userId,

                    title:
                        title,

                    message:
                        message,

                    type:
                        type ||
                        "system",

                    isRead:
                        false,

                })
            );


        const createdNotifications =
            await Notification.insertMany(
                notifications
            );


        // REAL-TIME BULK NOTIFICATION
        //
        // Every created notification is sent to the
        // corresponding user's room.

        for (
            const notification
            of createdNotifications
        ) {

            emitNotification(
                notification
            );

        }


        return createdNotifications;

    };


// ADMIN: GET ALL NOTIFICATIONS

const getAllNotifications =
    async () => {

        const notifications =
            await Notification.find()

                .populate(
                    "user",
                    "name email role profileImage"
                )

                .sort({

                    createdAt:
                        -1,

                });


        return notifications;

    };


// ADMIN: GET NOTIFICATION STATISTICS

const getNotificationStats =
    async () => {

        const total =
            await Notification.countDocuments();


        const read =
            await Notification.countDocuments({

                isRead:
                    true,

            });


        const unread =
            await Notification.countDocuments({

                isRead:
                    false,

            });


        return {

            total,

            read,

            unread,

        };

    };


// ADMIN: SEND NOTIFICATION
//ADMIN NOTIFICATION

const sendAdminNotification =
    async ({
        recipientType,
        userId,
        title,
        message,
        type,
    }) => {

        // VALIDATE TITLE

        if (
            !title ||
            !title.trim()
        ) {

            throw new AppError(
                "Notification title is required.",
                400
            );

        }


        // VALIDATE MESSAGE

        if (
            !message ||
            !message.trim()
        ) {

            throw new AppError(
                "Notification message is required.",
                400
            );

        }


        // SPECIFIC USER

        if (
            recipientType ===
            "user"
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

//NOTIFICATION DATABASE
            const notification =
                await createNotification({

                    user:
                        user._id,

                    title:
                        title.trim(),

                    message:
                        message.trim(),

                    type:
                        type ||
                        "system",

                });


            return {

                recipientCount:
                    1,

                notifications: [

                    notification,

                ],

            };

        }


        // SELECT RECIPIENTS

        let userQuery =
            {};


        if (
            recipientType ===
            "all-users"
        ) {

            userQuery = {

                role:
                    "user",

            };

        }


        else if (
            recipientType ===
            "all-organizers"
        ) {

            userQuery = {

                role:
                    "organizer",

            };

        }


        else if (
            recipientType ===
            "all"
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


        // FIND USERS

        const users =
            await User.find(
                userQuery
            )
                .select(
                    "_id"
                );


        if (
            users.length ===
            0
        ) {

            return {

                recipientCount:
                    0,

                notifications:
                    [],

            };

        }


        // EXTRACT USER IDS

        const userIds =
            users.map(
                (user) =>
                    user._id
            );


        // BULK CREATE

        const notifications =
            await createBulkNotifications({

                users:
                    userIds,

                title:
                    title.trim(),

                message:
                    message.trim(),

                type:
                    type ||
                    "system",

            });


        return {

            recipientCount:
                notifications.length,

            notifications,

        };

    };


// GET UNREAD COUNT

const getUnreadCount =
    async (
        userId
    ) => {

        const count =
            await Notification.countDocuments({

                user:
                    userId,

                isRead:
                    false,

            });


        return {

            unreadCount:
                count,

        };

    };


// ADMIN: DELETE NOTIFICATION

const deleteNotificationByAdmin =
    async (
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


// EXPORT

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