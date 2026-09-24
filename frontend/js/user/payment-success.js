// EventEase Booking & Payment Success Page

const API_URL = "http://localhost:5000/api/v1";

// DOM ELEMENTS

const successEventImage = document.getElementById("successEventImage");
const successEventCategory = document.getElementById("successEventCategory");
const successEventTitle = document.getElementById("successEventTitle");
const successEventDate = document.getElementById("successEventDate");
const successEventLocation = document.getElementById("successEventLocation");
const successAvailableSeats = document.getElementById("successAvailableSeats");

const successBookingId = document.getElementById("successBookingId");
const successTicketQuantity = document.getElementById("successTicketQuantity");
const successPaymentMethod = document.getElementById("successPaymentMethod");
const successTotalAmount = document.getElementById("successTotalAmount");

const successPaymentId = document.getElementById("successPaymentId");
const successTransactionId = document.getElementById("successTransactionId");
const successPaymentStatus = document.getElementById("successPaymentStatus");
const successBookingStatus = document.getElementById("successBookingStatus");
const bookingStatus = document.getElementById("bookingStatus");

const bookingOtp = document.getElementById("bookingOtp");
const otpExpiry = document.getElementById("otpExpiry");
const otpMessage = document.getElementById("otpMessage");

const generateQrButton = document.getElementById("generateQrButton");
const qrContainer = document.getElementById("qrContainer");
const qrCode = document.getElementById("qrCode");
const qrMessage = document.getElementById("qrMessage");

const ticketsCard = document.getElementById("ticketsCard");
const paymentMethodCard = document.getElementById("paymentMethodCard");
const bookingIdCard = document.getElementById("bookingIdCard");
const totalAmountCard = document.getElementById("totalAmountCard");
const bookingInfoGrid = document.getElementById("bookingInfoGrid");

const paymentInfoSection = document.getElementById("paymentInfoSection");
const paymentInfoHeading = document.getElementById("paymentInfoHeading");
const paymentInfoSubheading = document.getElementById("paymentInfoSubheading");
const paymentIdRow = document.getElementById("paymentIdRow");
const transactionIdRow = document.getElementById("transactionIdRow");
const paymentStatusRow = document.getElementById("paymentStatusRow");
const bookingStatusRow = document.getElementById("bookingStatusRow");

const successHeading = document.getElementById("successHeading");
const successSubheading = document.getElementById("successSubheading");

// TOKEN HELPER

const getToken = () => {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken") ||
        sessionStorage.getItem("authToken")
    );
};

// GLOBAL STATE

let successData = null;
let completedBooking = null;
let completedPayment = null;
let eventData = null;

// FORMAT HELPERS

const formatMoney = (amount) => {
    return "৳" + Number(amount || 0).toLocaleString("en-BD");
};

const formatDate = (dateValue) => {
    if (!dateValue) return "--";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return String(dateValue);

    return date.toLocaleDateString("en-BD", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};

const getId = (object) => {
    if (!object) return null;
    return object._id || object.id || null;
};

// GET IDS FROM URL / STORAGE

const getBookingId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlBookingId = urlParams.get("bookingId") || urlParams.get("id");

    return (
        urlBookingId ||
        getId(completedBooking) ||
        sessionStorage.getItem("confirmedBookingId") ||
        sessionStorage.getItem("paymentBookingId") ||
        null
    );
};

const getPaymentId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPaymentId = urlParams.get("paymentId");

    return (
        urlPaymentId ||
        getId(completedPayment) ||
        sessionStorage.getItem("paymentId") ||
        null
    );
};

const getEventId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlEventId = urlParams.get("eventId") || urlParams.get("event");
    if (urlEventId) return urlEventId;

    if (eventData) {
        const id = getId(eventData);
        if (id) return id;
    }

    if (completedBooking?.event) {
        if (typeof completedBooking.event === "object") {
            const id = getId(completedBooking.event);
            if (id) return id;
        } else if (typeof completedBooking.event === "string") {
            return completedBooking.event;
        }
    }

    return (
        sessionStorage.getItem("selectedEventId") ||
        sessionStorage.getItem("paymentEventId") ||
        null
    );
};

// LOAD SESSION STORAGE CACHE

