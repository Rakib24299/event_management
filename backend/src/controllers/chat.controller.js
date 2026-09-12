const chatService = require("../services/chat.service");
const catchAsync = require("../utils/catchAsync");


// ======================================================
// Send Message
// ======================================================

const sendMessage = catchAsync(async (req, res) => {
  const { receiverId, text } = req.body;
  const senderId = req.user.id || req.user._id;

  const result = await chatService.sendMessage({
    senderId,
    receiverId,
    text,
  });

  return res.status(201).json({
    success: true,
    message: "Message sent successfully.",
    data: result,
  });
});


// ======================================================
// Get 1-on-1 Conversation
// ======================================================

const getConversation = catchAsync(async (req, res) => {
  const currentUserId = req.user.id || req.user._id;
  const { targetUserId } = req.params;

  const result = await chatService.getConversation(currentUserId, targetUserId);

  return res.status(200).json({
    success: true,
    data: result,
  });
});


// ======================================================
// Get Admin's Organizers Chat List
// ======================================================

const getAdminOrganizersChatList = catchAsync(async (req, res) => {
  const adminId = req.user.id || req.user._id;

  const result = await chatService.getAdminOrganizersChatList(adminId);

  return res.status(200).json({
    success: true,
    data: result,
  });
});


// ======================================================
// Get Organizer's Chat with Admin
// ======================================================

const getOrganizerAdminChat = catchAsync(async (req, res) => {
  const organizerId = req.user.id || req.user._id;

  const result = await chatService.getOrganizerAdminChat(organizerId);

  return res.status(200).json({
    success: true,
    data: result,
  });
});


// ======================================================
// Mark Conversation As Read
// ======================================================

const markAsRead = catchAsync(async (req, res) => {
  const currentUserId = req.user.id || req.user._id;
  const { targetUserId } = req.params;

  const result = await chatService.markAsRead(currentUserId, targetUserId);

  return res.status(200).json({
    success: true,
    message: "Messages marked as read.",
    data: result,
  });
});


// ======================================================
// Get Unread Count
// ======================================================

const getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user.id || req.user._id;

  const result = await chatService.getUnreadCount(userId);

  return res.status(200).json({
    success: true,
    data: result,
  });
});


module.exports = {
  sendMessage,
  getConversation,
  getAdminOrganizersChatList,
  getOrganizerAdminChat,
  markAsRead,
  getUnreadCount,
};
