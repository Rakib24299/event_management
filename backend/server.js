require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./src/app");
const connectDB = require("./src/config/db");
const createDefaultAdmin = require("./src/seed/admin.seed");
const createDefaultCategories = require("./src/seed/category.seed");

// JOBS

// Refund Job
const {
  startRefundJob,
} = require("./src/jobs/refund.job");

// Booking OTP Expiry Job
const {
  startBookingExpiryJob,
} = require("./src/jobs/bookingExpiry.job");

// Event History Cleanup Job
const {
  startEventHistoryCleanupJob,
} = require("./src/jobs/eventHistoryCleanup.job");

// SOCKET.IO CONFIG

const {
  setIO,
} = require("./src/config/socket");

// PORT

const PORT =
  process.env.PORT || 5000;

// HTTP SERVER

const server =
  http.createServer(app);

// SOCKET.IO

const io =
  new Server(server, {

    cors: {
      origin: "*",

      methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
      ],
    },

  });

// SAVE SOCKET.IO INSTANCE

setIO(io);

// SOCKET CONNECTION

io.on(
  "connection",
  (socket) => {

    console.log(
      `🔌 Socket connected: ${socket.id}`
    );

    // USER ROOM

    socket.on(
      "joinUserRoom",
      (userId) => {

        if (!userId) {
          return;
        }

        const roomName =
          `user_${userId}`;

        socket.join(
          roomName
        );

        console.log(
          `👤 User joined room: ${roomName}`
        );

      }
    );

    // ORGANIZER ROOM

    socket.on(
      "joinOrganizerRoom",
      (organizerId) => {

        if (!organizerId) {
          return;
        }

        const roomName =
          `organizer_${organizerId}`;

        socket.join(
          roomName
        );

        console.log(
          `🏢 Organizer joined room: ${roomName}`
        );

      }
    );

    // ADMIN ROOM

    socket.on(
      "joinAdminRoom",
      () => {

        socket.join(
          "admin_room"
        );

        console.log(
          "👑 Admin joined room"
        );

      }
    );

    // CHAT TYPING INDICATORS

    socket.on(
      "chat:typing",
      (data) => {
        if (!data || !data.receiverId) return;

        // Emit typing indicator to receiver
        io.to(`user_${data.receiverId}`).emit("chat:typing", {
          senderId: data.senderId,
          senderName: data.senderName,
        });

        if (data.isToAdmin) {
          io.to("admin_room").emit("chat:typing", {
            senderId: data.senderId,
            senderName: data.senderName,
          });
        }
      }
    );

    socket.on(
      "chat:stop_typing",
      (data) => {
        if (!data || !data.receiverId) return;

        io.to(`user_${data.receiverId}`).emit("chat:stop_typing", {
          senderId: data.senderId,
        });

        if (data.isToAdmin) {
          io.to("admin_room").emit("chat:stop_typing", {
            senderId: data.senderId,
          });
        }
      }
    );

    // DISCONNECT

    socket.on(
      "disconnect",
      () => {

        console.log(
          `🔌 Socket disconnected: ${socket.id}`
        );

      }
    );

  }
);

// START SERVER

const startServer =
  async () => {

    try {

      // CONNECT MONGODB

      await connectDB();

      // CREATE DEFAULT ADMIN

      await createDefaultAdmin();

      // CREATE DEFAULT CATEGORIES

      await createDefaultCategories();

      // START REFUND JOB

      startRefundJob();

      // START BOOKING EXPIRY JOB

      startBookingExpiryJob();

      // START EVENT HISTORY CLEANUP JOB

      startEventHistoryCleanupJob();

      // START HTTP + SOCKET.IO SERVER

      server.listen(
        PORT,
        () => {

          console.log(
            `🚀 Server is running on http://localhost:${PORT}`
          );

          console.log(
            `🔌 Socket.IO is running on port ${PORT}`
          );

        }
      );

    } catch (error) {

      console.error(
        "❌ Failed to start server:",
        error.message
      );

      process.exit(1);

    }

  };

// RUN SERVER

startServer();

// EXPORT

module.exports = {
  server,
  io,
};