const loadSessionCache = () => {
    try {
        const rawSuccess = sessionStorage.getItem("paymentSuccessData");
        if (rawSuccess) successData = JSON.parse(rawSuccess);
    } catch (e) {
        console.warn("Failed to parse paymentSuccessData:", e);
    }

    try {
        const rawBooking = sessionStorage.getItem("paymentBookingData");
        if (rawBooking) completedBooking = JSON.parse(rawBooking);
    } catch (e) {
        console.warn("Failed to parse paymentBookingData:", e);
    }

    try {
        const rawEvent = sessionStorage.getItem("selectedEventData");
        if (rawEvent) eventData = JSON.parse(rawEvent);
    } catch (e) {
        console.warn("Failed to parse selectedEventData:", e);
    }

    if (!completedBooking && successData?.booking) {
        completedBooking = successData.booking;
    }

    if (!completedPayment && successData?.payment) {
        completedPayment = successData.payment;
    }

    if (!eventData && completedBooking?.event && typeof completedBooking.event === "object") {
        eventData = completedBooking.event;
    }
};

// DISPLAY EVENT DETAILS

const displayEventInformation = () => {
    if (!eventData) return;

    // Image
    let imageUrl = "";
    if (typeof eventData.bannerImage === "string") {
        imageUrl = eventData.bannerImage;
    } else if (eventData.bannerImage && typeof eventData.bannerImage === "object") {
        imageUrl = eventData.bannerImage.url || eventData.bannerImage.secure_url || "";
    }
    imageUrl = imageUrl || eventData.image || eventData.imageUrl || "https://via.placeholder.com/600x400?text=EventEase";

    if (successEventImage) {
        successEventImage.src = imageUrl;
        successEventImage.alt = eventData.title || eventData.name || "Event";
    }

    // Category
    let category = "Event";
    if (typeof eventData.category === "string") {
        category = eventData.category;
    } else if (eventData.category && typeof eventData.category === "object") {
        category = eventData.category.name || "Event";
    }
    if (successEventCategory) {
        successEventCategory.textContent = category;
    }

    // Title
    if (successEventTitle) {
        successEventTitle.textContent = eventData.title || eventData.name || "Event Booking Confirmed";
    }

    // Date & Time
    if (successEventDate) {
        const rawDate = eventData.eventDate || eventData.date || eventData.startDate;
        const timeStr = eventData.startTime ? ` at ${eventData.startTime}` : "";
        successEventDate.textContent = rawDate ? `${formatDate(rawDate)}${timeStr}` : "--";
    }

    // Location
    let location = eventData.venue || eventData.location || eventData.address || "";
    if (location && typeof location === "object") {
        location =
            location.venueName ||
            location.name ||
            location.address ||
            [location.street, location.city, location.country].filter(Boolean).join(", ") ||
            "";
    }
    if (successEventLocation) {
        successEventLocation.textContent = location || "Online / To be announced";
    }

    // Available Seats
    if (successAvailableSeats) {
        const isFree = eventData.eventType === "free" || Number(eventData.ticketPrice ?? 0) === 0;
        if (isFree) {
            successAvailableSeats.closest("p")?.classList.add("hidden");
        } else {
            successAvailableSeats.closest("p")?.classList.remove("hidden");
            successAvailableSeats.textContent = eventData.availableSeats !== undefined && eventData.availableSeats !== null ? eventData.availableSeats : "--";
        }
    }
};

// DISPLAY BOOKING DETAILS

