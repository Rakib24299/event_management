"use strict";


// ======================================================
// Configuration
// ======================================================

const API_BASE_URL = "http://localhost:5000/api/v1";


// ======================================================
// State
// ======================================================

let confirmedBookings = [];


// ======================================================
// DOM Elements
// ======================================================

const loadingState =
  document.getElementById("loadingState");

const errorState =
  document.getElementById("errorState");

const errorMessage =
  document.getElementById("errorMessage");

const retryBtn =
  document.getElementById("retryBtn");

const emptyState =
  document.getElementById("emptyState");

const confirmedBookingsContainer =
  document.getElementById("confirmedBookingsContainer");

const toast =
  document.getElementById("toast");

const toastMessage =
  document.getElementById("toastMessage");

const cancelBookingModal =
  document.getElementById(
    "cancelBookingModal"
  );

const cancelModalOverlay =
  document.getElementById(
    "cancelModalOverlay"
  );

const cancelModalEventName =
  document.getElementById(
    "cancelModalEventName"
  );

const cancelModalRefundSection =
  document.getElementById(
    "cancelModalRefundSection"
  );

const cancelModalRefundPercentage =
  document.getElementById(
    "cancelModalRefundPercentage"
  );

const cancelModalRefundAmount =
  document.getElementById(
    "cancelModalRefundAmount"
  );

const cancelModalRefundStatus =
  document.getElementById(
    "cancelModalRefundStatus"
  );

const cancelModalNoRefund =
  document.getElementById(
    "cancelModalNoRefund"
  );

const cancelModalKeepBtn =
  document.getElementById(
    "cancelModalKeepBtn"
  );

const cancelModalConfirmBtn =
  document.getElementById(
    "cancelModalConfirmBtn"
  );


// ======================================================
// Get Token
// ======================================================

function getToken() {

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken")
  );
}


// ======================================================
// Authentication Check
// ======================================================

function checkAuthentication() {

  const token = getToken();

  if (!token) {

    window.location.href =
      "./user-login.html";

    return false;
  }

  return true;
}


// ======================================================
// API Request Helper
// ======================================================

async function apiRequest(
  endpoint,
  options = {}
) {

  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );


  let result = null;


  try {

    result =
      await response.json();

  } catch (error) {

    result = null;
  }


  if (!response.ok) {

    const message =
      result?.message ||
      result?.error ||
      "Something went wrong.";

    throw new Error(message);
  }


  return result;
}


// ======================================================
// Load Confirmed Bookings
// Fetches only bookings where the backend confirms
// bookingStatus === "confirmed".
// ======================================================

async function loadConfirmedBookings() {

  showLoading();

  try {

    const result =
      await apiRequest(
        "/bookings/my/confirmed"
      );


    confirmedBookings =
      result?.data || [];


    hideLoading();

    renderConfirmedBookings();

  } catch (error) {

    hideLoading();

    showError(
      error.message ||
      "Failed to load confirmed bookings."
    );

  }
}


// ======================================================
// Render Confirmed Bookings
// ======================================================

function renderConfirmedBookings() {

  confirmedBookingsContainer.innerHTML = "";


  if (
    confirmedBookings.length === 0
  ) {

    showEmptyState();

    return;

  }


  confirmedBookingsContainer.classList.remove(
    "hidden"
  );

  emptyState.classList.add(
    "hidden"
  );

  errorState.classList.add(
    "hidden"
  );


  confirmedBookings.forEach(
    (booking, index) => {

      const card =
        createConfirmedBookingCard(
          booking,
          index
        );

      confirmedBookingsContainer.appendChild(
        card
      );

    }
  );

}


// ======================================================
// Create Confirmed Booking Card
// ======================================================

