const Payment =
  require("../models/Payment");

const Booking =
  require("../models/Booking");

const Event =
  require("../models/Event");

const User =
  require("../models/User");

const sendEmail =
  require("../utils/sendEmail");

const {
  createSSLSession,
  validateSSLPayment,
} =
  require("./ssl.service");


// ======================================================
// ERROR HELPER
// ======================================================

const createError =
  (
    message,
    statusCode
  ) => {

    const error =
      new Error(message);

    error.statusCode =
      statusCode;

    return error;

  };


// ======================================================
// TRANSACTION ID
// ======================================================

const generateTransactionId =
  () => {

    return `EE${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`;

  };


// ======================================================
// BOOKING OTP
// ======================================================

const generateBookingOtp =
  () => {

    return Math.floor(
      100000 +
      Math.random() * 900000
    ).toString();

  };


// ======================================================
// OTP EXPIRY
// ======================================================

const getOtpExpiry =
  () => {

    return new Date(
      Date.now() +
      5 * 60 * 1000
    );

  };


// ======================================================
// PLATFORM FEE
// ======================================================

const getPlatformFeePercentage =
  () => {

    return Number(
      process.env.PLATFORM_FEE_PERCENTAGE ||
      10
    );

  };


// ======================================================
// CREATE PAYMENT
// ======================================================

const createPayment =
  async (
    userId,
    paymentData
  ) => {

    const {
      booking:
        bookingId,
    } =
      paymentData || {};


    if (!bookingId) {

      throw createError(
        "Booking ID is required.",
        400
      );

    }


    const booking =
      await Booking.findById(
        bookingId
      )
        .populate("event")
        .populate(
          "user",
          "name email phone address"
        );


    if (!booking) {

      throw createError(
        "Booking not found.",
        404
      );

    }


    // --------------------------------------------------
    // OWNER CHECK
    // --------------------------------------------------

    if (
      booking.user._id.toString() !==
      userId.toString()
    ) {

      throw createError(
        "You are not authorized to create payment for this booking.",
        403
      );

    }


    // --------------------------------------------------
    // BOOKING STATUS
    // --------------------------------------------------

    if (
      booking.bookingStatus !==
      "pending"
    ) {

      throw createError(
        "Payment can only be created for a pending booking.",
        400
      );

    }


    // --------------------------------------------------
    // EVENT
    // --------------------------------------------------

    if (!booking.event) {

      throw createError(
        "Event not found.",
        404
      );

    }


    // --------------------------------------------------
    // FREE EVENT
    // --------------------------------------------------

    if (
      booking.event.eventType ===
      "free"
    ) {

      throw createError(
        "Payment is not required for a free event.",
        400
      );

    }


    // --------------------------------------------------
    // AMOUNT
    // --------------------------------------------------

    const totalAmount =
      Number(
        booking.totalAmount || 0
      );


    if (
      !Number.isFinite(
        totalAmount
      ) ||
      totalAmount < 10
    ) {

      throw createError(
        "Payment amount must be at least 10 BDT for SSLCOMMERZ.",
        400
      );

    }


    // --------------------------------------------------
    // EXISTING PAYMENT
    // --------------------------------------------------

    let payment = null;


    if (booking.payment) {

      payment =
        await Payment.findById(
          booking.payment
        );

    }


    // --------------------------------------------------
    // CREATE PAYMENT
    // --------------------------------------------------

    if (!payment) {

      const feePercentage =
        getPlatformFeePercentage();


      const platformFee =
        Number(
          (
            totalAmount *
            feePercentage /
            100
          ).toFixed(2)
        );


      const organizerAmount =
        Number(
          (
            totalAmount -
            platformFee
          ).toFixed(2)
        );


      payment =
        await Payment.create({

          user:
            userId,

          booking:
            booking._id,

          event:
            booking.event._id,

          organizer:
            booking.event.organizer,

          grossAmount:
            totalAmount,

          platformFee:
            platformFee,

          organizerAmount:
            organizerAmount,

          paymentMethod:
            "sslcommerz",

          status:
            "pending",

          refundAmount:
            0,

          refundStatus:
            "none",

          transactionId:
            generateTransactionId(),

        });


      booking.payment =
        payment._id;

      await booking.save();

    }


    // --------------------------------------------------
    // EXISTING PAYMENT STATUS CHECK
    // --------------------------------------------------
    // If a paid payment already exists but the booking
    // is still pending (OTP not yet verified), we allow
    // the payment flow to continue. finalizeSSLPayment
    // safely returns alreadyProcessed=true for a
    // duplicate VALID gateway response, so no double
    // charge can occur. This lets users with an expired
    // OTP after payment retry/re-enter the flow.
    // --------------------------------------------------

    if (
      payment.status ===
      "paid"
    ) {

      // Allow flow to continue; finalizeSSLPayment
      // will return alreadyProcessed=true if the
      // gateway responds VALID again.

    }


    // --------------------------------------------------
    // RESET FAILED / CANCELLED PAYMENT
    // --------------------------------------------------

    if (
      payment.status ===
        "failed" ||
      payment.status ===
        "cancelled"
    ) {

      payment.status =
        "pending";

      payment.paymentMethod =
        "sslcommerz";

      payment.transactionId =
        generateTransactionId();

      payment.paidAt =
        null;

      payment.refundAmount =
        0;

      payment.refundStatus =
        "none";

      payment.refundedAt =
        null;

      payment.gatewayResponse =
        null;

      await payment.save();

    }


    // --------------------------------------------------
    // ENSURE TRANSACTION ID
    // --------------------------------------------------

    if (
      !payment.transactionId
    ) {

      payment.transactionId =
        generateTransactionId();

      await payment.save();

    }


    // --------------------------------------------------
    // CREATE SSL SESSION
    // --------------------------------------------------

    const sslResponse =
      await createSSLSession({

        payment,

        booking,

      });


    // --------------------------------------------------
    // SAVE SESSION INFORMATION
    // --------------------------------------------------

    payment.sessionKey =
      sslResponse.sessionkey ||
      null;

    payment.gatewayResponse = {

      type:
        "sslcommerz",

      status:
        "session_created",

      sessionkey:
        sslResponse.sessionkey ||
        null,

      tran_id:
        payment.transactionId,

      createdAt:
        new Date(),

    };

    await payment.save();


    return {

      payment,

      gatewayPageURL:
        sslResponse.GatewayPageURL,

      sessionkey:
        sslResponse.sessionkey ||
        null,

      transactionId:
        payment.transactionId,

    };

  };


