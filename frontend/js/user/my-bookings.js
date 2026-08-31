"use strict";


// ======================================================
// Configuration
// ======================================================

const API_BASE_URL = "http://localhost:5000/api/v1";


// ======================================================
// State
// ======================================================

let bookings = [];

let selectedBookingId = null;


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

const bookingsContainer =
  document.getElementById("bookingsContainer");

const cancelModal =
  document.getElementById("cancelModal");

const closeCancelModalBtn =
  document.getElementById("closeCancelModalBtn");

const confirmCancelBtn =
  document.getElementById("confirmCancelBtn");

const refundPercentage =
  document.getElementById("refundPercentage");

const refundAmount =
  document.getElementById("refundAmount");

const toast =
  document.getElementById("toast");

const toastMessage =
  document.getElementById("toastMessage");


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
// Get Stored User
// ======================================================

function getStoredUser() {

  const possibleKeys = [
    "user",
    "currentUser",
    "loggedInUser",
  ];

  for (const key of possibleKeys) {

    const value =
      localStorage.getItem(key) ||
      sessionStorage.getItem(key);

    if (!value) {
      continue;
    }

    try {

      return JSON.parse(value);

    } catch (error) {

      return null;
    }
  }

  return null;
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
// Load My Bookings
// ======================================================

async function loadMyBookings() {

  showLoading();

  try {

    const result =
      await apiRequest(
        "/bookings/my"
      );


    bookings =
      result?.data || [];


    hideLoading();


    if (!Array.isArray(bookings) ||
        bookings.length === 0) {

      showEmptyState();

      return;
    }


    renderBookings();

  } catch (error) {

    hideLoading();

    showError(
      error.message ||
      "Failed to load bookings."
    );

  }
}


// ======================================================
// Render Bookings
// ======================================================

function renderBookings() {

  bookingsContainer.innerHTML = "";


  bookings.forEach(
    (booking) => {

      const card =
        createBookingCard(
          booking
        );

      bookingsContainer.appendChild(
        card
      );

    }
  );


  bookingsContainer.classList.remove(
    "hidden"
  );
}


// ======================================================
// Create Booking Card
// ======================================================

function createBookingCard(
  booking
) {

  const card =
    document.createElement("div");


  card.className =
    "bg-white rounded-2xl shadow-sm " +
    "border border-gray-100 overflow-hidden";


  const event =
    booking.event || {};


  const venue =
    event.venue || {};


  const payment =
    booking.payment || {};


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


  const bookingStatus =
    booking.bookingStatus ||
    "pending";


  const refundStatus =
    booking.refundStatus ||
    "none";


  const refundPercentage =
    Number(
      booking.refundPercentage || 0
    );


  const refundAmount =
    Number(
      booking.refundAmount || 0
    );


  const canCancel =
    bookingStatus !== "cancelled" &&
    bookingStatus !== "completed";


  card.innerHTML = `

    <!-- ==========================
         Event Header
    =========================== -->

    <div class="p-6 border-b">

      <div class="flex flex-col
                  md:flex-row
                  md:items-start
                  md:justify-between
                  gap-4">

        <div>

          <h2
            class="text-xl font-bold text-gray-900"
          >
            ${escapeHTML(eventTitle)}
          </h2>

          <p class="mt-1 text-sm text-gray-500">
            Booking ID:
            ${escapeHTML(
              booking._id || "-"
            )}
          </p>

        </div>


        <div class="flex gap-2 flex-wrap">

          ${getBookingStatusBadge(
            bookingStatus
          )}

        </div>

      </div>

    </div>


    <!-- ==========================
         Booking Details
    =========================== -->

    <div class="p-6">

      <div
        class="grid grid-cols-1
               sm:grid-cols-2
               lg:grid-cols-4
               gap-5"
      >

        <!-- Event Date -->

        <div>

          <p class="text-xs uppercase
                    tracking-wide
                    text-gray-400">
            Event Date
          </p>

          <p class="mt-1 font-semibold
                    text-gray-800">
            ${escapeHTML(eventDate)}
          </p>

        </div>


        <!-- Venue -->

        <div>

          <p class="text-xs uppercase
                    tracking-wide
                    text-gray-400">
            Venue
          </p>

          <p class="mt-1 font-semibold
                    text-gray-800">
            ${escapeHTML(venueName)}
          </p>

        </div>


        <!-- Tickets -->

        <div>

          <p class="text-xs uppercase
                    tracking-wide
                    text-gray-400">
            Tickets
          </p>

          <p class="mt-1 font-semibold
                    text-gray-800">
            ${ticketQuantity}
          </p>

        </div>


        <!-- Total -->

        <div>

          <p class="text-xs uppercase
                    tracking-wide
                    text-gray-400">
            Total Amount
          </p>

          <p class="mt-1 font-semibold
                    text-gray-800">
            ৳${formatMoney(totalAmount)}
          </p>

        </div>

      </div>


      <!-- ==========================
           Payment Information
      =========================== -->

      <div
        class="mt-6 p-4 bg-gray-50
               rounded-xl"
      >

        <h3 class="font-semibold
                   text-gray-800">
          Payment Information
        </h3>


        <div
          class="mt-3 grid
                 grid-cols-1
                 sm:grid-cols-2
                 lg:grid-cols-4
                 gap-4"
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
              class="mt-1 font-medium
                     break-all"
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
           Refund Information
      =========================== -->

      ${
        bookingStatus === "cancelled"
          ? `

            <div
              class="mt-6 p-4
                     bg-orange-50
                     border border-orange-100
                     rounded-xl"
            >

              <h3
                class="font-semibold
                       text-orange-900"
              >
                Refund Information
              </h3>


              <div
                class="mt-3 grid
                       grid-cols-1
                       sm:grid-cols-3
                       gap-4"
              >

                <div>

                  <p class="text-xs
                            text-orange-600">
                    Refund Percentage
                  </p>

                  <p
                    class="mt-1
                           font-semibold
                           text-orange-900"
                  >
                    ${refundPercentage}%
                  </p>

                </div>


                <div>

                  <p class="text-xs
                            text-orange-600">
                    Refund Amount
                  </p>

                  <p
                    class="mt-1
                           font-semibold
                           text-green-700"
                  >
                    ৳${formatMoney(
                      refundAmount
                    )}
                  </p>

                </div>


                <div>

                  <p class="text-xs
                            text-orange-600">
                    Refund Status
                  </p>

                  <p
                    class="mt-1
                           font-semibold
                           text-orange-900"
                  >
                    ${formatRefundStatus(
                      refundStatus
                    )}
                  </p>

                </div>

              </div>

            </div>

          `
          : ""
      }


      <!-- ==========================
           Actions
      =========================== -->

      <div
        class="mt-6 flex
               flex-wrap
               items-center
               justify-end
               gap-3"
      >

        ${
          canCancel
            ? `
              <button
                type="button"
                class="cancel-booking-btn
                       px-5 py-2.5
                       rounded-lg
                       bg-red-600
                       text-white
                       font-medium
                       hover:bg-red-700
                       transition"
                data-booking-id="${
                  booking._id
                }"
              >
                Cancel Booking
              </button>
            `
            : ""
        }

      </div>

    </div>
  `;


  const cancelButton =
    card.querySelector(
      ".cancel-booking-btn"
    );


  if (cancelButton) {

    cancelButton.addEventListener(
      "click",
      () => {

        openCancelModal(
          booking._id
        );

      }
    );

  }


  return card;
}


