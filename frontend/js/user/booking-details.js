// ========================================
// EventEase Booking Details
// ========================================

const API_URL = "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const loadingState =
    document.getElementById("loadingState");

const bookingContent =
    document.getElementById("bookingContent");

const bookingError =
    document.getElementById("bookingError");

const bookingEventImage =
    document.getElementById("bookingEventImage");

const bookingEventCategory =
    document.getElementById("bookingEventCategory");

const bookingEventTitle =
    document.getElementById("bookingEventTitle");

const bookingEventDate =
    document.getElementById("bookingEventDate");

const bookingEventLocation =
    document.getElementById("bookingEventLocation");

const bookingId =
    document.getElementById("bookingId");

const bookingDate =
    document.getElementById("bookingDate");

const ticketQuantity =
    document.getElementById("ticketQuantity");

const ticketPrice =
    document.getElementById("ticketPrice");

const ticketPriceSection =
    document.getElementById("ticketPriceSection");

const totalAmount =
    document.getElementById("totalAmount");

const bookingStatus =
    document.getElementById("bookingStatus");

const paymentStatus =
    document.getElementById("paymentStatus");

const otpStatus =
    document.getElementById("otpStatus");


const cancelBookingButton =
    document.getElementById("cancelBookingButton");

const cancelMessage =
    document.getElementById("cancelMessage");


// ========================================
// Variables
// ========================================

let currentBooking = null;


// ========================================
// Token
// ========================================

const token =
    localStorage.getItem("token");


// ========================================
// Authentication
// ========================================

if (!token) {

    window.location.href =
        "../login.html";
}


// ========================================
// Get Booking ID From URL
// ========================================

function getBookingIdFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get("id");
}


// ========================================
// Format Price
// ========================================

function formatPrice(price) {

    const amount =
        Number(price || 0);

    return `৳${amount.toLocaleString()}`;
}


// ========================================
// Format Date
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "--";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateValue;
    }


    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


// ========================================
// Format Date + Time
// ========================================