// ======================================================
// FINALIZE SSL PAYMENT
// ======================================================

const finalizeSSLPayment =
  async (
    payload
  ) => {

    if (!payload) {

      throw createError(
        "Payment response is empty.",
        400
      );

    }


    const valId =
      payload.val_id;


    const tranId =
      payload.tran_id;


    if (!valId) {

      throw createError(
        "SSLCommerz validation ID is missing.",
        400
      );

    }


    if (!tranId) {

      throw createError(
        "SSLCommerz transaction ID is missing.",
        400
      );

    }


    // --------------------------------------------------
    // VALIDATE WITH SSL
    // --------------------------------------------------

    const validation =
      await validateSSLPayment(
        valId
      );


    if (
      validation.status !==
        "VALID" &&
      validation.status !==
        "VALIDATED"
    ) {

      throw createError(
        "SSLCommerz payment validation failed.",
        400
      );

    }


    // --------------------------------------------------
    // FIND PAYMENT
    // --------------------------------------------------

    const payment =
      await Payment.findOne({
        transactionId:
          tranId,
      });


    if (!payment) {

      throw createError(
        "Payment record not found for this transaction.",
        404
      );

    }


    // --------------------------------------------------
    // ALREADY PAID
    // --------------------------------------------------

    if (
      payment.status ===
      "paid"
    ) {

      return {

        payment,

        booking:
          await Booking.findById(
            payment.booking
          ),

        alreadyProcessed:
          true,

      };

    }


    // --------------------------------------------------
    // VERIFY TRANSACTION ID
    // --------------------------------------------------

    if (
      validation.tran_id !==
      payment.transactionId
    ) {

      throw createError(
        "Transaction ID verification failed.",
        400
      );

    }


    // --------------------------------------------------
    // VERIFY AMOUNT
    // --------------------------------------------------

    const databaseAmount =
      Number(
        payment.grossAmount
      );

    const gatewayAmount =
      Number(
        validation.amount
      );


    if (
      !Number.isFinite(
        gatewayAmount
      ) ||
      gatewayAmount !==
        databaseAmount
    ) {

      throw createError(
        "Payment amount verification failed.",
        400
      );

    }


    // --------------------------------------------------
    // VERIFY CURRENCY
    // --------------------------------------------------

    if (
      validation.currency &&
      validation.currency !==
        "BDT"
    ) {

      throw createError(
        "Payment currency verification failed.",
        400
      );

    }


    // --------------------------------------------------
    // FIND BOOKING
    // --------------------------------------------------

    const booking =
      await Booking.findById(
        payment.booking
      );


    if (!booking) {

      throw createError(
        "Booking not found.",
        404
      );

    }


    if (
      booking.bookingStatus ===
      "cancelled"
    ) {

      throw createError(
        "This booking has already been cancelled.",
        400
      );

    }


    // --------------------------------------------------
    // UPDATE PAYMENT
    // --------------------------------------------------

    payment.status =
      "paid";

    payment.paymentMethod =
      "sslcommerz";

    payment.transactionId =
      validation.tran_id;

    payment.validationId =
      validation.val_id;

    payment.paidAt =
      new Date();

    payment.gatewayResponse = {

      type:
        "sslcommerz",

      status:
        validation.status,

      val_id:
        validation.val_id,

      tran_id:
        validation.tran_id,

      amount:
        validation.amount,

      currency:
        validation.currency,

      bank_tran_id:
        validation.bank_tran_id ||
        null,

      card_type:
        validation.card_type ||
        null,

      card_brand:
        validation.card_brand ||
        null,

      card_issuer:
        validation.card_issuer ||
        null,

      risk_level:
        validation.risk_level ||
        null,

      risk_title:
        validation.risk_title ||
        null,

      validatedAt:
        new Date(),

    };


    await payment.save();
        // --------------------------------------------------
    // GENERATE OTP
    // --------------------------------------------------

    const otp =
      generateBookingOtp();

    const otpExpiresAt =
      getOtpExpiry();


    // --------------------------------------------------
    // UPDATE BOOKING
    // --------------------------------------------------

    booking.payment =
      payment._id;

    booking.bookingOtp =
      otp;

    booking.bookingOtpExpires =
      otpExpiresAt;

    booking.isOtpVerified =
      false;

    booking.bookingStatus =
      "pending";


    await booking.save();


    // --------------------------------------------------
    // USER
    // --------------------------------------------------

    const user =
      await User.findById(
        payment.user
      ).select(
        "name email"
      );


    if (user?.email) {

      try {

        await sendEmail({

          to:
            user.email,

          subject:
            "EventEase Booking Verification OTP",

          text:
            `Your EventEase booking verification OTP is ${otp}. This OTP is valid for 5 minutes.`,

          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">

              <h2>EventEase Booking Verification</h2>

              <p>Hello ${user.name || "User"},</p>

              <p>
                Your SSLCOMMERZ payment was successful.
                Please use the following OTP to confirm your booking:
              </p>

              <h1 style="letter-spacing:8px">
                ${otp}
              </h1>

              <p>
                This OTP is valid for 5 minutes.
              </p>

              <p>
                If you did not make this booking,
                please contact EventEase support.
              </p>

            </div>
          `,

        });

      }
      catch (error) {

        console.error(
          "Booking OTP email failed:",
          error.message
        );

      }

    }


    // --------------------------------------------------
    // UPDATED BOOKING
    // --------------------------------------------------

    const updatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          "user",
          "name email profileImage"
        )
        .populate({

          path:
            "event",

          populate: [

            {

              path:
                "organizer",

              select:
                "name email organizationName organizationLogo",

            },

            {

              path:
                "category",

              select:
                "name",

            },

          ],

        })
        .populate(
          "payment"
        );


    return {

      payment,

      booking:
        updatedBooking,

      otp,

      otpExpiresAt,

      alreadyProcessed:
        false,

    };

  };


// ======================================================
// HANDLE SSL FAIL
// ======================================================

const handleSSLFail =
  async (
    payload
  ) => {

    const tranId =
      payload?.tran_id;


    if (!tranId) {

      return null;

    }


    const payment =
      await Payment.findOne({
        transactionId:
          tranId,
      });


    if (!payment) {

      return null;

    }


    if (
      payment.status ===
      "paid"
    ) {

      return payment;

    }


    payment.status =
      "failed";

    payment.paymentMethod =
      "sslcommerz";

    payment.gatewayResponse = {

      type:
        "sslcommerz",

      status:
        "FAILED",

      payload,

      processedAt:
        new Date(),

    };


    await payment.save();


    return payment;

  };


// ======================================================
// HANDLE SSL CANCEL
// ======================================================

const handleSSLCancel =
  async (
    payload
  ) => {

    const tranId =
      payload?.tran_id;


    if (!tranId) {

      return null;

    }


    const payment =
      await Payment.findOne({
        transactionId:
          tranId,
      });


    if (!payment) {

      return null;

    }


    if (
      payment.status ===
      "paid"
    ) {

      return payment;

    }


    payment.status =
      "cancelled";

    payment.paymentMethod =
      "sslcommerz";

    payment.gatewayResponse = {

      type:
        "sslcommerz",

      status:
        "CANCELLED",

      payload,

      processedAt:
        new Date(),

    };


    await payment.save();


    return payment;

  };


// ======================================================
// HANDLE SSL IPN
// ======================================================

const handleSSLIPN =
  async (
    payload
  ) => {

    if (!payload) {

      throw createError(
        "IPN payload is empty.",
        400
      );

    }


    const status =
      String(
        payload.status ||
        ""
      ).toUpperCase();


    if (
      status ===
        "FAILED" ||
      status ===
        "CANCELLED" ||
      status ===
        "EXPIRED" ||
      status ===
        "UNATTEMPTED"
    ) {

      if (
        status ===
        "CANCELLED"
      ) {

        return await handleSSLCancel(
          payload
        );

      }


      return await handleSSLFail(
        payload
      );

    }


    if (
      status !==
      "VALID"
    ) {

      return null;

    }


    return await finalizeSSLPayment(
      payload
    );

  };


// ======================================================
// GET PAYMENT BY ID
// ======================================================

const getPaymentById =
  async (
    paymentId,
    userId
  ) => {

    const payment =
      await Payment.findById(
        paymentId
      )
        .populate(
          "user",
          "name email profileImage"
        )
        .populate("event")
        .populate("booking")
        .populate(
          "organizer",
          "name email organizationName organizationLogo"
        );


    if (!payment) {

      throw createError(
        "Payment not found.",
        404
      );

    }


    if (
      payment.user &&
      payment.user._id.toString() ===
        userId.toString()
    ) {

      return payment;

    }


    if (
      payment.organizer &&
      payment.organizer._id.toString() ===
        userId.toString()
    ) {

      return payment;

    }


    throw createError(
      "You are not authorized to view this payment.",
      403
    );

  };


// ======================================================
// GET PAYMENT BY BOOKING
// ======================================================

const getPaymentByBooking =
  async (
    bookingId,
    userId
  ) => {

    const booking =
      await Booking.findById(
        bookingId
      );


    if (!booking) {

      throw createError(
        "Booking not found.",
        404
      );

    }


    if (
      booking.user.toString() !==
      userId.toString()
    ) {

      throw createError(
        "You are not authorized to view this payment.",
        403
      );

    }


    if (!booking.payment) {

      return null;

    }


    return await Payment.findById(
      booking.payment
    )
      .populate("event")
      .populate("booking")
      .populate(
        "organizer",
        "name email organizationName organizationLogo"
      );

  };


// ======================================================
// USER REFUND
// ======================================================

const processRefund =
  async (
    paymentId,
    userId
  ) => {

    const payment =
      await Payment.findById(
        paymentId
      );


    if (!payment) {

      throw createError(
        "Payment not found.",
        404
      );

    }


    if (
      payment.user.toString() !==
      userId.toString()
    ) {

      throw createError(
        "You are not authorized to request this refund.",
        403
      );

    }


    if (
      payment.status !==
        "paid" &&
      payment.status !==
        "partially_refunded"
    ) {

      throw createError(
        "Only paid payments can be refunded.",
        400
      );

    }


    if (
      payment.refundStatus ===
      "processed"
    ) {

      throw createError(
        "This payment has already been refunded.",
        400
      );

    }


    const booking =
      await Booking.findById(
        payment.booking
      );


    if (!booking) {

      throw createError(
        "Booking not found.",
        404
      );

    }


    if (
      booking.bookingStatus !==
      "cancelled"
    ) {

      throw createError(
        "Please cancel the booking before requesting a refund.",
        400
      );

    }


    if (
      Number(
        booking.refundAmount
      ) <= 0
    ) {

      throw createError(
        "No refund is applicable for this booking.",
        400
      );

    }


    payment.refundAmount =
      Number(
        booking.refundAmount
      );

    payment.refundStatus =
      "pending";


    await payment.save();
        booking.refundStatus =
      "pending";


    await booking.save();


    return {

      message:
        "Refund request submitted successfully.",

      payment,

      booking,

    };

  };


// ======================================================
// ORGANIZER PAYMENTS
// ======================================================

const getOrganizerPayments =
  async (
    userId
  ) => {

    return await Payment.find({

      organizer:
        userId,

    })
      .populate(
        "user",
        "name email profileImage"
      )
      .populate(
        "event",
        "title eventDate"
      )
      .populate(
        "booking"
      )
      .sort({
        createdAt:
          -1,
      });

  };


// ======================================================
// ADMIN PAYMENTS
// ======================================================

const getAdminPayments =
  async () => {

    return await Payment.find()
      .populate(
        "user",
        "name email profileImage"
      )
      .populate(
        "organizer",
        "name email organizationName organizationLogo"
      )
      .populate(
        "event",
        "title eventDate"
      )
      .populate(
        "booking"
      )
      .sort({
        createdAt:
          -1,
      });

  };


// ======================================================
// PENDING REFUNDS
// ======================================================

const getPendingRefunds =
  async () => {

    return await Payment.find({

      refundStatus:
        "pending",

    })
      .populate(
        "user",
        "name email profileImage"
      )
      .populate(
        "organizer",
        "name email organizationName organizationLogo"
      )
      .populate(
        "event",
        "title eventDate"
      )
      .populate(
        "booking"
      )
      .sort({
        createdAt:
          -1,
      });

  };


// ======================================================
// ADMIN PROCESS REFUND
// ======================================================

const adminProcessRefund =
  async (
    paymentId
  ) => {

    const payment =
      await Payment.findById(
        paymentId
      );


    if (!payment) {

      throw createError(
        "Payment not found.",
        404
      );

    }


    if (
      payment.refundStatus !==
      "pending"
    ) {

      throw createError(
        "This payment does not have a pending refund.",
        400
      );

    }


    const booking =
      await Booking.findById(
        payment.booking
      );


    if (!booking) {

      throw createError(
        "Booking not found.",
        404
      );

    }


    payment.status =
      payment.refundAmount >=
      payment.grossAmount
        ? "refunded"
        : "partially_refunded";


    payment.refundStatus =
      "processed";

    payment.refundedAt =
      new Date();


    await payment.save();


    booking.refundStatus =
      "processed";


    await booking.save();


    return {

      message:
        "Refund processed successfully.",

      payment,

      booking,

      refundAmount:
        payment.refundAmount,

    };

  };


// ======================================================
// PLATFORM FEE
// ======================================================

module.exports = {

  createPayment,

  finalizeSSLPayment,

  handleSSLFail,

  handleSSLCancel,

  handleSSLIPN,

  getPaymentById,

  getPaymentByBooking,

  processRefund,

  getOrganizerPayments,

  getAdminPayments,

  getPendingRefunds,

  adminProcessRefund,

  getPlatformFeePercentage,

};