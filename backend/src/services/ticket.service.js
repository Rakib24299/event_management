const PDFDocument = require("pdfkit");

const Booking = require("../models/Booking");

const Event = require("../models/Event");

const User = require("../models/User");

const Payment = require("../models/Payment");

const axios = require("axios");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "--";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue || "--";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateValue) => {
  if (!dateValue) {
    return "--";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue || "--";
  }

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTicketPdfBuffer = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw createError("Booking not found.", 404);
  }

  if (booking.user.toString() !== userId.toString()) {
    throw createError(
      "You are not authorized to download this ticket.",
      403
    );
  }

  if (booking.bookingStatus !== "confirmed") {
    throw createError(
      "Only confirmed bookings can be downloaded as tickets.",
      400
    );
  }

  const populatedBooking = await Booking.findById(bookingId)
    .populate("user", "name email")
    .populate({
      path: "event",
      populate: [
        {
          path: "organizer",
          select: "name organizationName",
        },
        {
          path: "category",
          select: "name",
        },
      ],
    })
    .populate("payment");

  const event = populatedBooking.event || {};
  const user = populatedBooking.user || {};
  const payment = populatedBooking.payment || {};

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  const PRIMARY = "#31572c";
  const PRIMARY_DARK = "#244522";
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

  const ticketType =
    event.eventType === "free" ? "Free Admission" : "Standard";

  const totalAmount = Number(booking.totalAmount || 0);
  const ticketQuantity = Number(booking.ticketQuantity || 1);
  const pricePerTicket =
    ticketQuantity > 0 ? totalAmount / ticketQuantity : 0;

  // HEADER
  // template ticket
  // ticket template

  doc
    .rect(margin, currentY, contentWidth, 70)
    .fill(PRIMARY);

  doc
    .font("Helvetica-Bold")
    .fontSize(26)
    .fill("#ffffff")
    .text("EventEase", margin + 20, currentY + 18);

  doc
    .font("Helvetica")
    .fontSize(12)
    .fill("#ffffff")
    .opacity(0.85)
    .text("EVENT TICKET", margin + 20, currentY + 42);

  doc.opacity(1);
  currentY += 85;

  // EVENT NAME

  ensureSpace(40);

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fill(DARK)
    .text(event.title || "Event", margin, currentY, {
      width: contentWidth,
    });

  currentY += 30;

  doc
    .moveTo(margin, currentY)
    .lineTo(margin + contentWidth, currentY)
    .strokeColor(PRIMARY)
    .lineWidth(2)
    .stroke();

  currentY += 15;

  // BANNER IMAGE

  const bannerHeight = 160;
  let bannerBuffer = null;

  if (event.bannerImage?.url) {
    try {
      const response = await axios.get(event.bannerImage.url, {
        responseType: "arraybuffer",
        timeout: 10000,
      });
      bannerBuffer = Buffer.from(response.data);
    } catch (error) {
      bannerBuffer = null;
    }
  }

  if (bannerBuffer) {
    ensureSpace(bannerHeight + 20);
    doc
      .image(bannerBuffer, {
        x: margin,
        y: currentY,
        width: contentWidth,
        height: bannerHeight,
        fit: [contentWidth, bannerHeight],
        align: "center",
        valign: "center",
      })
      .cover();
    currentY += bannerHeight + 20;
  }

  // EVENT DETAILS

  currentY += 10;

  const detailRows = [
    {
      label: "Date:",
      value: formatDate(event.eventDate),
    },
    {
      label: "Time:",
      value: formatTime(event.startTime || event.eventDate),
    },
    {
      label: "Venue:",
      value: event.venue?.venueName || "Venue not available",
    },
    {
      label: "Organizer:",
      value:
        event.organizer?.organizationName ||
        event.organizer?.name ||
        "EventEase",
    },
  ];

  detailRows.forEach((row) => {
    ensureSpace(28);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fill(GRAY)
      .text(row.label, margin, currentY);

    doc
      .font("Helvetica")
      .fontSize(12)
      .fill(DARK)
      .text(row.value, margin + 80, currentY);

    currentY += 26;
  });

  currentY += 10;

  // BOOKING INFORMATION SECTION

  ensureSpace(50);
  doc
    .moveTo(margin, currentY)
    .lineTo(margin + contentWidth, currentY)
    .strokeColor(LIGHT_GRAY)
    .lineWidth(1)
    .stroke();

  currentY += 18;

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fill(PRIMARY)
    .text("BOOKING INFORMATION", margin, currentY);

  currentY += 30;

  const bookingRows = [
    {
      label: "Booking ID:",
      value: String(booking._id),
    },
    {
      label: "Ticket Type:",
      value: ticketType,
    },
    {
      label: "Quantity:",
      value: `${ticketQuantity} Ticket${ticketQuantity !== 1 ? "s" : ""}`,
    },
    {
      label: "Price/Ticket:",
      value: `৳${pricePerTicket.toLocaleString("en-BD", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
    {
      label: "Total Amount:",
      value: `৳${totalAmount.toLocaleString("en-BD", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
    {
      label: "Booked On:",
      value: formatDate(booking.createdAt),
    },
  ];

  bookingRows.forEach((row) => {
    ensureSpace(26);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fill(GRAY)
      .text(row.label, margin, currentY);

    doc
      .font("Helvetica")
      .fontSize(12)
      .fill(DARK)
      .text(row.value, margin + 100, currentY, {
        width: contentWidth - 100,
      });

    currentY += 24;
  });

  currentY += 10;

  // BOOKING STATUS

  ensureSpace(50);

  doc
    .roundedRect(margin, currentY, contentWidth, 44, 8)
    .fill(PRIMARY_LIGHT);

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fill(PRIMARY)
    .text(
      "\u2713 BOOKING CONFIRMED",
      margin,
      currentY + 14,
      {
        width: contentWidth,
        align: "center",
      }
    );

  currentY += 55;

  // ATTENDEE INFORMATION

  ensureSpace(50);
  doc
    .moveTo(margin, currentY)
    .lineTo(margin + contentWidth, currentY)
    .strokeColor(LIGHT_GRAY)
    .lineWidth(1)
    .stroke();

  currentY += 18;

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fill(PRIMARY)
    .text("ATTENDEE INFORMATION", margin, currentY);

  currentY += 30;

  const attendeeRows = [
    {
      label: "Name:",
      value: user.name || "Guest",
    },
    {
      label: "Email:",
      value: user.email || "",
    },
  ];

  attendeeRows.forEach((row) => {
    ensureSpace(26);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fill(GRAY)
      .text(row.label, margin, currentY);

    doc
      .font("Helvetica")
      .fontSize(12)
      .fill(DARK)
      .text(row.value, margin + 70, currentY, {
        width: contentWidth - 70,
      });

    currentY += 24;
  });

  currentY += 15;

  // FOOTER NOTE

  ensureSpace(50);
  doc
    .moveTo(margin, currentY)
    .lineTo(margin + contentWidth, currentY)
    .strokeColor(LIGHT_GRAY)
    .lineWidth(1)
    .stroke();

  currentY += 18;

  doc
    .font("Helvetica")
    .fontSize(11)
    .fill(GRAY)
    .text(
      "Please present this ticket at the event venue.",
      margin,
      currentY,
      {
        width: contentWidth,
        align: "center",
      }
    );

  currentY += 20;

  doc
    .font("Helvetica")
    .fontSize(11)
    .fill(GRAY)
    .text(
      "Keep this ticket safe until the event ends.",
      margin,
      currentY,
      {
        width: contentWidth,
        align: "center",
      }
    );

  return new Promise((resolve, reject) => {
    const chunks = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });

    doc.on("error", (error) => {
      reject(createError("Failed to generate PDF.", 500));
    });

    doc.end();
  });
};

module.exports = {
  getTicketPdfBuffer,
};