function createConfirmedBookingCard(
  booking,
  index
) {

  const card =
    document.createElement("div");

  const event =
    booking.event || {};


  const venue =
    event.venue || {};


  const payment =
    booking.payment || {};


  const bookingId =
    booking._id || "-";


  const eventTitle =
    event.title ||
    "Event";


  const eventDate =
    formatDate(
      event.eventDate
    );


  const startTime =
    event.startTime ||
    "";


  const venueName =
    venue.venueName ||
    "Venue not available";


  const totalAmount =
    Number(
      booking.totalAmount || 0
    );


  const ticketQuantity =
    Number(
      booking.ticketQuantity || 0
    );


  const eventImageUrl =
    event.bannerImage?.url ||
    event.image ||
    "https://via.placeholder.com/600x400?text=EventEase";


  const paymentStatus =
    payment?.paymentStatus ||
    payment?.status ||
    "";


  const bookingStatus =
    String(booking.bookingStatus || "")
      .toLowerCase();


  card.className =
    "bg-white rounded-2xl shadow-sm " +
    "border border-gray-100 overflow-hidden";


  card.setAttribute(
    "data-booking-id",
    bookingId
  );


  card.innerHTML = `

    <!-- ==========================
         Event Image
    =========================== -->

    <div class="w-full h-48 sm:h-56 overflow-hidden bg-gray-100 relative">

      <img
        src="${eventImageUrl}"
        alt="${escapeHTML(eventTitle)}"
        class="w-full h-full object-cover"
      >

      <!-- Confirmed Badge -->

      <div class="absolute top-4 right-4">
        <span class="px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
          <svg class="h-4 w-4 text-emerald-600 inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Confirmed
        </span>
      </div>

    </div>


    <!-- ==========================
         Card Body
    =========================== -->

    <div class="p-6">

      <!-- Header -->

      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

        <div>

          <h2
            class="text-xl font-bold text-gray-900"
          >
            ${escapeHTML(eventTitle)}
          </h2>

          <p class="mt-1 text-sm text-gray-500">
            Booking ID:
            ${escapeHTML(
              bookingId
            )}
          </p>

        </div>

      </div>


      <!-- ==========================
           Booking Details
      =========================== -->

      <div
        class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >

        <!-- Event Date -->

        <div>

          <p class="text-xs uppercase tracking-wide text-gray-400">
            Event Date
          </p>

          <p class="mt-1 font-semibold text-gray-800">
            ${escapeHTML(eventDate)}
          </p>

          ${startTime ? `
            <p class="mt-1 text-xs text-gray-500">
              ${escapeHTML(startTime)}
            </p>
          ` : ""}

        </div>


        <!-- Venue -->

        <div>

          <p class="text-xs uppercase tracking-wide text-gray-400">
            Venue
          </p>

          <p class="mt-1 font-semibold text-gray-800">
            ${escapeHTML(venueName)}
          </p>

        </div>


        <!-- Tickets -->

        <div>

          <p class="text-xs uppercase tracking-wide text-gray-400">
            Tickets
          </p>

          <p class="mt-1 font-semibold text-gray-800">
            ${ticketQuantity}
          </p>

        </div>


        <!-- Total -->

        <div>

          <p class="text-xs uppercase tracking-wide text-gray-400">
            Total Amount
          </p>

          <p class="mt-1 font-semibold text-gray-800">
            ৳${formatMoney(totalAmount)}
          </p>

        </div>

      </div>


      <!-- ==========================
           Payment Information
      =========================== -->

      <div
        class="mt-6 p-4 bg-gray-50 rounded-xl"
      >

        <h3 class="font-semibold text-gray-800">
          Payment Information
        </h3>


        <div
          class="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >

          <div>

            <p class="text-xs text-gray-400">
              Payment Method
            </p>

            <p class="mt-1 font-medium">
              ${escapeHTML(
                payment.paymentMethod ||
                "Not available"
              )}
            </p>

          </div>


          <div>

            <p class="text-xs text-gray-400">
              Transaction ID
            </p>

            <p
              class="mt-1 font-medium break-all"
            >
              ${escapeHTML(
                payment.transactionId ||
                "Not available"
              )}
            </p>

          </div>


          <div>

            <p class="text-xs text-gray-400">
              Payment Amount
            </p>

            <p class="mt-1 font-medium">
              ৳${formatMoney(
                Number(
                  payment.amount ||
                  totalAmount
                )
              )}
            </p>

          </div>


          <div>

            <p class="text-xs text-gray-400">
              Paid At
            </p>

            <p class="mt-1 font-medium">
              ${
                payment.paidAt
                  ? formatDateTime(
                      payment.paidAt
                    )
                  : "Not paid"
              }
            </p>

          </div>

        </div>

      </div>


      <!-- ==========================
           Actions
      =========================== -->

      <div
        class="mt-6 flex flex-wrap items-center justify-end gap-3"
      >

        <a
          href="./booking-details.html?id=${encodeURIComponent(bookingId)}"
          class="rounded-xl border border-primary px-5 py-2.5
                 text-sm font-bold text-primary
                 hover:bg-primaryLight transition"
        >
          View Ticket
        </a>

        <button
          type="button"
          class="download-pdf-btn
                 px-5 py-2.5
                 rounded-lg
                 bg-primary
                 text-white
                 font-medium
                 hover:bg-primaryDark
                 transition"
          data-booking-id="${escapeHTML(bookingId)}"
          data-index="${index}"
        >
          Download PDF
        </button>

        <button
          type="button"
          class="download-receipt-btn
                 px-5 py-2.5
                 rounded-lg
                 border border-primary
                 text-primary
                 font-bold
                 hover:bg-primaryLight
                 transition"
          data-booking-id="${escapeHTML(bookingId)}"
          data-transaction-id="${escapeHTML(payment.transactionId || "receipt")}"
          data-index="${index}"
        >
          Payment Receipt
        </button>

        <button
          type="button"
          class="cancel-booking-btn
                 px-5 py-2.5
                 rounded-lg
                 border-2 border-red-500
                 text-red-600
                 font-bold
                 hover:bg-red-50
                 transition
                 disabled:opacity-50
                 disabled:cursor-not-allowed"
          data-booking-id="${escapeHTML(bookingId)}"
          data-index="${index}"
          ${bookingStatus === 'cancelled' || bookingStatus === 'completed' ? 'disabled' : ''}
        >
          ${bookingStatus === 'cancelled' ? 'Already Cancelled' : bookingStatus === 'completed' ? 'Completed' : 'Cancel'}
        </button>

      </div>

    </div>

  `;


  // ====================================
  // View Ticket — navigate to ticket page
  // ====================================

  const viewTicketLink =
    card.querySelector(
      'a[href^="./booking-details.html"]'
    );

  if (viewTicketLink) {

    viewTicketLink.addEventListener(
      "click",
      (e) => {

        sessionStorage.setItem(
          "selectedTicket",
          JSON.stringify(booking)
        );

      }
    );

  }


  // ====================================
  // Download PDF Button
  // ====================================

  const downloadPdfButton =
    card.querySelector(
      ".download-pdf-btn"
    );


  if (downloadPdfButton) {

    downloadPdfButton.addEventListener(
      "click",
      async () => {

        downloadPdfButton.disabled =
          true;

        downloadPdfButton.textContent =
          "Generating...";


        try {

          await downloadTicketPDF(
            booking,
            downloadPdfButton
          );

        } catch (error) {

          showToast(
            error.message ||
            "Unable to generate PDF.",
            "error"
          );

        } finally {

          downloadPdfButton.disabled =
            false;

          downloadPdfButton.textContent =
            "Download PDF";

        }

      }
    );

  }


  // ====================================
  // Download Payment Receipt Button
  // ====================================

  const downloadReceiptButton =
    card.querySelector(
      ".download-receipt-btn"
    );


  if (downloadReceiptButton) {

    downloadReceiptButton.addEventListener(
      "click",
      async (e) => {

        e.preventDefault();

        e.stopPropagation();


        downloadReceiptButton.disabled =
          true;

        downloadReceiptButton.textContent =
          "Generating Receipt...";


        try {

          await downloadPaymentReceiptPdf(
            booking,
            downloadReceiptButton
          );

        } catch (error) {

          showToast(
            error.message ||
            "Unable to download payment receipt. Please try again.",
            "error"
          );

        } finally {

          downloadReceiptButton.disabled =
            false;

          downloadReceiptButton.textContent =
            "Payment Receipt";

        }

      }
    );

  }


  // ====================================
  // Cancel Booking Button
  // ====================================

  const cancelBookingButton =
    card.querySelector(
      ".cancel-booking-btn"
    );


  if (cancelBookingButton) {

    cancelBookingButton.addEventListener(
      "click",
      () => {

        openCancelBookingModal(
          booking,
          cancelBookingButton
        );

      }
    );

  }


  return card;

}


