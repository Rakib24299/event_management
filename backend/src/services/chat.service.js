const Message = require("../models/Message");
const User = require("../models/User");
const { getIO } = require("../config/socket");


const MAX_CONVERSATION_MESSAGES = parseInt(process.env.MAX_CONVERSATION_MESSAGES, 10) || 50;

// Enforce FIFO Limit (Keep Latest X Messages per Chat)

const enforceFifoLimit = async (user1Id, user2Id, maxLimit = MAX_CONVERSATION_MESSAGES) => {
  try {
    const conversationQuery = {
      $or: [
        { sender: user1Id, receiver: user2Id },
        { sender: user2Id, receiver: user1Id },
      ],
    };

    const count = await Message.countDocuments(conversationQuery);
    if (count > maxLimit) {
      const excess = count - maxLimit;
      const oldestMessages = await Message.find(conversationQuery)
        .sort({ createdAt: 1 })
        .limit(excess)
        .select("_id");

      if (oldestMessages.length > 0) {
        const idsToDelete = oldestMessages.map((m) => m._id);
        await Message.deleteMany({ _id: { $in: idsToDelete } });
      }
    }
  } catch (error) {
    console.error("Error enforcing FIFO message limit:", error.message);
  }
};


// Send Message

const sendMessage = async ({ senderId, receiverId, text }) => {
  if (!text || !text.trim()) {
    throw new Error("Message text is required.");
  }

  // Validate receiver
  const receiver = await User.findById(receiverId).select("name email role profileImage organizationLogo");
  if (!receiver) {
    throw new Error("Receiver not found.");
  }

  const sender = await User.findById(senderId).select("name email role profileImage organizationLogo organizationName");
  if (!sender) {
    throw new Error("Sender not found.");
  }

  // Create message
  const newMessage = await Message.create({
    sender: senderId,
    receiver: receiverId,
    text: text.trim(),
  });

  // Enforce FIFO limit in background (delete oldest messages exceeding limit)
  enforceFifoLimit(senderId, receiverId, MAX_CONVERSATION_MESSAGES);

  const populatedMessage = await Message.findById(newMessage._id)
    .populate("sender", "name email role profileImage organizationLogo organizationName")
    .populate("receiver", "name email role profileImage organizationLogo organizationName");

  // Emit via Socket.IO
  const io = getIO();
  if (io) {
    // Notify receiver
    io.to(`user_${receiverId}`).emit("chat:new_message", populatedMessage);

    // Also notify sender (for other active tabs/devices)
    io.to(`user_${senderId}`).emit("chat:message_sent", populatedMessage);
  }

  return populatedMessage;
};


// Get 1-on-1 Conversation History

const getConversation = async (user1Id, user2Id, { limit = 100 } = {}) => {
  const messages = await Message.find({
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id },
    ],
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate("sender", "name email role profileImage organizationLogo organizationName")
    .populate("receiver", "name email role profileImage organizationLogo organizationName");

  // Mark incoming messages as read
  await Message.updateMany(
    {
      sender: user2Id,
      receiver: user1Id,
      isRead: false,
    },
    {
      $set: { isRead: true, readAt: new Date() },
    }
  );

  return messages;
};


// Get Admin's Organizers Chat List

const getAdminOrganizersChatList = async (adminId) => {
  // Find all organizers
  const organizers = await User.find({ role: "organizer" })
    .select("name email phone address organizationName organizationLogo profileImage status approvalStatus createdAt")
    .lean();

  const organizersWithChat = await Promise.all(
    organizers.map(async (organizer) => {
      // Find latest message
      const latestMessage = await Message.findOne({
        $or: [
          { sender: adminId, receiver: organizer._id },
          { sender: organizer._id, receiver: adminId },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      // Count unread messages from this organizer to admin
      const unreadCount = await Message.countDocuments({
        sender: organizer._id,
        receiver: adminId,
        isRead: false,
      });

      return {
        ...organizer,
        latestMessage: latestMessage ? {
          text: latestMessage.text,
          createdAt: latestMessage.createdAt,
          senderId: latestMessage.sender,
          isRead: latestMessage.isRead,
        } : null,
        unreadCount,
        lastInteraction: latestMessage ? new Date(latestMessage.createdAt) : new Date(organizer.createdAt || 0),
      };
    })
  );

  // Sort by last interaction date (most recent chat first)
  organizersWithChat.sort((a, b) => b.lastInteraction - a.lastInteraction);

  return organizersWithChat;
};


// Get Organizer's Chat with Admin

const getOrganizerAdminChat = async (organizerId) => {
  // Find default admin
  const admin = await User.findOne({ role: "admin" }).select("name email role profileImage").lean();

  if (!admin) {
    throw new Error("Admin support account not found.");
  }

  const messages = await Message.find({
    $or: [
      { sender: organizerId, receiver: admin._id },
      { sender: admin._id, receiver: organizerId },
    ],
  })
    .sort({ createdAt: 1 })
    .limit(100)
    .populate("sender", "name email role profileImage organizationLogo organizationName")
    .populate("receiver", "name email role profileImage organizationLogo organizationName");

  // Mark admin messages as read
  await Message.updateMany(
    {
      sender: admin._id,
      receiver: organizerId,
      isRead: false,
    },
    {
      $set: { isRead: true, readAt: new Date() },
    }
  );

  return {
    admin,
    messages,
  };
};


// Mark Conversation As Read

const markAsRead = async (userId, targetUserId) => {
  const result = await Message.updateMany(
    {
      sender: targetUserId,
      receiver: userId,
      isRead: false,
    },
    {
      $set: { isRead: true, readAt: new Date() },
    }
  );

  const io = getIO();
  if (io) {
    io.to(`user_${targetUserId}`).emit("chat:read_receipt", {
      readBy: userId,
      timestamp: new Date(),
    });
  }

  return result;
};


// Get Unread Messages Count

const getUnreadCount = async (userId) => {
  const count = await Message.countDocuments({
    receiver: userId,
    isRead: false,
  });

  return { unreadCount: count };
};


module.exports = {
  sendMessage,
  getConversation,
  getAdminOrganizersChatList,
  getOrganizerAdminChat,
  markAsRead,
  getUnreadCount,
};
