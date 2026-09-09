"use strict";

// ======================================================
// EventEase Payment Page
// SSLCommerz Sandbox Hosted Checkout
// ======================================================
//
// FLOW
//
// payment.html?id=EVENT_ID
//      ↓
// Load event from /api/v1/events/:id
//      ↓
// Display event + ticket quantity selector
//      ↓
// User clicks "Continue to Payment"
//      ↓
// POST /api/v1/bookings { eventId, ticketQuantity }
//      ↓
// Backend creates/reuses pending booking
//      ↓
// POST /api/v1/payments/create { booking: bookingId }
//      ↓
// Backend creates SSLCOMMERZ session
//      ↓
// Redirect to SSLCOMMERZ Sandbox hosted checkout
//      ↓
// VISA / MasterCard / bKash / Nagad / Internet Banking
//      ↓
// SSLCOMMERZ callback (success/fail/cancel/ipn)
//      ↓
// Backend validates payment → OTP → otp-verification.html
//
// ======================================================


// ======================================================
// CONFIG
// ======================================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// ======================================================
// STATE
// ======================================================

let bookingId = null;

let bookingData = null;

let eventData = null;

let ticketQuantity = 1;

let isProcessing = false;

let useExistingBooking = false;


// ======================================================
// AUTH TOKEN
// ======================================================

const getAuthToken = () => {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken") ||
        sessionStorage.getItem("authToken")
    );

};


const requireAuth = () => {

    const token =
        getAuthToken();


    if (!token) {

        throw new Error(
            "Your session has expired. Please log in again."
        );

    }


    return token;

};


// ======================================================
// API REQUEST
// ======================================================

const apiRequest = async (
    endpoint,
    options = {}
) => {

    const token =
        requireAuth();


    const headers = {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${token}`,

        ...(options.headers || {})

    };


    let response;


    try {

        response =
            await fetch(
                `${API_BASE_URL}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );

    } catch (error) {

        console.error(
            "API Connection Error:",
            error
        );

        throw new Error(
            "Unable to connect to the server. Please make sure the backend server is running."
        );

    }


    let result = {};


    try {

        result =
            await response.json();

    } catch (error) {

        result = {};

    }


    if (!response.ok) {

        throw new Error(

            result.message ||
            result.error ||
            "Something went wrong while processing your request."

        );

    }


    return result;

};


// ======================================================
// DOM ELEMENTS
// ======================================================

// Loading

const paymentLoading =
    document.getElementById(
        "paymentLoading"
    );


// Error

const paymentError =
    document.getElementById(
        "paymentError"
    );

const paymentErrorMessage =
    document.getElementById(
        "paymentErrorMessage"
    );


// Content

const paymentContent =
    document.getElementById(
        "paymentContent"
    );


// Event display elements

const eventImage =
    document.getElementById(
        "eventImage"
    );

const eventCategory =
    document.getElementById(
        "eventCategory"
    );

const eventTitle =
    document.getElementById(
        "eventTitle"
    );

const eventDate =
    document.getElementById(
        "eventDate"
    );

const eventLocation =
    document.getElementById(
        "eventLocation"
    );

const availableSeatsElement =
    document.getElementById(
        "availableSeats"
    );

const eventTypeBadge =
    document.getElementById(
        "eventTypeBadge"
    );


// Quantity controls

const decreaseQuantity =
    document.getElementById(
        "decreaseQuantity"
    );

const increaseQuantity =
    document.getElementById(
        "increaseQuantity"
    );

const ticketQuantityElement =
    document.getElementById(
        "ticketQuantity"
    );

const quantityMessage =
    document.getElementById(
        "quantityMessage"
    );


// Price display

const ticketPrice =
    document.getElementById(
        "ticketPrice"
    );


// Summary sidebar

const summaryPrice =
    document.getElementById(
        "summaryPrice"
    );

const summaryQuantity =
    document.getElementById(
        "summaryQuantity"
    );

const summarySubtotal =
    document.getElementById(
        "summarySubtotal"
    );

const summaryTotal =
    document.getElementById(
        "summaryTotal"
    );


// Button

const confirmPaymentButton =
    document.getElementById(
        "confirmPaymentButton"
    );


// Processing indicator

const bookingProcessingMessage =
    document.getElementById(
        "bookingProcessingMessage"
    );


// Back button

const backButton =
    document.getElementById(
        "backButton"
    );


