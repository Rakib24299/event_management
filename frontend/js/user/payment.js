"use strict";

// ======================================================
// EventEase Payment / Booking Page
// ======================================================
//
// FINAL PAYMENT FLOW
//
// payment.html
//      ↓
// Select Tickets
//      ↓
// Continue to Payment
//      ↓
// Create Booking
//      ↓
// FREE EVENT
//      ↓
// payment-success.html
//
// PAID EVENT
//      ↓
// Create Booking
//      ↓
// Create Dummy Payment
//      ↓
// Process Dummy Payment
//      ↓
// OTP Verification
//      ↓
// payment-success.html
//
// PAYMENT METHOD
// ONLY DUMMY PAYMENT
//
// SSLCommerz
// COMPLETELY REMOVED
// ======================================================


// ======================================================
// CONFIG
// ======================================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// ======================================================
// STATE
// ======================================================

let eventId = null;

let eventData = null;

let bookingData = null;

let paymentData = null;

// Only Dummy Payment
let selectedPaymentMethod = "dummy";

let ticketQuantity = 1;

let isProcessing = false;


// ======================================================
// GET AUTH TOKEN
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


// ======================================================
// GET EVENT ID
// ======================================================

const getEventId = () => {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return (
        params.get("id") ||
        params.get("eventId") ||
        params.get("event")
    );

};


// ======================================================
// DOM ELEMENTS
// ======================================================


// ------------------------------------------------------
// Loading
// ------------------------------------------------------

const paymentLoading =
    document.getElementById(
        "paymentLoading"
    );


// ------------------------------------------------------
// Error
// ------------------------------------------------------

const paymentError =
    document.getElementById(
        "paymentError"
    );

const paymentErrorMessage =
    document.getElementById(
        "paymentErrorMessage"
    );


// ------------------------------------------------------
// Content
// ------------------------------------------------------

const paymentContent =
    document.getElementById(
        "paymentContent"
    );


// ------------------------------------------------------
// Event
// ------------------------------------------------------

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


// ------------------------------------------------------
// Quantity
// ------------------------------------------------------

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


// ------------------------------------------------------
// Price
// ------------------------------------------------------

const ticketPrice =
    document.getElementById(
        "ticketPrice"
    );


// ------------------------------------------------------
// Summary
// ------------------------------------------------------

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


// ------------------------------------------------------
// Button
// ------------------------------------------------------

const confirmPaymentButton =
    document.getElementById(
        "confirmPaymentButton"
    );


// ------------------------------------------------------
// Processing message
// ------------------------------------------------------

const bookingProcessingMessage =
    document.getElementById(
        "bookingProcessingMessage"
    );


// ------------------------------------------------------
// Back button
// ------------------------------------------------------

const backButton =
    document.getElementById(
        "backButton"
    );


// ------------------------------------------------------
// Retry
// ------------------------------------------------------

const retryButton =
    document.getElementById(
        "retryButton"
    );


// ======================================================
// AUTH CHECK
// ======================================================

