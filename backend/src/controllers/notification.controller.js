const notificationService = require("../services/notification.service")
const catchAsync = require("../utils/catchAsync");



// Create Notification

const createNotification = catchAsync(async (req, res) => {
  const result = await notificationService.createNotification(req.body);

  return res.status(201).json({
    success: true,
    message: "Notification created successfully.",
    data: result,
  });
});



// Get My Notifications

const getMyNotifications = catchAsync(async (req, res) => {
  const result = await notificationService.getMyNotifications(req.user.id);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// Get Notification By ID

const getNotificationById = catchAsync(async (req, res) => {
  const result = await notificationService.getNotificationById(req.params.id);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// Mark As Read

// Mark As Read

const markAsRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAsRead(
    req.params.id,
    req.user.id
  );

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});


// Mark All As Read

const markAllAsRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});



// Delete Notification

const deleteNotification = catchAsync(async (req, res) => {
  const result = await notificationService.deleteNotification(
    req.params.id,
    req.user.id
  );

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});


module.exports = {
  createNotification,
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};