// ======================================================
// Open Cancel Modal
// ======================================================

function openCancelModal(
  bookingId
) {

  const booking =
    bookings.find(
      (item) =>
        item._id === bookingId
    );


  if (!booking) {

    showToast(
      "Booking not found.",
      "error"
    );

    return;
  }


  selectedBookingId =
    bookingId;


  const percentage =
    Number(
      booking.refundPercentage || 0
    );


  const amount =
    Number(
      booking.refundAmount || 0
    );


  /*
   * If refund has not been calculated
   * by backend yet, show the policy
   * based on the event date.
   */

  let displayPercentage =
    percentage;

  let displayAmount =
    amount;


  if (
    booking.event &&
    booking.event.eventDate
  ) {

    const calculated =
      calculateRefundPreview(
        booking.event.eventDate,
        Number(
          booking.totalAmount || 0
        )
      );


    displayPercentage =
      calculated.refundPercentage;

    displayAmount =
      calculated.refundAmount;

  }


  refundPercentage.textContent =
    `${displayPercentage}%`;


  refundAmount.textContent =
    `৳${formatMoney(
      displayAmount
    )}`;


  cancelModal.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "overflow-hidden"
  );
}


// ======================================================
// Close Cancel Modal
// ======================================================

function closeCancelModal() {

  selectedBookingId =
    null;

  cancelModal.classList.add(
    "hidden"
  );

  document.body.classList.remove(
    "overflow-hidden"
  );
}


// ======================================================
// Confirm Cancellation
// ======================================================

