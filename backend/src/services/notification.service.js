const Notification = require("../models/Notification")
const AppError = require("../utils/AppError");

// Create Notification


const createNotification = async (payload) => {
  const notification = await Notification.create({
    user: payload.user,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    isRead: false,
  });

  return notification;
};

// Get My Notifications

const getMyNotifications = async (userId) => {
  const notifications = await Notification.find({
    user: userId,
  }).sort({
    createdAt: -1,
  });

  return notifications;
};

// Get Notification By ID


const getNotificationById = async (notificationId) => {
  const notification = await Notification.findById(
    notificationId
  );

  if (!notification) {
    throw new AppError("Notification not found.",404);
  }

  return notification;
};
// Mark As Read

const markAsRead = async (
  notificationId,
  userId
) => {
  const notification = await Notification.findById(
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
    throw new AppError("You are not authorized to access this notification.",403);
  }

  if (notification.isRead) {
    throw new AppError("Notification is already marked as read.",400);
  }

  notification.isRead = true;

  await notification.save();

  return {message: "Notification marked as read.",};
};

// Mark All As Read

const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    {
      user: userId,
      isRead: false,
    },
    {
      isRead: true,
    }
  );

  return {message: "All notifications marked as read.",};
};

// Delete Notification

const deleteNotification = async (notificationId,userId) => {
  const notification = await Notification.findById(
    notificationId
  );

  if (!notification) 
  {
    throw new AppError("Notification not found.",404);
  }

  if (notification.user.toString() !==userId.toString())
  {
    throw new AppError("You are not authorized to delete this notification.",403);
  }

  await notification.deleteOne();

  return {message: "Notification deleted successfully.",};
};



//DELETE NOTIFICATION****


const createBulkNotifications = async ({users,title,message,type,}) => {

  if (!users || users.length === 0) {
    return [];
  }

  const notifications = users.map((userId) => ({
    user: userId,
    title,
    message,
    type: type || "system",
    isRead: false,
  }));

  return await Notification.insertMany(
    notifications
  );
};

module.exports = {
  createNotification,
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createBulkNotifications,
};