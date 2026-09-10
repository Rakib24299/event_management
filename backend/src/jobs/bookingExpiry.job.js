const cron = require("node-cron");

const {
  expirePendingBookings,
} = require("../services/booking.service");


// ======================================================
// BOOKING OTP EXPIRY JOB
// ======================================================

const startBookingExpiryJob = () => {

  // Run every 1 minute
  cron.schedule("0 */5 * * * *", async () => {

    try {

      console.log(
        "[BOOKING EXPIRY JOB] Checking expired OTP bookings..."
      );


      const expiredCount =
        await expirePendingBookings();


      if (expiredCount > 0) {

        console.log(
          `[BOOKING EXPIRY JOB] ${expiredCount} expired booking(s) processed.`
        );

      }

    } catch (error) {

      console.error(
        "[BOOKING EXPIRY JOB] Error:",
        error.message
      );

    }

  });


  console.log(
    "[BOOKING EXPIRY JOB] Automatic booking expiry processor started."
  );

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  startBookingExpiryJob,
};