// Retry button

const retryButton =
    document.getElementById(
        "retryButton"
    );


// ======================================================
// GET EVENT ID FROM URL
// ======================================================
// Supports:
//   payment.html?id=EVENT_ID
//   payment.html?eventId=EVENT_ID

const getEventId = () => {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get("id") ||
        params.get("eventId")
    );

};


// ======================================================
// GET BOOKING ID FROM URL
// ======================================================
// Supports:
//   payment.html?bookingId=BOOKING_ID

const getBookingId = () => {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get("bookingId");

};


// ======================================================
// UI HELPERS
// ======================================================

const hideLoading = () => {

    if (paymentLoading) {

        paymentLoading.classList.add(
            "hidden"
        );

    }

};


const showContent = () => {

    hideLoading();


    if (paymentContent) {

        paymentContent.classList.remove(
            "hidden"
        );

    }


    if (paymentError) {

        paymentError.classList.add(
            "hidden"
        );

    }

};


const showError = (
    message
) => {

    console.error(
        "Payment Page Error:",
        message
    );


    hideLoading();


    if (paymentContent) {

        paymentContent.classList.add(
            "hidden"
        );

    }


    if (paymentErrorMessage) {

        paymentErrorMessage.textContent =
            message;

    }


    if (paymentError) {

        paymentError.classList.remove(
            "hidden"
        );

    }

};


// ======================================================
// FORMAT MONEY
// ======================================================

const formatMoney = (
    amount
) => {

    const numericAmount =
        Number(amount || 0);


    return `৳${numericAmount.toLocaleString(
        "en-BD"
    )}`;

};


// ======================================================
// FORMAT DATE
// ======================================================