// ======================================================
// Download Ticket PDF
// ======================================================

async function downloadTicketPDF(
  booking,
  downloadButton
) {

  const bookingId =
    booking._id || booking.id;


  if (!bookingId) {

    alert(
      "Booking ID not found. Unable to download ticket."
    );

    return;

  }


  const originalText =
    downloadButton?.textContent;


  if (downloadButton) {

    downloadButton.disabled = true;

    downloadButton.textContent =
      "Generating PDF...";

  }


  try {

    const event =
      booking.event || {};

    const quantity =
      Number(
        booking.ticketQuantity || 1
      );

    const totalAmount =
      Number(
        booking.totalAmount || 0
      );

    const eventDate =
      event.eventDate ||
      event.date ||
      "";

    const location =
      event.venue?.venueName ||
      event.location ||
      event.venue ||
      "Location not available";

    const title =
      event.title ||
      "Event";

    const user =
      booking.user || {};

    const payment =
      booking.payment || {};


    const ticketEl =
      document.createElement("div");

    ticketEl.style.cssText =
      "position:fixed;left:-9999px;top:0;width:800px;font-family:Arial,sans-serif;";

    ticketEl.innerHTML = `

      <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">

        <div style="background:#31572c;padding:40px;text-align:center;color:#ffffff;">

          <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">

            <span style="font-size:32px;"><svg class="h-4 w-4 text-emerald-600 inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg></span>

          </div>

          <p style="font-size:12px;font-weight:bold;letter-spacing:0.2em;color:#bbf7d0;margin:0;">
            BOOKING CONFIRMED
          </p>

          <h1 style="font-size:36px;font-weight:800;margin:8px 0 0;">
            Event Ticket
          </h1>

          <p style="font-size:14px;color:#bbf7d0;margin-top:8px;">
            Your booking has been successfully confirmed.
          </p>

        </div>

        <div style="padding:40px;">

          <div style="border-bottom:1px solid #e5e7eb;padding-bottom:24px;margin-bottom:24px;">

            <p style="font-size:12px;font-weight:bold;letter-spacing:0.1em;color:#9ca3af;margin:0;">
              EVENT
            </p>

            <h2 style="font-size:28px;font-weight:800;color:#111827;margin:8px 0 0;">
              ${escapeHTML(title)}
            </h2>

          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;border-bottom:1px solid #e5e7eb;padding-bottom:24px;margin-bottom:24px;">

            <div>

              <p style="font-size:12px;color:#9ca3af;margin:0;">
                Date
              </p>

              <p style="font-size:16px;font-weight:bold;color:#111827;margin:4px 0 0;">
                ${escapeHTML(formatDate(eventDate))}
              </p>

            </div>

            <div>

              <p style="font-size:12px;color:#9ca3af;margin:0;">
                Venue
              </p>

              <p style="font-size:16px;font-weight:bold;color:#111827;margin:4px 0 0;">
                ${escapeHTML(location)}
              </p>

            </div>

          </div>

          <div style="border-bottom:1px solid #e5e7eb;padding-bottom:24px;margin-bottom:24px;">

            <h3 style="font-size:20px;font-weight:bold;color:#111827;margin:0 0 16px;">
              Customer Information
            </h3>

            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

              <span style="font-size:14px;color:#6b7280;">
                Name
              </span>

              <span style="font-size:14px;font-weight:bold;color:#111827;text-align:right;">
                ${escapeHTML(user.name || "Customer")}
              </span>

            </div>

            <div style="display:flex;justify-content:space-between;">

              <span style="font-size:14px;color:#6b7280;">
                Email
              </span>

              <span style="font-size:14px;font-weight:bold;color:#111827;text-align:right;word-break:break-all;">
                ${escapeHTML(user.email || "-")}
              </span>

            </div>

          </div>

          <div style="border-bottom:1px solid #e5e7eb;padding-bottom:24px;margin-bottom:24px;">

            <h3 style="font-size:20px;font-weight:bold;color:#111827;margin:0 0 16px;">
              Booking Information
            </h3>

            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

              <span style="font-size:14px;color:#6b7280;">
                Booking ID
              </span>

              <span style="font-size:14px;font-weight:bold;color:#111827;text-align:right;word-break:break-all;">
                ${escapeHTML(bookingId)}
              </span>

            </div>

            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

              <span style="font-size:14px;color:#6b7280;">
                Ticket Quantity
              </span>

              <span style="font-size:14px;font-weight:bold;color:#111827;">
                ${quantity}
              </span>

            </div>

            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

              <span style="font-size:14px;color:#6b7280;">
                Total Amount
              </span>

              <span style="font-size:14px;font-weight:bold;color:#31572c;">
                ${formatPrice(totalAmount)}
              </span>

            </div>

            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

              <span style="font-size:14px;color:#6b7280;">
                Payment Method
              </span>

              <span style="font-size:14px;font-weight:bold;color:#111827;text-align:right;">
                ${escapeHTML(payment.paymentMethod ? payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1) : "Online")}
              </span>

            </div>

            ${payment.transactionId ? `
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

              <span style="font-size:14px;color:#6b7280;">
                Transaction ID
              </span>

              <span style="font-size:14px;font-weight:bold;color:#111827;text-align:right;word-break:break-all;">
                ${escapeHTML(payment.transactionId)}
              </span>

            </div>
            ` : ""}

            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

              <span style="font-size:14px;color:#6b7280;">
                Payment Status
              </span>

              <span style="font-size:12px;font-weight:bold;background:#dcfce7;color:#166534;padding:4px 12px;border-radius:9999px;">
                ${escapeHTML((payment.status || "PAID").toUpperCase())}
              </span>

            </div>

            <div style="display:flex;justify-content:space-between;">

              <span style="font-size:14px;color:#6b7280;">
                Booking Status
              </span>

              <span style="font-size:12px;font-weight:bold;background:#dcfce7;color:#166534;padding:4px 12px;border-radius:9999px;">
                CONFIRMED
              </span>

            </div>

          </div>

          <div style="margin-top:24px;padding:20px;background:#eaf2e8;border-radius:12px;border:1px solid #bbf7d0;">

            <p style="font-size:14px;line-height:1.6;color:#14532d;margin:0;">
              Please keep this ticket available when attending the event. Your Booking ID can be used to verify your booking.
            </p>

          </div>

        </div>

      </div>

    `;


    document.body.appendChild(
      ticketEl
    );


    const canvas =
      await html2canvas(
        ticketEl,
        {
          scale: 2,
          useCORS: true,
          backgroundColor:
            "#ffffff"
        }
      );


    const imgData =
      canvas.toDataURL(
        "image/png"
      );


    const pdf =
      new jspdf.jsPDF(
        {
          orientation:
            "portrait",
          unit: "px",
          format: [
            canvas.width,
            canvas.height
          ]
        }
      );


    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      canvas.width,
      canvas.height
    );


    pdf.save(
      `EventEase-Ticket-${bookingId}.pdf`
    );


    document.body.removeChild(
      ticketEl
    );


  } catch (error) {

    console.error(
      "PDF Generation Error:",
      error
    );


    alert(
      error.message ||
      "Unable to generate ticket PDF. Please try again."
    );


  } finally {

    if (downloadButton) {

      downloadButton.disabled = false;

      downloadButton.textContent =
        originalText ||
        "Download PDF";

    }

  }

}


