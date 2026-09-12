const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chat.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");


// Send a message (Admin or Organizer)
router.post(
  "/send",
  authMiddleware,
  chatController.sendMessage
);

// Get 1-on-1 conversation history with a target user
router.get(
  "/conversation/:targetUserId",
  authMiddleware,
  chatController.getConversation
);

// Admin: Get list of all organizers with chat previews & unread counts
router.get(
  "/admin/conversations",
  authMiddleware,
  roleMiddleware("admin"),
  chatController.getAdminOrganizersChatList
);

// Organizer: Get admin support contact and chat history
router.get(
  "/organizer/admin",
  authMiddleware,
  roleMiddleware("organizer"),
  chatController.getOrganizerAdminChat
);

// Mark conversation with a target user as read
router.patch(
  "/read/:targetUserId",
  authMiddleware,
  chatController.markAsRead
);

// Get total unread messages count for current user
router.get(
  "/unread-count",
  authMiddleware,
  chatController.getUnreadCount
);


module.exports = router;