const formatDate = (
    date
) => {

    if (!date) {

        return "Date not available";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return date;

    }


    return parsedDate.toLocaleDateString(
        "en-BD",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

};


// ======================================================
// GET EVENT IMAGE URL
// ======================================================

const getEventImage = (
    event
) => {

    if (!event) {

        return "";

    }


    if (
        typeof event.bannerImage ===
        "string"
    ) {

        return event.bannerImage;

    }


    if (
        event.bannerImage &&
        typeof event.bannerImage ===
            "object"
    ) {

        return (
            event.bannerImage.url ||
            event.bannerImage.secure_url ||
            ""
        );

    }


    if (
        typeof event.image ===
        "string"
    ) {

        return event.image;

    }


    if (
        typeof event.imageUrl ===
        "string"
    ) {

        return event.imageUrl;

    }


    return "";

};


// ======================================================
// EXTRACT EVENT FROM API RESPONSE
// ======================================================
// Handles multiple backend response shapes:
//   result.data.event       → { success, data: { event: {...} } }
//   result.data             → { success, data: {...} } where data IS the event
//   result.event            → { event: {...} }
//   result                  → event directly

const extractEvent = (
    result
) => {

    if (
        result &&
        result.data &&
        typeof result.data ===
            "object"
    ) {

        if (
            result.data.event &&
            typeof result.data.event ===
                "object"
        ) {

            return result.data.event;

        }


        if (
            result.data._id &&
            (
                result.data.title ||
                result.data.name
            )
        ) {

            return result.data;

        }

    }


    if (
        result &&
        result.event &&
        typeof result.event ===
            "object"
    ) {

        return result.event;

    }


    if (
        result &&
        result._id &&
        (
            result.title ||
            result.name
        )
    ) {

        return result;

    }


    return null;

};


// ======================================================
// LOAD EVENT
// ======================================================
//
// GET /api/v1/events/:id
//
// Response:
// {
//   success: true,
//   data: event
// }
//
// ======================================================

const loadEvent = async () => {

    const eventId =
        getEventId();


    if (!eventId) {

        throw new Error(
            "Event information is missing. Please return to the event page and try again."
        );

    }


    console.log(
        "Loading Event:",
        eventId
    );


    const result =
        await apiRequest(
            `/events/${encodeURIComponent(eventId)}`
        );


    console.log(
        "Event API Response:",
        result
    );


    eventData =
        extractEvent(result);


    if (!eventData) {

        throw new Error(
            "Unable to load event information."
        );

    }


    console.log(
        "Event Data:",
        eventData
    );


    renderEvent();

    updateQuantityUI();

    showContent();

};


// ======================================================
// LOAD BOOKING BY ID
// ======================================================
//
// GET /api/v1/bookings/:id
//
// Used when payment.html is opened with ?bookingId=...
// The backend validates ownership and eligibility.
//
// ======================================================

const loadBooking = async () => {

    if (!bookingId) {

        throw new Error(
            "Booking information is missing. Please return to your bookings and try again."
        );

    }


    console.log(
        "Loading Booking:",
        bookingId
    );


    const result =
        await apiRequest(
            `/bookings/${encodeURIComponent(bookingId)}`
        );


    console.log(
        "Booking API Response:",
        result
    );


    bookingData =
        result.data ||
        result;


    if (!bookingData) {

        throw new Error(
            "Unable to load booking information."
        );

    }


    const payment =
        bookingData.payment ||
        {};


    const paymentStatus =
        String(
            payment.paymentStatus ||
            payment.status ||
            ""
        ).toLowerCase();


    if (paymentStatus === "paid") {

        throw new Error(
            "This booking has already been paid. No further payment is required."
        );

    }


    if (
        bookingData.bookingStatus ===
        "cancelled"
    ) {

        throw new Error(
            "This booking has been cancelled and cannot be paid for."
        );

    }


    eventData =
        bookingData.event || {};


    ticketQuantity =
        Number(
            bookingData.ticketQuantity ||
            1
        );


    console.log(
        "Booking Data:",
        bookingData
    );


    console.log(
        "Event Data:",
        eventData
    );


    renderEvent();

    updateQuantityUI();

    showContent();

};


// ======================================================
// RENDER EVENT
// ======================================================

const renderEvent = () => {

    if (!eventData) {

        return;

    }


    // Title

    if (eventTitle) {

        eventTitle.textContent =
            eventData.title ||
            eventData.name ||
            "Event";

    }


    // Category

    if (eventCategory) {

        let categoryName =
            "Event";


        if (
            typeof eventData.category ===
            "string"
        ) {

            categoryName =
                eventData.category;

        }


        if (
            eventData.category &&
            typeof eventData.category ===
                "object"
        ) {

            categoryName =
                eventData.category.name ||
                "Event";

        }


        eventCategory.textContent =
            categoryName;

    }


    // Date

    if (eventDate) {

        eventDate.textContent =
            formatDate(
                eventData.eventDate ||
                eventData.date
            );

    }


    // Location

    if (eventLocation) {

        eventLocation.textContent =
            eventData.location ||
            eventData.venue ||
            eventData.venueName ||
            eventData.address ||
            "Location not available";

    }


    // Available Seats

    if (availableSeatsElement) {

        availableSeatsElement.textContent =
            eventData.availableSeats ??
            "-";

    }


    if (isFreeEvent()) {

        const availableSeatsSection =
            document.getElementById(
                "availableSeatsSection"
            );


        const ticketPriceSection =
            document.getElementById(
                "ticketPriceSection"
            );


        if (availableSeatsSection) {
            availableSeatsSection.classList.add(
                "hidden"
            );
        }


        if (ticketPriceSection) {
            ticketPriceSection.classList.add(
                "hidden"
            );
        }

    }


    // Event Type Badge

    if (eventTypeBadge) {

        const free =
            isFreeEvent();


        eventTypeBadge.textContent =
            free
                ? "FREE EVENT"
                : "PAID EVENT";

    }


    // Image

    if (eventImage) {

        const imageUrl =
            getEventImage(
                eventData
            );


        if (imageUrl) {

            eventImage.src =
                imageUrl;

        } else {

            eventImage.src =
                "https://via.placeholder.com/800x500?text=Event";

        }

    }


    // Free event / paid event UI toggles

    const freeEventMessage =
        document.getElementById(
            "freeEventMessage"
        );

    const paymentMethodSection =
        document.getElementById(
            "paymentMethodSection"
        );


    if (isFreeEvent()) {

        if (freeEventMessage) {

            freeEventMessage.classList.remove(
                "hidden"
            );

        }


        if (paymentMethodSection) {

            paymentMethodSection.classList.add(
                "hidden"
            );

        }


        if (confirmPaymentButton) {

            confirmPaymentButton.textContent =
                "Confirm Free Booking";

        }

    } else {

        if (freeEventMessage) {

            freeEventMessage.classList.add(
                "hidden"
            );

        }


        if (paymentMethodSection) {

            paymentMethodSection.classList.remove(
                "hidden"
            );

        }


        if (confirmPaymentButton) {

            confirmPaymentButton.textContent =
                "Continue to Payment";

        }

    }

};


// ======================================================
// GET TICKET PRICE
// ======================================================

const getTicketPrice = () => {

    if (!eventData) {

        return 0;

    }


    return Number(
        eventData.ticketPrice ||
        eventData.price ||
        0
    );

};


// ======================================================
// IS FREE EVENT
// ======================================================

const isFreeEvent = () => {

    if (!eventData) {

        return false;

    }


    return (
        eventData.eventType ===
        "free"
    );

};


// ======================================================
// GET MAX TICKETS
// ======================================================

const getMaxTickets = () => {

    if (!eventData) {

        return 10;

    }


    const configuredLimit =
        Number(
            eventData.maxTicketsPerUser
        );


    if (
        configuredLimit > 0
    ) {

        return Math.min(
            configuredLimit,
            10
        );

    }


    return 10;

};


// ======================================================
// UPDATE QUANTITY UI
// ======================================================

const updateQuantityUI = () => {

    const price =
        getTicketPrice();


    const maxTickets =
        getMaxTickets();


    if (
        ticketQuantity >
        maxTickets
    ) {

        ticketQuantity =
            maxTickets;

    }


    if (
        ticketQuantity < 1
    ) {

        ticketQuantity =
            1;

    }


    const subtotal =
        price *
        ticketQuantity;


    // Quantity display

    if (ticketQuantityElement) {

        ticketQuantityElement.textContent =
            ticketQuantity;

    }


    // Ticket price

    if (ticketPrice) {

        ticketPrice.textContent =
            formatMoney(
                price
            );

    }


    // Summary price

    if (summaryPrice) {

        summaryPrice.textContent =
            formatMoney(
                price
            );

    }


    // Summary quantity

    if (summaryQuantity) {

        summaryQuantity.textContent =
            ticketQuantity;

    }


    // Subtotal

    if (summarySubtotal) {

        summarySubtotal.textContent =
            formatMoney(
                subtotal
            );

    }


    // Total

    if (summaryTotal) {

        summaryTotal.textContent =
            formatMoney(
                subtotal
            );

    }


    // Quantity message

    if (quantityMessage) {

        const availableSeats =
            Number(
                eventData?.availableSeats || 0
            );


        quantityMessage.textContent =
            `Maximum ${maxTickets} ticket(s) per user${
                availableSeats
                    ? ` • ${availableSeats} seat(s) currently available`
                    : ""
            }.`;

    }


    // Decrease button

    if (decreaseQuantity) {

        decreaseQuantity.disabled =
            ticketQuantity <= 1;

    }


    // Increase button

    if (increaseQuantity) {

        const availableSeats =
            Number(
                eventData?.availableSeats || 0
            );


        const cannotIncrease =
            ticketQuantity >= maxTickets ||
            (
                eventData?.eventType !== "free" &&
                availableSeats > 0 &&
                ticketQuantity >= availableSeats
            );


        increaseQuantity.disabled =
            cannotIncrease;

    }


    // Confirm button

    if (
        confirmPaymentButton &&
        !isProcessing
    ) {

        const availableSeats =
            eventData?.availableSeats;


        const hasSeats =
            eventData?.eventType === "free" ||
            availableSeats == null ||
            Number(
                availableSeats
            ) >= ticketQuantity;


        confirmPaymentButton.disabled =
            ticketQuantity < 1 ||
            !hasSeats;

    }

};


// ======================================================
// INCREASE QUANTITY
// ======================================================

const increaseTicketQuantity = () => {

    const maxTickets =
        getMaxTickets();


    if (
        ticketQuantity >=
        maxTickets
    ) {

        return;

    }


    const availableSeats =
        Number(
            eventData?.availableSeats ||
            0
        );


    if (
        availableSeats > 0 &&
        ticketQuantity >=
            availableSeats
    ) {

        return;

    }


    ticketQuantity++;


    updateQuantityUI();

};


// ======================================================
// DECREASE QUANTITY
// ======================================================

const decreaseTicketQuantity = () => {

    if (
        ticketQuantity <= 1
    ) {

        return;

    }


    ticketQuantity--;


    updateQuantityUI();

};


// ======================================================
// CREATE BOOKING
// ======================================================
//
// POST /api/v1/bookings
// Body: { eventId, ticketQuantity }
//
// Only called when no existing bookingId is in the URL.
// ======================================================

const createBooking = async () => {

    if (!eventData) {

        throw new Error(
            "Event information is not available."
        );

    }


    if (
        ticketQuantity < 1
    ) {

        throw new Error(
            "Please select at least 1 ticket."
        );

    }


    const availableSeats =
        Number(
            eventData.availableSeats ||
            0
        );


    if (
        availableSeats <
        ticketQuantity
    ) {

        throw new Error(
            `Only ${availableSeats} seat(s) are available.`
        );

    }


    console.log(
        "STEP 1: Creating booking..."
    );


    const eventIdValue =
        eventData._id ||
        eventData.id ||
        getEventId() ||
        (bookingData?.event?._id || bookingData?.event?.id || bookingData?.event);

    const result =
        await apiRequest(
            "/bookings",
            {
                method: "POST",

                body:
                    JSON.stringify({

                        eventId:
                            eventIdValue,

                        ticketQuantity

                    })

            }
        );


    console.log(
        "Create Booking Response:",
        result
    );


    const data =
        result.data ||
        result;


    if (!data) {

        throw new Error(
            "Booking response is empty."
        );

    }


    const newBooking =
        data.booking ||
        data;


    if (
        !newBooking ||
        !(
            newBooking._id ||
            newBooking.id
        )
    ) {

        throw new Error(
            "Booking ID was not returned by the server."
        );

    }


    const createdBookingId =
        newBooking._id ||
        newBooking.id;


    sessionStorage.setItem(
        "paymentBookingId",
        createdBookingId
    );


    sessionStorage.setItem(
        "paymentBookingData",
        JSON.stringify(
            newBooking
        )
    );


    console.log(
        "Booking Created:",
        createdBookingId
    );


    return newBooking;

};


// ======================================================
// PROCESS FREE BOOKING
// ======================================================

const processFreeBooking = async (
    booking
) => {

    const createdBookingId =
        booking._id ||
        booking.id;


    if (!createdBookingId) {

        throw new Error(
            "Booking ID is missing."
        );

    }


    sessionStorage.setItem(
        "confirmedBookingId",
        createdBookingId
    );


    sessionStorage.setItem(
        "paymentBookingId",
        createdBookingId
    );


    sessionStorage.setItem(
        "paymentBookingData",
        JSON.stringify(
            booking
        )
    );


    const otpData = {

        payment: null,

        booking,

        otp:
            booking.bookingOtp ||
            booking.otp ||
            null,

        otpExpiresAt:
            booking.bookingOtpExpires ||
            booking.bookingOtpExpiresAt ||
            booking.otpExpiresAt ||
            null,

        paymentMethod:
            "free"

    };


    sessionStorage.setItem(
        "paymentSuccessData",
        JSON.stringify(
            otpData
        )
    );


    console.log(
        "Free booking created."
    );


    window.location.href =
        `./otp-verification.html?bookingId=${encodeURIComponent(
            createdBookingId
        )}`;

};


// ======================================================
// CREATE SSLCommerz PAYMENT SESSION
// ======================================================
//
// Backend: POST /api/v1/payments/create
// Body:   { booking: bookingId }
// Returns: { success, data: { payment, gatewayPageURL, sessionkey, transactionId } }
//
// ======================================================

const createSSLCommerzPayment = async (
    booking
) => {

    const bookingId =
        booking._id ||
        booking.id;


    if (!bookingId) {

        throw new Error(
            "Booking ID is missing."
        );

    }


    console.log(
        "STEP 2: Creating SSLCommerz payment session..."
    );


    const result =
        await apiRequest(
            "/payments/create",
            {
                method: "POST",

                body:
                    JSON.stringify({

                        booking:
                            bookingId

                    })

            }
        );


    console.log(
        "SSLCommerz Session Response:",
        result
    );


    const data =
        result.data ||
        result;


    if (!data) {

        throw new Error(
            "SSLCommerz payment response is empty."
        );

    }


    const payment =
        data.payment ||
        null;


    const gatewayPageURL =
        data.gatewayPageURL ||
        data.GatewayPageURL;


    if (!gatewayPageURL) {

        throw new Error(
            "SSLCommerz Gateway URL was not returned by the server."
        );

    }


    if (payment) {

        const paymentId =
            payment._id ||
            payment.id;


        if (paymentId) {

            sessionStorage.setItem(
                "paymentId",
                paymentId
            );

        }

    }


    sessionStorage.setItem(
        "paymentMethod",
        "sslcommerz"
    );


    sessionStorage.setItem(
        "paymentGateway",
        "sslcommerz"
    );


    sessionStorage.setItem(
        "paymentCreatedData",
        JSON.stringify(
            data
        )
    );


    sessionStorage.setItem(
        "paymentBookingId",
        bookingId
    );


    sessionStorage.setItem(
        "paymentBookingData",
        JSON.stringify(
            booking
        )
    );


    console.log(
        "SSLCommerz Gateway URL:",
        gatewayPageURL
    );


    window.location.href =
        gatewayPageURL;

};


// ======================================================
// HANDLE CONTINUE (Pay Now button)
// ======================================================

const handleContinue = async () => {

    if (isProcessing) {

        return;

    }


    try {

        isProcessing =
            true;


        if (paymentError) {

            paymentError.classList.add(
                "hidden"
            );

        }


        if (confirmPaymentButton) {

            confirmPaymentButton.disabled =
                true;


            confirmPaymentButton.textContent =
                isFreeEvent()
                    ? "Confirming..."
                    : "Connecting to Payment...";

        }


        if (bookingProcessingMessage) {

            bookingProcessingMessage.classList.remove(
                "hidden"
            );

        }


        const booking =
            await createBooking();


        if (
            isFreeEvent()
        ) {

            await processFreeBooking(
                booking
            );

            return;

        }


        await createSSLCommerzPayment(
            booking
        );


    } catch (error) {

        console.error(
            "Booking / Payment Error:",
            error
        );


        showError(
            error.message ||
            "Unable to complete your booking."
        );


        if (confirmPaymentButton) {

            confirmPaymentButton.disabled =
                false;


            confirmPaymentButton.textContent =
                isFreeEvent()
                    ? "Confirm Free Booking"
                    : "Continue to Payment";

        }


        if (bookingProcessingMessage) {

            bookingProcessingMessage.classList.add(
                "hidden"
            );

        }

    } finally {

        isProcessing =
            false;

    }

};


// ======================================================
// BACK BUTTON
// ======================================================

const handleBack = () => {

    window.history.back();

};


// ======================================================
// RETRY BUTTON
// ======================================================

const handleRetry = () => {

    window.location.reload();

};


// ======================================================
// EVENT LISTENERS
// ======================================================

const setupEventListeners = () => {

    if (increaseQuantity) {

        increaseQuantity.addEventListener(
            "click",
            increaseTicketQuantity
        );

    }


    if (decreaseQuantity) {

        decreaseQuantity.addEventListener(
            "click",
            decreaseTicketQuantity
        );

    }


    if (confirmPaymentButton) {

        confirmPaymentButton.addEventListener(
            "click",
            handleContinue
        );

    }


    if (backButton) {

        backButton.addEventListener(
            "click",
            handleBack
        );

    }


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            handleRetry
        );

    }

};