// ======================================================
// Download Payment Receipt PDF
// ======================================================

async function downloadPaymentReceiptPdf(
  booking,
  downloadButton
) {

  const bookingId =
    booking._id || booking.id;

  const transactionId =
    booking.payment?.transactionId ||
    "receipt";


  if (!bookingId) {

    alert(
      "Booking ID not found. Unable to download payment receipt."
    );

    return;

  }


  const originalText =
    downloadButton?.textContent;


  if (downloadButton) {

    downloadButton.disabled = true;

    downloadButton.textContent =
      "Generating Receipt...";

  }


  try {

    const token =
      getToken();

    if (!token) {

      throw new Error(
        "You must be logged in to download the payment receipt."
      );

    }


    const response =
      await fetch(
        `${API_BASE_URL}/payments/booking/${encodeURIComponent(bookingId)}/receipt`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          headers: {

            Authorization:
              `Bearer ${token}`,

          },
        }
      );


    if (!response.ok) {

      let errorMessage =
        "Unable to download payment receipt. Please try again.";

      try {

        const result =
          await response.json();

        errorMessage =
          result?.message ||
          result?.error ||
          errorMessage;

      } catch {

        errorMessage =
          `Server error (${response.status}). Please try again.`;

      }

      throw new Error(
        errorMessage
      );

    }


    const blob =
      await response.blob();


    const url =
      URL.createObjectURL(
        blob
      );


    const a =
      document.createElement(
        "a"
      );

    a.href = url;

    a.download =
      `payment-receipt-${transactionId}.pdf`;


    document.body.appendChild(
      a
    );

    a.click();

    document.body.removeChild(
      a
    );


    URL.revokeObjectURL(
      url
    );


  } catch (error) {

    console.error(
      "Payment Receipt Download Error:",
      error
    );


    alert(
      error.message ||
      "Unable to download payment receipt. Please try again."
    );

  } finally {

    if (downloadButton) {

      downloadButton.disabled = false;

      downloadButton.textContent =
        originalText ||
        "Payment Receipt";

    }

  }

}


