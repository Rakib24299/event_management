require("dotenv").config();


const app = require("./src/app");
const connectDB = require("./src/config/db");
const createDefaultAdmin = require("./src/seed/admin.seed");
const createDefaultCategories = require("./src/seed/category.seed");


// ======================================================
// JOBS
// ======================================================

// Refund Job
const {
  startRefundJob,
} = require("./src/jobs/refund.job");


// Booking OTP Expiry Job
const {
  startBookingExpiryJob,
} = require("./src/jobs/bookingExpiry.job");


const PORT =
  process.env.PORT || 5000;


// ======================================================
// START SERVER
// ======================================================

const startServer = async () => {

  try {

    // ==================================================
    // Connect to MongoDB
    // ==================================================

    await connectDB();


    // ==================================================
    // Create Default Admin
    // ==================================================

    await createDefaultAdmin();


    // ==================================================
    // Create Default Categories
    // ==================================================

    await createDefaultCategories();


    // ==================================================
    // Start Automatic Refund Job
    // ==================================================

    startRefundJob();


    // ==================================================
    // Start Booking OTP Expiry Job
    // ==================================================

    startBookingExpiryJob();


    // ==================================================
    // Start Express Server
    // ==================================================

    app.listen(
      PORT,
      () => {

        console.log(
          `🚀 Server is running on http://localhost:${PORT}`
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


// ======================================================
// RUN SERVER
// ======================================================

startServer();