async function confirmCancellation() {

  if (!selectedBookingId) {

    showToast(
      "No booking selected.",
      "error"
    );

    return;
  }


  const bookingId =
    selectedBookingId;


  confirmCancelBtn.disabled =
    true;


  confirmCancelBtn.textContent =
    "Cancelling...";


  try {

    const result =
      await apiRequest(
        `/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
        }
      );


    closeCancelModal();


    showToast(
      result?.message ||
      "Booking cancelled successfully.",
      "success"
    );


    await loadMyBookings();


    if (typeof updateNotificationBadge === "function") {

      await updateNotificationBadge();

    }

  } catch (error) {

    showToast(
      error.message ||
      "Failed to cancel booking.",
      "error"
    );

  } finally {

    confirmCancelBtn.disabled =
      false;

    confirmCancelBtn.textContent =
      "Confirm Cancellation";
  }
}


// ======================================================
// Refund Preview
// ======================================================

function calculateRefundPreview(
  eventDate,
  totalAmount
) {

  const now =
    new Date();

  const event =
    new Date(eventDate);


  const difference =
    event.getTime() -
    now.getTime();


  const daysRemaining =
    Math.ceil(
      difference /
      (1000 * 60 * 60 * 24)
    );


  let percentage = 0;


  if (daysRemaining >= 6) {

    percentage = 70;

  } else if (daysRemaining >= 3) {

    percentage = 50;

  } else if (daysRemaining >= 1) {

    percentage = 20;

  } else {

    percentage = 0;
  }


  const amount =
    (
      Number(totalAmount || 0) *
      percentage
    ) / 100;


  return {

    daysRemaining,

    refundPercentage:
      percentage,

    refundAmount:
      amount,

  };
}


// ======================================================
// Booking Status Badge
// ======================================================

function getBookingStatusBadge(
  status
) {

  const normalized =
    String(status)
      .toLowerCase();


  const styles = {

    pending:
      "bg-yellow-100 text-yellow-700",

    confirmed:
      "bg-green-100 text-green-700",

    cancelled:
      "bg-red-100 text-red-700",

    completed:
      "bg-blue-100 text-blue-700",

  };


  const labels = {

    pending: "Pending",

    confirmed: "Confirmed",

    cancelled: "Cancelled",

    completed: "Completed",

  };


  return `
    <span
      class="px-3 py-1
             rounded-full
             text-xs
             font-semibold
             ${
               styles[normalized] ||
               "bg-gray-100 text-gray-700"
             }"
    >
      ${
        labels[normalized] ||
        capitalize(normalized)
      }
    </span>
  `;
}


// ======================================================
// Refund Status
// ======================================================

function formatRefundStatus(
  status
) {

  const labels = {

    none:
      "No Refund",

    pending:
      "Refund Pending",

    processed:
      "Refund Processed",

  };


  return (
    labels[status] ||
    capitalize(
      String(status)
    )
  );
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
// Capitalize
// ======================================================

function capitalize(
  value
) {

  if (!value) {
    return "";
  }


  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
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

  bookingsContainer.classList.add(
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

  bookingsContainer.classList.add(
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

  bookingsContainer.classList.add(
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
// Logout
// ======================================================

function logout() {

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "accessToken"
  );

  localStorage.removeItem(
    "user"
  );

  localStorage.removeItem(
    "currentUser"
  );

  localStorage.removeItem(
    "loggedInUser"
  );


  sessionStorage.removeItem(
    "token"
  );

  sessionStorage.removeItem(
    "accessToken"
  );

  sessionStorage.removeItem(
    "user"
  );

  sessionStorage.removeItem(
    "currentUser"
  );

  sessionStorage.removeItem(
    "loggedInUser"
  );


  window.location.href =
    "./user-login.html";
}


function setupLogoutListener() {

  const btn =
    document.getElementById("logoutBtn");

  if (btn && !btn.dataset.listenerAttached) {

    btn.dataset.listenerAttached = "true";

    btn.addEventListener(
      "click",
      logout
    );

  }

}

document.addEventListener(
  "componentLoaded",
  (event) => {

    if (event.detail.elementId === "user-header") {

      setupLogoutListener();

    }

  }
);

setupLogoutListener();


// ======================================================
// Event Listeners
// ======================================================

retryBtn.addEventListener(
  "click",
  loadMyBookings
);


closeCancelModalBtn.addEventListener(
  "click",
  closeCancelModal
);


confirmCancelBtn.addEventListener(
  "click",
  confirmCancellation
);


// Close modal by clicking outside

cancelModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      cancelModal
    ) {

      closeCancelModal();

    }

  }
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


    loadMyBookings();

  }
);