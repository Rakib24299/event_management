const Notification = require("../models/Notification")


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
  return await Notification.find({
    user: userId,
  }).sort({
    createdAt: -1,
  });
};

// Get Notification By ID

const getNotificationById = async (notificationId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new Error("Notification not found.");
  }

  return notification;
};

// Mark As Read

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new Error("Notification not found.");
  }

  if (notification.user.toString() !== userId.toString()) {
    throw new Error("You are not authorized.");
  }

  notification.isRead = true;

  await notification.save();

  return {
    message: "Notification marked as read.",
  };
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

  return {
    message: "All notifications marked as read.",
  };
};

// Delete Notification

const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new Error("Notification not found.");
  }

  if (notification.user.toString() !== userId.toString()) {
    throw new Error("You are not authorized.");
  }

  await notification.deleteOne();

  return {
    message: "Notification deleted successfully.",
  };
};


module.exports = {
  createNotification,
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};