function formatDateTime(dateValue) {

    if (!dateValue) {
        return "--";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateValue;
    }


    return date.toLocaleString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


// ========================================
// Display Error
// ========================================

function showError(message) {

    if (loadingState) {

        loadingState.classList.add(
            "hidden"
        );
    }


    if (bookingContent) {

        bookingContent.classList.add(
            "hidden"
        );
    }


    if (bookingError) {

        bookingError.textContent =
            message;

        bookingError.classList.remove(
            "hidden"
        );
    }
}


// ========================================
// Load Booking
// ========================================

async function loadBooking() {

    const id =
        getBookingIdFromUrl();


    if (!id) {

        showError(
            "Booking ID was not found."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/bookings/${id}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const result =
            await response.json();


        console.log(
            "Booking Details Response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load booking."
            );
        }


        currentBooking =
            result.data;


        displayBooking(
            currentBooking
        );


    } catch (error) {

        console.error(
            "Booking Details Error:",
            error
        );


        showError(
            error.message ||
            "Unable to load booking details."
        );
    }
}


// ========================================
// Display Booking
// ========================================

function displayBooking(booking) {

    if (loadingState) {

        loadingState.classList.add(
            "hidden"
        );
    }


    if (bookingContent) {

        bookingContent.classList.remove(
            "hidden"
        );
    }


    // ====================================
    // Booking Information
    // ====================================

    bookingId.textContent =
        booking._id ||
        booking.id ||
        "--";


    bookingDate.textContent =
        formatDateTime(
            booking.createdAt
        );


    ticketQuantity.textContent =
        booking.ticketQuantity ||
        0;


    totalAmount.textContent =
        formatPrice(
            booking.totalAmount
        );


    // ====================================
    // Ticket Price
    // ====================================

    const quantity =
        Number(
            booking.ticketQuantity || 0
        );


    const total =
        Number(
            booking.totalAmount || 0
        );


    const pricePerTicket =
        quantity > 0
            ? total / quantity
            : 0;


    ticketPrice.textContent =
        formatPrice(
            pricePerTicket
        );


    if (
        ticketPriceSection &&
        booking.event?.eventType === "free"
    ) {

        ticketPriceSection.classList.add(
            "hidden"
        );

    }


    // ====================================
    // Booking Status
    // ====================================

    bookingStatus.textContent =
        formatStatus(
            booking.bookingStatus
        );


    bookingStatus.className =
        getStatusClass(
            booking.bookingStatus
        );


    // ====================================
    // Payment Status
    // ====================================

    paymentStatus.textContent =
        formatStatus(
            booking.paymentStatus
        );


    paymentStatus.className =
        getStatusClass(
            booking.paymentStatus
        );


    // ====================================
    // OTP Status
    // ====================================

    if (booking.isOtpVerified) {

        otpStatus.textContent =
            "Verified";

        otpStatus.className =
            "font-semibold text-primary";

    } else {

        otpStatus.textContent =
            "Not Verified";

        otpStatus.className =
            "font-semibold text-orange-600";
    }


    // ====================================
    // Event
    // ====================================

    displayEvent(
        booking.event
    );


    // ====================================
    // Cancel Button
    // ====================================

    if (
        booking.bookingStatus ===
        "confirmed"
    ) {

        cancelBookingButton.classList.remove(
            "hidden"
        );

    } else {

        cancelBookingButton.classList.add(
            "hidden"
        );
    }
}


// ========================================
// Display Event
// ========================================

function displayEvent(event) {

    if (!event) {

        bookingEventTitle.textContent =
            "Event information unavailable";

        return;
    }


    const imageUrl =
        event.bannerImage?.url ||
        event.image ||
        "https://via.placeholder.com/600x400?text=EventEase";


    bookingEventImage.src =
        imageUrl;


    bookingEventImage.alt =
        event.title ||
        "Event";


    bookingEventCategory.textContent =
        event.category?.name ||
        "Event";


    bookingEventTitle.textContent =
        event.title ||
        "Untitled Event";


    bookingEventDate.textContent =
        formatDate(
            event.eventDate ||
            event.date
        );


    bookingEventLocation.textContent =
        event.location ||
        event.venue ||
        "Location not available";
}


// ========================================
// Format Status
// ========================================

function formatStatus(status) {

    if (!status) {
        return "--";
    }


    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}


// ========================================
// Status Classes
// ========================================

function getStatusClass(status) {

    const base =
        "inline-flex rounded-full px-3 py-1 text-sm font-semibold";


    switch (status) {

        case "confirmed":

        case "paid":

        case "completed":

        case "approved":

            return `${base} bg-green-100 text-green-700`;


        case "pending":

        case "processing":

            return `${base} bg-yellow-100 text-yellow-700`;


        case "cancelled":

        case "failed":

        case "rejected":

            return `${base} bg-red-100 text-red-700`;


        default:

            return `${base} bg-gray-100 text-gray-700`;
    }
}




async function cancelBooking() {

    if (!currentBooking) {
        return;
    }


    const id =
        currentBooking._id ||
        currentBooking.id;


    if (!id) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to cancel this booking?"
        );


    if (!confirmed) {
        return;
    }


    cancelBookingButton.disabled =
        true;

    cancelBookingButton.textContent =
        "Cancelling...";


    try {

        const response =
            await fetch(
                `${API_URL}/bookings/${id}/cancel`,
                {
                    method: "PATCH",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const result =
            await response.json();


        console.log(
            "Cancel Booking Response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to cancel booking."
            );
        }


        currentBooking =
            result.data?.booking ||
            result.data ||
            currentBooking;


        displayBooking(
            currentBooking
        );


        showBookingMessage(
          result.message ||
          "Booking cancelled successfully."
        );


        if (typeof updateNotificationBadge === "function") {

          await updateNotificationBadge();

        }


    } catch (error) {

        console.error(
            "Cancel Booking Error:",
            error
        );


        showBookingMessage(
            error.message ||
            "Unable to cancel booking.",
            "error"
        );


    } finally {

        cancelBookingButton.disabled =
            false;

        cancelBookingButton.textContent =
            "Cancel Booking";
    }
}


// ========================================
// Booking Message
// ========================================

function showBookingMessage(
    message,
    type = "success"
) {

    if (!cancelMessage) {
        return;
    }


    cancelMessage.textContent =
        message;


    cancelMessage.classList.remove(
        "hidden",
        "bg-green-50",
        "text-green-700",
        "bg-red-50",
        "text-red-700"
    );


    if (type === "error") {

        cancelMessage.classList.add(
            "bg-red-50",
            "text-red-700"
        );

    } else {

        cancelMessage.classList.add(
            "bg-green-50",
            "text-green-700"
        );
    }
}


// ========================================
// Event Listeners
// ========================================

if (cancelBookingButton) {

    cancelBookingButton.addEventListener(
        "click",
        cancelBooking
    );
}


// ========================================
// Initialize
// ========================================

async function initializeBookingDetails() {

    if (!token) {
        return;
    }


    const id =
        getBookingIdFromUrl();


    if (!id) {

        showError(
            "No booking was selected."
        );

        return;
    }


    await loadBooking();
}


initializeBookingDetails();