// ======================================================
// Format Date
// ======================================================

function formatDate(
  date
) {

  if (!date) {

    return "Not available";

  }


  const parsedDate =
    new Date(date);


  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {

    return "Invalid date";

  }


  return parsedDate.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


// ======================================================
// Format Date Time
// ======================================================

function formatDateTime(
  date
) {

  if (!date) {

    return "Not available";

  }


  const parsedDate =
    new Date(date);


  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {

    return "Invalid date";

  }


  return parsedDate.toLocaleString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


// ======================================================
// Format Money
// ======================================================

function formatMoney(
  amount
) {

  return Number(
    amount || 0
  ).toLocaleString(
    "en-BD",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}


// ======================================================
// Format Price (shorthand)
// ======================================================

function formatPrice(
  amount
) {

  const numericAmount =
    Number(amount || 0);


  return `৳${numericAmount.toLocaleString(
    "en-BD"
  )}`;

}


// ======================================================
// Escape HTML
// ======================================================

function escapeHTML(
  value
) {

  const div =
    document.createElement("div");


  div.textContent =
    value == null
      ? ""
      : String(value);


  return div.innerHTML;

}


// ======================================================
// Loading State
// ======================================================

function showLoading() {

  loadingState.classList.remove(
    "hidden"
  );

  errorState.classList.add(
    "hidden"
  );

  emptyState.classList.add(
    "hidden"
  );

  confirmedBookingsContainer.classList.add(
    "hidden"
  );
}


function hideLoading() {

  loadingState.classList.add(
    "hidden"
  );
}


// ======================================================
// Empty State
// ======================================================

function showEmptyState() {

  emptyState.classList.remove(
    "hidden"
  );

  confirmedBookingsContainer.classList.add(
    "hidden"
  );

  errorState.classList.add(
    "hidden"
  );
}


// ======================================================
// Error State
// ======================================================

function showError(
  message
) {

  errorMessage.textContent =
    message;


  errorState.classList.remove(
    "hidden"
  );

  emptyState.classList.add(
    "hidden"
  );

  confirmedBookingsContainer.classList.add(
    "hidden"
  );
}


// ======================================================
// Toast
// ======================================================

function showToast(
  message,
  type = "success"
) {

  toastMessage.textContent =
    message;


  toast.className =
    "fixed bottom-5 right-5 z-[60] " +
    "max-w-sm px-5 py-4 rounded-lg " +
    "shadow-lg text-white";


  if (type === "success") {

    toast.classList.add(
      "bg-green-600"
    );

  } else {

    toast.classList.add(
      "bg-red-600"
    );

  }


  toast.classList.remove(
    "hidden"
  );


  setTimeout(
    () => {

      toast.classList.add(
        "hidden"
      );

    },
    4000
  );
}


// ======================================================
// Cancel Booking Modal
// ======================================================

let activeCancelBooking = null;
let activeCancelButton = null;


function openCancelBookingModal(
  booking,
  cancelButton
) {

  activeCancelBooking = booking;
  activeCancelButton = cancelButton;


  const event =
    booking.event || {};

  const eventTitle =
    event.title || "Event";

  const payment =
    booking.payment || {};

  const totalAmount =
    Number(
      booking.totalAmount || 0
    );


  cancelModalEventName.textContent =
    eventTitle;


  if (
    totalAmount > 0 &&
    String(
      payment.paymentStatus ||
      payment.status ||
      ""
    ).toLowerCase() === "paid"
  ) {

    cancelModalRefundSection.classList.remove(
      "hidden"
    );

    cancelModalNoRefund.classList.add(
      "hidden"
    );

    cancelModalRefundPercentage.textContent =
      "Loading...";

    cancelModalRefundAmount.textContent =
      "Loading...";

    cancelModalRefundStatus.textContent =
      "Loading...";

    cancelModalConfirmBtn.disabled = true;


    fetchRefundInformation(
      booking._id
    ).then(
      (refundInfo) => {

        cancelModalRefundPercentage.textContent =
          refundInfo.refundPercentage + "%";

        cancelModalRefundAmount.textContent =
          "৳" + formatMoney(
            refundInfo.refundAmount
          );

        cancelModalRefundStatus.textContent =
          refundInfo.refundStatus === "pending"
            ? "Pending"
            : refundInfo.refundStatus ===
                "processed"
            ? "Processed"
            : refundInfo.refundStatus ===
                "none"
            ? "None"
            : refundInfo.refundStatus ||
                "Pending";

        cancelModalConfirmBtn.disabled =
          false;

      }
    ).catch(
      (error) => {

        cancelModalRefundPercentage.textContent =
          "Error";

        cancelModalRefundAmount.textContent =
          "Error";

        cancelModalRefundStatus.textContent =
          "Error";

        cancelModalConfirmBtn.disabled =
          false;

      }
    );

  } else {

    cancelModalRefundSection.classList.add(
      "hidden"
    );

    cancelModalNoRefund.classList.remove(
      "hidden"
    );

    cancelModalConfirmBtn.disabled = false;

  }


  cancelBookingModal.classList.remove(
    "hidden"
  );

}


function closeCancelBookingModal() {

  cancelBookingModal.classList.add(
    "hidden"
  );

  cancelModalEventName.textContent = "";

  cancelModalRefundSection.classList.add(
    "hidden"
  );

  cancelModalNoRefund.classList.add(
    "hidden"
  );

  cancelModalRefundPercentage.textContent = "";
  cancelModalRefundAmount.textContent = "";
  cancelModalRefundStatus.textContent = "";

  cancelModalConfirmBtn.disabled = false;

  activeCancelBooking = null;
  activeCancelButton = null;

}


async function handleCancelBooking() {

  if (!activeCancelBooking) {
    return;
  }


  const bookingId =
    activeCancelBooking._id ||
    activeCancelBooking.id;

  if (!bookingId) {
    showToast(
      "Booking ID not found.",
      "error"
    );

    closeCancelBookingModal();
    return;
  }


  const button = activeCancelButton || cancelModalConfirmBtn;

  button.disabled = true;

  button.textContent = "Cancelling...";


  try {

    const token =
      getToken();

    if (!token) {
      throw new Error(
        "You must be logged in to cancel a booking."
      );
    }


    const response =
      await fetch(
        `${API_BASE_URL}/bookings/${encodeURIComponent(bookingId)}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );


    let result = null;

    try {
      result =
        await response.json();
    } catch {
      result = null;
    }


    if (!response.ok) {
      const message =
        result?.message ||
        result?.error ||
        "Failed to cancel booking.";

      throw new Error(message);
    }


    const refundPercentage =
      result?.data?.refundPercentage ?? 0;

    const refundAmount =
      result?.data?.refundAmount ?? 0;

    const refundStatus =
      result?.data?.refundStatus ||
      (refundAmount > 0 ? "pending" : "none");


    closeCancelBookingModal();

    updateCardToCancelled(
      bookingId,
      refundPercentage,
      refundAmount,
      refundStatus
    );


    if (refundAmount > 0) {

      showToast(
        `Booking cancelled successfully. ${refundPercentage}% refund (৳${formatMoney(refundAmount)}) is pending.`
      );

    } else {

      showToast(
        "Booking cancelled successfully. No refund is applicable."
      );

    }


    setTimeout(
      () => {
        loadConfirmedBookings();
      },
      1500
    );


  } catch (error) {

    console.error(
      "Cancel booking error:",
      error
    );

    showToast(
      error.message ||
        "Unable to cancel booking. Please try again.",
      "error"
    );

    if (activeCancelButton) {
      activeCancelButton.disabled = false;
    }

    button.textContent =
      button.textContent ||
      (activeCancelButton
        ? "Cancel"
        : "Confirm Cancel");

  }
}


function updateCardToCancelled(
  bookingId,
  refundPercentage,
  refundAmount,
  refundStatus
) {

  const card =
    confirmedBookingsContainer.querySelector(
      `[data-booking-id="${CSS.escape(bookingId)}"]`
    );

  if (!card) {
    return;
  }


  const badge =
    card.querySelector(
      'span[class*="bg-green"]'
    );

  if (badge) {
    badge.textContent = "Cancelled";
    badge.className =
      "px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700";
  }


  const cancelBtn =
    card.querySelector(
      ".cancel-booking-btn"
    );

  if (cancelBtn) {
    cancelBtn.disabled = true;

    cancelBtn.textContent =
      "Already Cancelled";

    cancelBtn.className =
      "px-5 py-2.5 rounded-lg border-2 border-gray-300 text-gray-400 font-bold cursor-not-allowed transition";
  }


  const paymentInfoSection =
    card.querySelector(
      '[class*="bg-gray-50"]'
    );

  if (
    paymentInfoSection &&
    refundAmount > 0
  ) {

    const existingRefundDiv =
      paymentInfoSection.querySelector(
        '[class*="bg-orange"]'
      );

    if (!existingRefundDiv) {

      const refundDiv =
        document.createElement(
          "div"
        );

      refundDiv.className =
        "mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl";

      refundDiv.innerHTML = `
        <p class="text-sm font-semibold text-orange-800 mb-1">
          Refund Information
        </p>
        <div class="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span class="text-gray-500">Percentage</span>
            <p class="font-bold text-orange-700">${refundPercentage}%</p>
          </div>
          <div>
            <span class="text-gray-500">Amount</span>
            <p class="font-bold text-orange-700">৳${formatMoney(refundAmount)}</p>
          </div>
          <div>
            <span class="text-gray-500">Status</span>
            <p class="font-bold text-orange-700 capitalize">${refundStatus}</p>
          </div>
        </div>
      `;

      paymentInfoSection.appendChild(
        refundDiv
      );

    }

  }

}


async function fetchRefundInformation(
  bookingId
) {

  const token =
    getToken();

  if (!token) {
    throw new Error(
      "You must be logged in."
    );
  }


  const response =
    await fetch(
      `${API_BASE_URL}/refunds/booking/${encodeURIComponent(bookingId)}`,
      {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );


  if (!response.ok) {

    let errorMessage =
      "Unable to fetch refund information.";

    try {
      const result =
        await response.json();

      errorMessage =
        result?.message ||
        result?.error ||
        errorMessage;

    } catch {
      errorMessage =
        `Server error (${response.status}).`;
    }

    throw new Error(
      errorMessage
    );
  }


  const result =
    await response.json();

  const data =
    result?.data || result;

  return {
    refundPercentage:
      data.refundPercentage ?? 0,

    refundAmount:
      data.refundAmount ?? 0,

    refundStatus:
      data.refundStatus ||
        "none",

    message:
      data.message || "",
  };

}


cancelModalOverlay.addEventListener(
  "click",
  closeCancelBookingModal
);

cancelModalKeepBtn.addEventListener(
  "click",
  closeCancelBookingModal
);

cancelModalConfirmBtn.addEventListener(
  "click",
  handleCancelBooking
);


// ======================================================
// Event Listeners
// ======================================================

retryBtn.addEventListener(
  "click",
  loadConfirmedBookings
);


// ======================================================
// Initialize
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    if (!checkAuthentication()) {
      return;
    }


    loadConfirmedBookings();

  }
);