const displayBookingInformation = () => {
    const bookingId = getBookingId();
    const paymentId = getPaymentId();

    const quantity = Number(
        completedBooking?.ticketQuantity ||
        completedBooking?.quantity ||
        successData?.ticketQuantity ||
        1
    );

    const totalAmount = Number(
        completedBooking?.totalAmount ??
        completedBooking?.totalPrice ??
        completedPayment?.amount ??
        successData?.amount ??
        0
    );

    const paymentMethod =
        completedPayment?.paymentMethod ||
        successData?.paymentMethod ||
        "sslcommerz";

    const transactionId =
        completedPayment?.transactionId ||
        completedPayment?.tran_id ||
        successData?.transactionId ||
        successData?.tran_id ||
        "--";

    const paymentStatus =
        completedPayment?.paymentStatus ||
        completedPayment?.status ||
        successData?.paymentStatus ||
        "paid";

    const isFreeEvent =
        (eventData && (eventData.eventType === "free" || Number(eventData.ticketPrice ?? 0) === 0)) ||
        (completedBooking?.event && (completedBooking.event.eventType === "free" || Number(completedBooking.event.ticketPrice ?? 0) === 0)) ||
        (completedBooking && Number(completedBooking.totalAmount ?? 0) === 0 && (completedBooking.ticketPrice === 0 || completedBooking.ticketPrice === undefined || completedBooking.ticketPrice === null)) ||
        paymentMethod === "free" ||
        paymentMethod === "free_registration";

    const bookingCurrentStatus =
        completedBooking?.bookingStatus ||
        completedBooking?.status ||
        successData?.bookingStatus ||
        "confirmed";

    if (successBookingId) successBookingId.textContent = bookingId || "--";
    if (successTicketQuantity) successTicketQuantity.textContent = quantity;
    if (successPaymentMethod) {
        successPaymentMethod.textContent = isFreeEvent
            ? "Free Registration"
            : paymentMethod === "sslcommerz"
            ? "SSLCommerz"
            : String(paymentMethod).toUpperCase().replace(/_/g, " ");
    }
    if (successTotalAmount) {
        successTotalAmount.textContent = isFreeEvent ? "Free" : formatMoney(totalAmount);
    }
    if (successPaymentId) successPaymentId.textContent = paymentId || "--";
    if (successTransactionId) successTransactionId.textContent = transactionId || "--";

    if (successPaymentStatus) {
        successPaymentStatus.textContent = isFreeEvent ? "CONFIRMED" : String(paymentStatus).toUpperCase();
    }

    if (successBookingStatus) {
        successBookingStatus.textContent = String(bookingCurrentStatus).toUpperCase();
    }
    if (bookingStatus) {
        bookingStatus.textContent = String(bookingCurrentStatus).toUpperCase();
    }

    // Clean up UI for Free vs Paid
    if (isFreeEvent) {
        if (ticketsCard) ticketsCard.classList.add("hidden");
        if (paymentMethodCard) paymentMethodCard.classList.add("hidden");
        if (paymentStatusRow) paymentStatusRow.classList.add("hidden");
        if (paymentIdRow) paymentIdRow.classList.add("hidden");
        if (transactionIdRow) transactionIdRow.classList.add("hidden");
        if (successHeading) successHeading.textContent = "Registration Confirmed!";
        if (successSubheading) successSubheading.textContent = "Your free event registration has been successfully confirmed.";
        if (paymentInfoHeading) paymentInfoHeading.textContent = "Registration Information";
        if (paymentInfoSubheading) paymentInfoSubheading.textContent = "Your event registration is confirmed.";
        if (bookingInfoGrid) bookingInfoGrid.className = "mt-7 grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 sm:grid-cols-2";
    } else {
        if (ticketsCard) ticketsCard.classList.remove("hidden");
        if (paymentMethodCard) paymentMethodCard.classList.remove("hidden");
        if (paymentStatusRow) paymentStatusRow.classList.remove("hidden");
        if (paymentIdRow) paymentIdRow.classList.remove("hidden");
        if (transactionIdRow) transactionIdRow.classList.remove("hidden");
        if (bookingInfoGrid) bookingInfoGrid.className = "mt-7 grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-4";
    }
};

// DISPLAY OTP (Safe)

const displayOTP = () => {
    const otp =
        completedBooking?.otp ||
        completedBooking?.bookingOtp ||
        successData?.otp ||
        successData?.booking?.otp ||
        null;

    if (bookingOtp) {
        bookingOtp.textContent = otp ? String(otp) : "------";
    }

    if (otpMessage) {
        otpMessage.textContent = "Your booking is confirmed.";
        otpMessage.classList.remove("text-red-600");
        otpMessage.classList.add("text-primary");
    }

    const expiry =
        completedBooking?.otpExpiresAt ||
        completedBooking?.bookingOtpExpires ||
        successData?.otpExpiresAt ||
        null;

    if (otpExpiry && expiry) {
        const expiryDate = new Date(expiry);
        if (!Number.isNaN(expiryDate.getTime())) {
            otpExpiry.textContent = `Valid until ${expiryDate.toLocaleTimeString("en-BD", { hour: "numeric", minute: "2-digit" })}`;
        }
    }
};

// API FETCH: BOOKING