const requireAuth = () => {

    const token =
        getAuthToken();

    if (!token) {

        throw new Error(
            "You are not logged in. Please login first."
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
// SHOW LOADING
// ======================================================

const showLoading = () => {

    if (paymentLoading) {

        paymentLoading.classList.remove(
            "hidden"
        );

    }

};


// ======================================================
// HIDE LOADING
// ======================================================

const hideLoading = () => {

    if (paymentLoading) {

        paymentLoading.classList.add(
            "hidden"
        );

    }

};


// ======================================================
// SHOW CONTENT
// ======================================================

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


// ======================================================
// SHOW ERROR
// ======================================================

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
// GET EVENT IMAGE
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
// EXTRACT EVENT
// ======================================================

const extractEvent = (
    result
) => {

    if (
        result &&
        result.data
    ) {

        if (
            result.data.event
        ) {

            return result.data.event;

        }


        return result.data;

    }


    if (
        result &&
        result.event
    ) {

        return result.event;

    }


    return result;

};


// ======================================================
// LOAD EVENT
// ======================================================

const loadEvent = async () => {

    eventId =
        getEventId();


    if (!eventId) {

        throw new Error(
            "Event ID is missing from the URL."
        );

    }


    console.log(
        "Loading Event:",
        eventId
    );


    const result =
        await apiRequest(
            `/events/${eventId}`
        );


    eventData =
        extractEvent(result);


    if (!eventData) {

        throw new Error(
            "Event information could not be loaded."
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
// RENDER EVENT
// ======================================================

const renderEvent = () => {

    if (!eventData) {

        return;

    }


    // --------------------------------------------------
    // TITLE
    // --------------------------------------------------

    if (eventTitle) {

        eventTitle.textContent =
            eventData.title ||
            eventData.name ||
            "Event";

    }


    // --------------------------------------------------
    // CATEGORY
    // --------------------------------------------------

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


    // --------------------------------------------------
    // DATE
    // --------------------------------------------------

    if (eventDate) {

        eventDate.textContent =
            formatDate(
                eventData.eventDate ||
                eventData.date
            );

    }


    // --------------------------------------------------
    // LOCATION
    // --------------------------------------------------

    if (eventLocation) {

        eventLocation.textContent =
            eventData.location ||
            eventData.venue ||
            eventData.address ||
            "Location not available";

    }


    // --------------------------------------------------
    // AVAILABLE SEATS
    // --------------------------------------------------

    if (availableSeatsElement) {

        availableSeatsElement.textContent =
            eventData.availableSeats ??
            "-";

    }


    // --------------------------------------------------
    // EVENT TYPE
    // --------------------------------------------------

    if (eventTypeBadge) {

        const free =
            isFreeEvent();


        eventTypeBadge.textContent =
            free
                ? "FREE EVENT"
                : "PAID EVENT";

    }


    // --------------------------------------------------
    // IMAGE
    // --------------------------------------------------

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

};


// ======================================================
// GET EVENT PRICE
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


    // --------------------------------------------------
    // Quantity
    // --------------------------------------------------

    if (ticketQuantityElement) {

        ticketQuantityElement.textContent =
            ticketQuantity;

    }


    // --------------------------------------------------
    // Ticket Price
    // --------------------------------------------------

    if (ticketPrice) {

        ticketPrice.textContent =
            formatMoney(
                price
            );

    }


    // --------------------------------------------------
    // Summary Price
    // --------------------------------------------------

    if (summaryPrice) {

        summaryPrice.textContent =
            formatMoney(
                price
            );

    }


    // --------------------------------------------------
    // Summary Quantity
    // --------------------------------------------------

    if (summaryQuantity) {

        summaryQuantity.textContent =
            ticketQuantity;

    }


    // --------------------------------------------------
    // Subtotal
    // --------------------------------------------------

    if (summarySubtotal) {

        summarySubtotal.textContent =
            formatMoney(
                subtotal
            );

    }


    // --------------------------------------------------
    // Total
    // --------------------------------------------------

    if (summaryTotal) {

        summaryTotal.textContent =
            formatMoney(
                subtotal
            );

    }


    // --------------------------------------------------
    // Quantity Message
    // --------------------------------------------------

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


    // --------------------------------------------------
    // Decrease
    // --------------------------------------------------

    if (decreaseQuantity) {

        decreaseQuantity.disabled =
            ticketQuantity <= 1;

    }


    // --------------------------------------------------
    // Increase
    // --------------------------------------------------

    if (increaseQuantity) {

        const availableSeats =
            Number(
                eventData?.availableSeats || 0
            );


        const cannotIncrease =
            ticketQuantity >= maxTickets ||
            (
                availableSeats > 0 &&
                ticketQuantity >= availableSeats
            );


        increaseQuantity.disabled =
            cannotIncrease;

    }


    // --------------------------------------------------
    // Continue Button
    // --------------------------------------------------

    if (
        confirmPaymentButton &&
        !isProcessing
    ) {

        const availableSeats =
            eventData?.availableSeats;


        const hasSeats =
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
// PAYMENT METHOD
// ======================================================
//
// ONLY DUMMY PAYMENT
//
// SSLCommerz completely removed.
// ======================================================

const setupPaymentMethod = () => {

    selectedPaymentMethod =
        "dummy";


    const inputs =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    inputs.forEach(
        (input) => {

            if (
                input.value ===
                "dummy"
            ) {

                input.checked =
                    true;

                input.disabled =
                    false;

            } else {

                // Disable any old payment
                // option that may still exist
                // in HTML.

                input.checked =
                    false;

                input.disabled =
                    true;

            }


            input.addEventListener(
                "change",
                () => {

                    if (
                        input.checked &&
                        input.value ===
                            "dummy"
                    ) {

                        selectedPaymentMethod =
                            "dummy";


                        console.log(
                            "Payment Method: Dummy Payment"
                        );

                    }

                }
            );

        }
    );

};


// ======================================================
// CREATE BOOKING
// ======================================================

const createBooking = async () => {

    if (!eventId) {

        throw new Error(
            "Event ID is missing."
        );

    }


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


    const result =
        await apiRequest(
            "/bookings",
            {
                method: "POST",

                body:
                    JSON.stringify({

                        eventId,

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


    bookingData =
        data.booking ||
        data;


    if (
        !bookingData ||
        !(
            bookingData._id ||
            bookingData.id
        )
    ) {

        throw new Error(
            "Booking ID was not returned by the server."
        );

    }


    const createdBookingId =
        bookingData._id ||
        bookingData.id;


    // --------------------------------------------------
    // SAVE BOOKING DATA
    // --------------------------------------------------

    sessionStorage.setItem(
        "paymentBookingId",
        createdBookingId
    );


    sessionStorage.setItem(
        "paymentBookingData",
        JSON.stringify(
            bookingData
        )
    );


    console.log(
        "Booking Created:",
        createdBookingId
    );


    return bookingData;

};


// ======================================================
// FREE EVENT
// ======================================================
//
// Free event does not need payment.
//
// IMPORTANT:
// If your backend requires OTP for FREE events too,
// this section can later be changed to send the user
// to OTP verification.
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
        "Free booking created. Redirecting to OTP verification..."
    );


    window.location.href =
        `./otp-verification.html?bookingId=${encodeURIComponent(
            createdBookingId
        )}`;

};


// ======================================================
// CREATE PAYMENT
// ======================================================
//
// Only Dummy Payment is created.
// ======================================================

const createPayment = async (
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


    console.log(
        "STEP 2: Creating dummy payment..."
    );


    selectedPaymentMethod =
        "dummy";


    const result =
        await apiRequest(
            "/payments",
            {
                method: "POST",

                body:
                    JSON.stringify({

                        booking:
                            createdBookingId,

                        paymentMethod:
                            "dummy"

                    })

            }
        );


    console.log(
        "Create Payment Response:",
        result
    );


    const data =
        result.data ||
        result;


    paymentData =
        data.payment ||
        data;


    if (!paymentData) {

        throw new Error(
            "Payment information was not returned by the server."
        );

    }


    const createdPaymentId =
        paymentData._id ||
        paymentData.id;


    if (!createdPaymentId) {

        throw new Error(
            "Payment ID was not returned by the server."
        );

    }


    // --------------------------------------------------
    // SAVE PAYMENT
    // --------------------------------------------------

    sessionStorage.setItem(
        "paymentId",
        createdPaymentId
    );


    sessionStorage.setItem(
        "paymentMethod",
        "dummy"
    );


    sessionStorage.setItem(
        "paymentCreatedData",
        JSON.stringify(
            paymentData
        )
    );


    return paymentData;

};


// ======================================================
// DUMMY PAYMENT
// ======================================================
//
// IMPORTANT:
//
// Dummy payment does NOT directly redirect to
// payment-success.html.
//
// It goes to OTP verification first.
//
// Flow:
//
// Dummy Payment
//      ↓
// OTP Verification
//      ↓
// Success
//
// ======================================================

const processDummyPayment = async (
    payment
) => {

    const paymentId =
        payment._id ||
        payment.id;


    if (!paymentId) {

        throw new Error(
            "Payment ID is missing."
        );

    }


    console.log(
        "STEP 3: Processing dummy payment..."
    );


    const result =
        await apiRequest(
            `/payments/${paymentId}/dummy`,
            {
                method: "PATCH",

                body:
                    JSON.stringify({

                        paymentResult:
                            "success"

                    })

            }
        );


    console.log(
        "Dummy Payment Response:",
        result
    );


    const responseData =
        result.data ||
        result;


    if (!responseData) {

        throw new Error(
            "Invalid dummy payment response."
        );

    }


    // --------------------------------------------------
    // Get booking
    // --------------------------------------------------

    const successfulBooking =
        responseData.booking ||
        bookingData;


    if (!successfulBooking) {

        throw new Error(
            "Booking information was not returned after dummy payment."
        );

    }


    const successfulBookingId =
        successfulBooking._id ||
        successfulBooking.id;


    if (!successfulBookingId) {

        throw new Error(
            "Booking ID is missing after dummy payment."
        );

    }


    // --------------------------------------------------
    // SAVE DATA FOR OTP PAGE
    // --------------------------------------------------

    const otpData = {

        payment:
            responseData.payment ||
            payment,

        booking:
            successfulBooking,

        paymentId,

        bookingId:
            successfulBookingId,

        paymentMethod:
            "dummy",

        // Preserve OTP information if backend
        // returns it.
        otp:
            responseData.otp ||
            successfulBooking.otp ||
            null,

        otpExpiresAt:
            responseData.otpExpiresAt ||
            successfulBooking.otpExpiresAt ||
            null

    };


    sessionStorage.setItem(
        "otpVerificationData",
        JSON.stringify(
            otpData
        )
    );


    sessionStorage.setItem(
        "paymentSuccessData",
        JSON.stringify(
            otpData
        )
    );


    sessionStorage.setItem(
        "confirmedBookingId",
        successfulBookingId
    );


    sessionStorage.setItem(
        "paymentId",
        paymentId
    );


    sessionStorage.setItem(
        "paymentMethod",
        "dummy"
    );


    console.log(
        "Dummy payment completed."
    );


    console.log(
        "Redirecting to OTP verification..."
    );


    // ==================================================
    // GO TO OTP VERIFICATION
    // ==================================================

    window.location.href =
        `./otp-verification.html?bookingId=${encodeURIComponent(
            successfulBookingId
        )}&paymentId=${encodeURIComponent(
            paymentId
        )}`;

};


// ======================================================
// HANDLE CONTINUE BUTTON
// ======================================================
//
// MAIN FLOW:
//
// Continue
//    ↓
// Create Booking
//    ↓
// Free Event?
//    │
//    ├── YES → Success
//    │
//    └── NO
//         ↓
//      Create Dummy Payment
//         ↓
//      Process Dummy Payment
//         ↓
//      OTP Verification
//         ↓
//      Success
//
// ======================================================

const handleContinue = async () => {

    if (isProcessing) {

        return;

    }


    try {

        isProcessing =
            true;


        // ------------------------------------------------
        // Hide previous error
        // ------------------------------------------------

        if (paymentError) {

            paymentError.classList.add(
                "hidden"
            );

        }


        // ------------------------------------------------
        // Button loading
        // ------------------------------------------------

        if (confirmPaymentButton) {

            confirmPaymentButton.disabled =
                true;

            confirmPaymentButton.textContent =
                "Processing...";

        }


        // ------------------------------------------------
        // Processing message
        // ------------------------------------------------

        if (bookingProcessingMessage) {

            bookingProcessingMessage.classList.remove(
                "hidden"
            );

        }


        // =================================================
        // STEP 1
        // CREATE BOOKING
        // =================================================

        console.log(
            "========================================"
        );

        console.log(
            "STEP 1: Creating booking..."
        );

        console.log(
            "========================================"
        );


        const booking =
            await createBooking();


        // =================================================
        // STEP 2
        // FREE EVENT
        // =================================================

        if (
            isFreeEvent()
        ) {

            console.log(
                "STEP 2: Free event."
            );


            await processFreeBooking(
                booking
            );


            return;

        }


        // =================================================
        // STEP 2
        // PAID EVENT
        // =================================================

        console.log(
            "STEP 2: Paid event."
        );


        // =================================================
        // STEP 3
        // CREATE DUMMY PAYMENT
        // =================================================

        console.log(
            "STEP 3: Creating dummy payment..."
        );


        const payment =
            await createPayment(
                booking
            );


        // =================================================
        // STEP 4
        // PROCESS DUMMY PAYMENT
        // =================================================

        console.log(
            "STEP 4: Processing dummy payment..."
        );


        await processDummyPayment(
            payment
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


        // ------------------------------------------------
        // Restore button
        // ------------------------------------------------

        if (confirmPaymentButton) {

            confirmPaymentButton.disabled =
                false;

            confirmPaymentButton.textContent =
                "Continue to Payment";

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

    // --------------------------------------------------
    // Increase
    // --------------------------------------------------

    if (increaseQuantity) {

        increaseQuantity.addEventListener(
            "click",
            increaseTicketQuantity
        );

    }


    // --------------------------------------------------
    // Decrease
    // --------------------------------------------------

    if (decreaseQuantity) {

        decreaseQuantity.addEventListener(
            "click",
            decreaseTicketQuantity
        );

    }


    // --------------------------------------------------
    // CONTINUE TO PAYMENT
    // --------------------------------------------------

    if (confirmPaymentButton) {

        confirmPaymentButton.addEventListener(
            "click",
            handleContinue
        );

    }


    // --------------------------------------------------
    // BACK
    // --------------------------------------------------

    if (backButton) {

        backButton.addEventListener(
            "click",
            handleBack
        );

    }


    // --------------------------------------------------
    // RETRY
    // --------------------------------------------------

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
            "Dummy Payment Mode"
        );

        console.log(
            "OTP Verification Enabled"
        );

        console.log(
            "SSLCommerz Removed"
        );

        console.log(
            "========================================"
        );


        // ------------------------------------------------
        // Authentication
        // ------------------------------------------------

        if (!getAuthToken()) {

            throw new Error(
                "You are not logged in. Please login first."
            );

        }


        // ------------------------------------------------
        // Setup event listeners
        // ------------------------------------------------

        setupEventListeners();


        // ------------------------------------------------
        // Setup payment method
        // ------------------------------------------------

        setupPaymentMethod();


        // ------------------------------------------------
        // Load event
        // ------------------------------------------------

        await loadEvent();


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