// ======================================================
// INITIALIZE
// ======================================================

const initialize = async () => {

    try {

        console.log(
            "========================================"
        );

        console.log(
            "EventEase Payment Page"
        );

        console.log(
            "SSLCommerz Sandbox Mode"
        );

        console.log(
            "Hosted Checkout Enabled"
        );

        console.log(
            "========================================"
        );


        if (!getAuthToken()) {

            window.location.href =
                "./user-login.html";

            return;

        }


        setupEventListeners();


        const bookingIdParam =
            getBookingId();


        if (bookingIdParam) {

            bookingId =
                bookingIdParam;

            useExistingBooking =
                true;

            await loadBooking();

        } else {

            const eventId =
                getEventId();


            if (!eventId) {

                throw new Error(
                    "Event information is missing. Please return to the event page and try again."
                );

            }


            await loadEvent();

        }


        console.log(
            "Payment page initialized successfully."
        );


    } catch (error) {

        console.error(
            "Payment page initialization error:",
            error
        );


        showError(
            error.message ||
            "Unable to load event information."
        );

    }

};


// ======================================================
// DOM READY
// ======================================================
//
// The <script> tag is at the end of <body>.
// At that point document.readyState is usually "complete",
// so we must call initialize() immediately in that case.
// ======================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );

} else {

    initialize();

}