const fetchBookingData = async () => {
    const bookingId = getBookingId();
    if (!bookingId) return;

    const authToken = getToken();
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    try {
        let response = await fetch(`${API_URL}/bookings/public/${encodeURIComponent(bookingId)}`, { headers });
        if (!response.ok) {
            response = await fetch(`${API_URL}/bookings/${encodeURIComponent(bookingId)}`, { headers });
        }

        if (response.ok) {
            const result = await response.json();
            const booking = result?.data || result;
            if (booking && (booking._id || booking.id)) {
                completedBooking = booking;
                if (booking.event && typeof booking.event === "object") {
                    eventData = booking.event;
                }
                if (booking.payment && typeof booking.payment === "object") {
                    completedPayment = booking.payment;
                }
                displayEventInformation();
                displayBookingInformation();
                displayOTP();
            }
        }
    } catch (err) {
        console.warn("Could not fetch booking from API:", err);
    }
};

// API FETCH: PAYMENT

const fetchPaymentData = async () => {
    const paymentId = getPaymentId();
    const bookingId = getBookingId();
    if (!paymentId && !bookingId) return;

    const authToken = getToken();
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    try {
        const endpoint = paymentId
            ? `${API_URL}/payments/${encodeURIComponent(paymentId)}`
            : `${API_URL}/payments/booking/${encodeURIComponent(bookingId)}`;

        const response = await fetch(endpoint, { headers });
        if (response.ok) {
            const result = await response.json();
            const payment = result?.data || result;
            if (payment && (payment._id || payment.id || payment.transactionId)) {
                completedPayment = payment;
                displayBookingInformation();
            }
        }
    } catch (err) {
        console.warn("Could not fetch payment details from API:", err);
    }
};

// API FETCH: EVENT

const fetchEventData = async () => {
    const eventId = getEventId();
    if (!eventId) return;

    try {
        const response = await fetch(`${API_URL}/events/${encodeURIComponent(eventId)}`);
        if (response.ok) {
            const result = await response.json();
            const event = result?.data?.event || result?.data || result;
            if (event && (event._id || event.id || event.title)) {
                eventData = event;
                displayEventInformation();
                displayBookingInformation();
            }
        }
    } catch (err) {
        console.warn("Could not fetch event details from API:", err);
    }
};

// GENERATE QR

const generateQRCode = async () => {
    const bookingId = getBookingId();
    if (!bookingId) {
        if (qrMessage) qrMessage.textContent = "Booking ID not found.";
        return;
    }

    if (generateQrButton) {
        generateQrButton.disabled = true;
        generateQrButton.textContent = "Generating QR...";
    }

    try {
        const token = getToken();
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/bookings/${bookingId}/generate-qr`, {
            method: "POST",
            headers
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result?.message || "Failed to generate QR ticket.");

        const data = result?.data || result;
        const qrImage = data?.qrCode || data?.qrUrl || data?.qrImage || data?.booking?.qrCode || data?.booking?.qrUrl || data?.booking?.qrImage;

        if (!qrImage) throw new Error("QR ticket image was not returned.");

        if (qrCode) {
            qrCode.innerHTML = "";
            const image = document.createElement("img");
            image.src = qrImage;
            image.alt = "Booking QR Code";
            image.className = "mx-auto h-56 w-56 rounded-xl bg-white p-2 shadow-inner";
            qrCode.appendChild(image);
        }

        if (qrContainer) qrContainer.classList.remove("hidden");
        if (qrMessage) qrMessage.textContent = "Your QR ticket is ready. Show it at the venue.";
        if (generateQrButton) generateQrButton.textContent = "QR Ticket Generated";

    } catch (error) {
        console.error("QR Error:", error);
        if (qrMessage) qrMessage.textContent = error.message || "Unable to generate QR ticket.";
        if (generateQrButton) {
            generateQrButton.disabled = false;
            generateQrButton.textContent = "Generate QR Ticket";
        }
    }
};

if (generateQrButton) {
    generateQrButton.addEventListener("click", generateQRCode);
}

// INITIALIZE

const initialize = async () => {
    console.log("Initializing Booking & Payment Success Page...");

    // 1. Render immediately from session storage cache and URL params
    loadSessionCache();
    displayEventInformation();
    displayBookingInformation();
    displayOTP();

    // 2. Fetch fresh booking from backend
    await fetchBookingData();

    // 3. Fetch payment details if needed
    await fetchPaymentData();

    // 4. Fetch fresh event details from public API
    await fetchEventData();

    // 5. Final render
    displayEventInformation();
    displayBookingInformation();
    displayOTP();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}
