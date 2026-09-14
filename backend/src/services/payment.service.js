const PDFDocument = require("pdfkit");

const Booking = require("../models/Booking");

const Event = require("../models/Event");

const User = require("../models/User");

const Payment = require("../models/Payment");

const sendEmail = require("../utils/sendEmail");

const {
  createSSLSession,
  validateSSLPayment,
} = require("./ssl.service");


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
    // BOOKING STATUS CHECK
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
    // ENSURE ORGANIZER
    // --------------------------------------------------

    if (
      !payment.organizer &&
      payment.event
    ) {

      const eventForOrganizer =
        await Event.findById(
          payment.event
        );



      if (
        eventForOrganizer?.organizer
      ) {

        payment.organizer =
          eventForOrganizer.organizer;

      }

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
    // UPDATE BOOKING: CONFIRM BOOKING & GENERATE GATE OTP
    // --------------------------------------------------

    const gateOtp =
      generateBookingOtp();

    booking.payment =
      payment._id;

    booking.bookingOtp =
      gateOtp; // Dynamic 6-digit gate attendance OTP

    booking.bookingOtpExpires =
      null;

    booking.isOtpVerified =
      true;

    booking.bookingStatus =
      "confirmed";

    await booking.save();

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
      booking: updatedBooking,
      otp: gateOtp,
      alreadyProcessed: false,
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

      paymentMethod:
        "sslcommerz",

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
// GET PAYMENT RECEIPT PDF BUFFER
// ======================================================

const getPaymentReceiptPdfBuffer =
  async (bookingId, userId) => {

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw createError("Booking not found.", 404);
    }

    if (booking.user.toString() !== userId.toString()) {
      throw createError(
        "You are not authorized to download this payment receipt.",
        403
      );
    }

    if (!booking.payment) {
      throw createError(
        "No payment record found for this booking.",
        404
      );
    }

    const payment = await Payment.findById(booking.payment)
      .populate("event", "title eventDate venue bannerImage")
      .populate("user", "name email");

    if (!payment) {
      throw createError("Payment not found.", 404);
    }

    if (payment.status !== "paid") {
      throw createError(
        "Payment receipt is only available for paid payments.",
        400
      );
    }

    const event = payment.event || {};
    const user = payment.user || {};
    const transactionId = payment.transactionId || "N/A";
    const validationId = payment.validationId || "";

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const PRIMARY = "#31572c";
    const PRIMARY_LIGHT = "#eaf2e8";
    const DARK = "#111827";
    const GRAY = "#6b7280";
    const LIGHT_GRAY = "#d1d5db";

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;
    let currentY = margin;

    const ensureSpace = (requiredHeight) => {
      if (currentY + requiredHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
    };

    doc.rect(margin, currentY, contentWidth, 70).fill(PRIMARY);
    doc.font("Helvetica-Bold").fontSize(26).fill("#ffffff").text("EventEase", margin + 20, currentY + 18);
    doc.font("Helvetica").fontSize(12).fill("#ffffff").opacity(0.85).text("PAYMENT RECEIPT", margin + 20, currentY + 42);
    doc.opacity(1);
    currentY += 85;

    ensureSpace(50);
    doc.roundedRect(margin, currentY, contentWidth, 36, 6).fill(PRIMARY_LIGHT);
    doc.font("Helvetica-Bold").fontSize(13).fill(PRIMARY).text("Payment Status: PAID", margin, currentY + 10, { width: contentWidth, align: "center" });
    currentY += 50;

    ensureSpace(40);
    doc.font("Helvetica-Bold").fontSize(11).fill(GRAY).text("Event Name", margin, currentY);
    doc.font("Helvetica").fontSize(14).fill(DARK).text(event.title || "Event", margin, currentY + 16, { width: contentWidth });
    currentY += 45;

    ensureSpace(40);
    doc.font("Helvetica-Bold").fontSize(11).fill(GRAY).text("Customer Name", margin, currentY);
    doc.font("Helvetica").fontSize(14).fill(DARK).text(user.name || "Customer", margin, currentY + 16, { width: contentWidth });
    currentY += 45;

    ensureSpace(40);
    doc.font("Helvetica-Bold").fontSize(11).fill(GRAY).text("Booking ID", margin, currentY);
    doc.font("Helvetica").fontSize(14).fill(DARK).text(String(booking._id), margin, currentY + 16, { width: contentWidth });
    currentY += 45;

    ensureSpace(40);
    doc.font("Helvetica-Bold").fontSize(11).fill(GRAY).text("Transaction ID", margin, currentY);
    doc.font("Helvetica").fontSize(14).fill(DARK).text(transactionId, margin, currentY + 16, { width: contentWidth });
    currentY += 45;

    ensureSpace(40);
    const paidAtFormatted = payment.paidAt
      ? new Date(payment.paidAt).toLocaleString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : "Not available";
    doc.font("Helvetica-Bold").fontSize(11).fill(GRAY).text("Payment Date & Time", margin, currentY);
    doc.font("Helvetica").fontSize(14).fill(DARK).text(paidAtFormatted, margin, currentY + 16, { width: contentWidth });
    currentY += 45;

    ensureSpace(40);
    const paymentMethodFormatted = payment.paymentMethod === "sslcommerz" ? "Online (SSLCommerz)" : (payment.paymentMethod || "Online");
    doc.font("Helvetica-Bold").fontSize(11).fill(GRAY).text("Payment Method", margin, currentY);
    doc.font("Helvetica").fontSize(14).fill(DARK).text(paymentMethodFormatted, margin, currentY + 16, { width: contentWidth });
    currentY += 45;

    ensureSpace(40);
    doc.font("Helvetica-Bold").fontSize(11).fill(GRAY).text("Ticket Quantity", margin, currentY);
    doc.font("Helvetica").fontSize(14).fill(DARK).text(String(booking.ticketQuantity || 0), margin, currentY + 16, { width: contentWidth });
    currentY += 45;

    ensureSpace(40);
    const ticketQty = Number(booking.ticketQuantity || 1);
    const totalAmount = Number(booking.totalAmount || 0);
    const pricePerTicket = ticketQty > 0 ? totalAmount / ticketQty : 0;
    const pricePerTicketFormatted = `\u09F3${pricePerTicket.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doc.font("Helvetica-Bold").fontSize(11).fill(GRAY).text("Ticket Price", margin, currentY);
    doc.font("Helvetica").fontSize(14).fill(DARK).text(pricePerTicketFormatted, margin, currentY + 16, { width: contentWidth });
    currentY += 45;

    ensureSpace(40);
    const grossAmountFormatted = `\u09F3${Number(payment.grossAmount || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doc.font("Helvetica-Bold").fontSize(11).fill(GRAY).text("Payment Bill", margin, currentY);
    doc.font("Helvetica-Bold").fontSize(16).fill(PRIMARY).text(grossAmountFormatted, margin, currentY + 16, { width: contentWidth });
    currentY += 50;

    if (validationId) {
      ensureSpace(40);
      doc.font("Helvetica-Bold").fontSize(11).fill(GRAY).text("Payment Validation ID", margin, currentY);
      doc.font("Helvetica").fontSize(14).fill(DARK).text(validationId, margin, currentY + 16, { width: contentWidth });
      currentY += 45;
    }

    ensureSpace(60);
    doc.moveTo(margin, currentY).lineTo(margin + contentWidth, currentY).strokeColor(LIGHT_GRAY).lineWidth(1).stroke();
    currentY += 20;
    doc.font("Helvetica-Bold").fontSize(14).fill(PRIMARY).text("Payment Successful", margin, currentY, { width: contentWidth, align: "center" });
    currentY += 24;
    doc.font("Helvetica").fontSize(11).fill(GRAY).text("Thank you for your booking.", margin, currentY, { width: contentWidth, align: "center" });

    return new Promise((resolve, reject) => {
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () =>
        resolve({
          buffer: Buffer.concat(chunks),
          transactionId,
        })
      );
      doc.on("error", () =>
        reject(createError("Failed to generate payment receipt PDF.", 500))
      );
      doc.end();
    });
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

  getPaymentReceiptPdfBuffer,

};