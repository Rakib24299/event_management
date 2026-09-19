const Payment = require("../models/Payment");
const Booking = require("../models/Booking");


// Automatic Refund Processor
//
// This job checks pending refunds periodically.
//
// User cancellation creates:
// booking.refundStatus = "pending"
//
// This job automatically changes:
// booking.refundStatus = "processed"
// payment.paymentStatus = "refunded"
//
// The job runs every 1 hour.
// Therefore refunds are processed automatically
// without requiring an admin to click a button.


// Process Pending Refunds

const processPendingRefunds = async () => {

  try {

    console.log(
      "[REFUND JOB] Checking pending refunds..."
    );


    // Find pending refund bookings

    const pendingBookings =
      await Booking.find({

        refundStatus: "pending",

        bookingStatus: "cancelled",

        refundAmount: {
          $gt: 0,
        },

      });


    if (
      pendingBookings.length === 0
    ) {

      console.log(
        "[REFUND JOB] No pending refunds found."
      );

      return;

    }


    console.log(
      `[REFUND JOB] Found ${pendingBookings.length} pending refund(s).`
    );


    // Process each refund

    for (
      const booking of pendingBookings
    ) {

      try {

        // Booking must have payment

        if (!booking.payment) {

          console.log(
            `[REFUND JOB] Booking ${booking._id} has no payment reference.`
          );

          continue;

        }


        // Find Payment

        const payment =
          await Payment.findById(
            booking.payment
          );


        if (!payment) {

          console.log(
            `[REFUND JOB] Payment not found for booking ${booking._id}.`
          );

          continue;

        }


        // Already refunded

        if (
          payment.status ===
          "refunded"
        ) {

          booking.refundStatus =
            "processed";

          await booking.save();

          console.log(
            `[REFUND JOB] Booking ${booking._id} already refunded.`
          );

          continue;

        }


        // Payment must be paid

        if (
          payment.status !==
          "paid"
        ) {

          console.log(
            `[REFUND JOB] Payment ${payment._id} is not paid. Status: ${payment.status}`
          );

          continue;

        }


        // Refund amount

        const refundAmount =
          Number(
            booking.refundAmount || 0
          );


        // No refund applicable

        if (
          refundAmount <= 0
        ) {

          booking.refundStatus =
            "none";

          await booking.save();


          payment.status =
            "cancelled";

          payment.refundAmount = 0;

          payment.refundDate = null;

          await payment.save();


          console.log(
            `[REFUND JOB] No refund applicable for booking ${booking._id}.`
          );

          continue;

        }


        // Process Dummy Refund

        payment.status =
          "refunded";

        payment.refundAmount =
          refundAmount;

        payment.refundDate =
          new Date();


        await payment.save();


        // Update Booking

        booking.refundStatus =
          "processed";


        await booking.save();


        console.log(
          `[REFUND JOB] Refund processed successfully. Booking: ${booking._id}, Amount: ৳${refundAmount}`
        );

      }

      catch (error) {

        console.error(
          `[REFUND JOB] Failed to process booking ${booking._id}:`,
          error.message
        );

      }

    }


    console.log(
      "[REFUND JOB] Pending refund check completed."
    );

  }

  catch (error) {

    console.error(
      "[REFUND JOB] Error while checking refunds:",
      error.message
    );

  }

};


// Start Refund Job

const startRefundJob = () => {

  console.log(
    "[REFUND JOB] Automatic refund processor started."
  );


  // Run once when server starts

  processPendingRefunds();


  // 
  // REFUND TIME
  // 

  const ONE_HOUR =
    60 * 60 * 1000;


  setInterval(
    processPendingRefunds,
    ONE_HOUR
  );

};


// Export

module.exports = {

  processPendingRefunds,

  startRefundJob,

};