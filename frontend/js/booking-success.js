// ======================================================
// EventEase Booking / Payment Success Page
// ======================================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// ======================================================
// DOM ELEMENTS
// ======================================================

const successEventImage =
    document.getElementById("successEventImage");

const successEventCategory =
    document.getElementById("successEventCategory");

const successEventTitle =
    document.getElementById("successEventTitle");

const successEventDate =
    document.getElementById("successEventDate");

const successEventLocation =
    document.getElementById("successEventLocation");

const successBookingId =
    document.getElementById("successBookingId");

const successTicketQuantity =
    document.getElementById("successTicketQuantity");

const successPaymentMethod =
    document.getElementById("successPaymentMethod");

const successTotalAmount =
    document.getElementById("successTotalAmount");

const successTransactionId =
    document.getElementById("successTransactionId");

const successPaymentStatus =
    document.getElementById("successPaymentStatus");

const successBookingStatus =
    document.getElementById("successBookingStatus");

const bookingStatus =
    document.getElementById("bookingStatus");

const generateQrButton =
    document.getElementById("generateQrButton");

const qrContainer =
    document.getElementById("qrContainer");

const qrCode =
    document.getElementById("qrCode");

const qrMessage =
    document.getElementById("qrMessage");


// ======================================================
// AUTH TOKEN
// ======================================================

function getAuthToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken")
    );

}


// ======================================================
// GLOBAL DATA
// ======================================================

let successData = null;

let completedBooking = null;

let completedPayment = null;

let eventData = null;

let bookingOtp = null;

let otpExpiresAt = null;


// ======================================================
// FORMAT MONEY
// ======================================================

function formatPrice(amount) {

    const value =
        Number(amount || 0);

    return `৳${value.toLocaleString("en-BD")}`;

}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(value) {

    if (!value) {

        return "--";

    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }

    return date.toLocaleDateString(
        "en-BD",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


// ======================================================
// GET ID FROM OBJECT
// ======================================================

function getId(value) {

    if (!value) {

        return null;

    }

    if (
        typeof value === "string"
    ) {

        return value;

    }

    return (
        value._id ||
        value.id ||
        null
    );

}


// ======================================================
// LOAD SUCCESS DATA
// ======================================================

function loadSuccessData() {

    console.log(
        "========== PAYMENT SUCCESS DATA =========="
    );


    // --------------------------------------------------
    // Main data created by payment.js
    // --------------------------------------------------

    const storedSuccess =
        sessionStorage.getItem(
            "paymentSuccessData"
        );


    // --------------------------------------------------
    // Booking data
    // --------------------------------------------------

    const storedBooking =
        sessionStorage.getItem(
            "paymentBookingData"
        );


    // --------------------------------------------------
    // Payment data
    // --------------------------------------------------

    const storedPayment =
        sessionStorage.getItem(
            "paymentCreatedData"
        );


    // --------------------------------------------------
    // Booking ID
    // --------------------------------------------------

    const storedBookingId =
        sessionStorage.getItem(
            "confirmedBookingId"
        ) ||
        sessionStorage.getItem(
            "paymentBookingId"
        );


    console.log(
        "paymentSuccessData:",
        storedSuccess
    );

    console.log(
        "paymentBookingData:",
        storedBooking
    );

    console.log(
        "paymentCreatedData:",
        storedPayment
    );

    console.log(
        "confirmedBookingId:",
        storedBookingId
    );


    // ==================================================
    // PARSE MAIN SUCCESS DATA
    // ==================================================

    if (storedSuccess) {

        try {

            successData =
                JSON.parse(
                    storedSuccess
                );

        } catch (error) {

            console.error(
                "paymentSuccessData parse error:",
                error
            );

        }

    }


    // ==================================================
    // PARSE BOOKING DATA
    // ==================================================

    if (storedBooking) {

        try {

            completedBooking =
                JSON.parse(
                    storedBooking
                );

        } catch (error) {

            console.error(
                "paymentBookingData parse error:",
                error
            );

        }

    }


    // ==================================================
    // PARSE PAYMENT DATA
    // ==================================================

    if (storedPayment) {

        try {

            completedPayment =
                JSON.parse(
                    storedPayment
                );

        } catch (error) {

            console.error(
                "paymentCreatedData parse error:",
                error
            );

        }

    }


    // ==================================================
    // EXTRACT FROM paymentSuccessData
    // ==================================================

    if (successData) {

        completedBooking =
            successData.booking ||
            successData.data?.booking ||
            completedBooking;

        completedPayment =
            successData.payment ||
            successData.data?.payment ||
            completedPayment;


        // OTP

        bookingOtp =
            successData.otp ||
            successData.bookingOtp ||
            successData.data?.otp ||
            successData.data?.bookingOtp ||
            successData.booking?.otp ||
            null;


        // OTP expiry

        otpExpiresAt =
            successData.otpExpiresAt ||
            successData.data?.otpExpiresAt ||
            successData.booking?.otpExpiresAt ||
            null;

    }


    // ==================================================
    // FALLBACK OTP FROM BOOKING
    // ==================================================

    if (!bookingOtp && completedBooking) {

        bookingOtp =
            completedBooking.otp ||
            completedBooking.bookingOtp ||
            null;

    }


    if (!otpExpiresAt && completedBooking) {

        otpExpiresAt =
            completedBooking.otpExpiresAt ||
            null;

    }


    // ==================================================
    // FALLBACK BOOKING ID
    // ==================================================

    if (
        !completedBooking &&
        storedBookingId
    ) {

        completedBooking = {

            _id:
                storedBookingId

        };

    }


    console.log(
        "FINAL SUCCESS DATA:",
        successData
    );

    console.log(
        "FINAL BOOKING:",
        completedBooking
    );

    console.log(
        "FINAL PAYMENT:",
        completedPayment
    );

    console.log(
        "FINAL OTP:",
        bookingOtp
    );


    return !!completedBooking;

}


// ======================================================
// GET BOOKING ID
// ======================================================

function getBookingId() {

    return (
        completedBooking?._id ||
        completedBooking?.id ||
        sessionStorage.getItem(
            "confirmedBookingId"
        ) ||
        sessionStorage.getItem(
            "paymentBookingId"
        ) ||
        null
    );

}


// ======================================================
// GET EVENT ID
// ======================================================

function getEventId() {

    const event =
        completedBooking?.event;


    if (
        typeof event === "string"
    ) {

        return event;

    }


    if (event) {

        return (
            event._id ||
            event.id ||
            null
        );

    }


    return (
        completedBooking?.eventId ||
        completedBooking?.eventID ||
        null
    );

}


// ======================================================
// DISPLAY BOOKING INFORMATION
// ======================================================

function displayBookingInformation() {

    const bookingId =
        getBookingId();


    // --------------------------------------------------
    // Ticket Quantity
    // --------------------------------------------------

    const quantity =
        Number(
            completedBooking?.ticketQuantity ||
            completedBooking?.quantity ||
            completedBooking?.tickets ||
            0
        );


    // --------------------------------------------------
    // Amount
    // --------------------------------------------------

    const totalAmount =
        Number(
            completedBooking?.totalAmount ||
            completedBooking?.totalPrice ||
            completedBooking?.amount ||
            completedPayment?.amount ||
            completedPayment?.totalAmount ||
            0
        );


    // --------------------------------------------------
    // Payment Method
    // --------------------------------------------------

    const paymentMethod =
        completedPayment?.paymentMethod ||
        successData?.paymentMethod ||
        sessionStorage.getItem(
            "paymentMethod"
        ) ||
        (totalAmount === 0
            ? "free"
            : "sslcommerz");


    // --------------------------------------------------
    // Transaction ID
    // --------------------------------------------------

    const transactionId =
        completedPayment?.transactionId ||
        completedPayment?.tran_id ||
        completedPayment?.transactionID ||
        successData?.transactionId ||
        successData?.tran_id ||
        "--";


    // --------------------------------------------------
    // Payment Status
    // --------------------------------------------------

    const paymentStatus =
        completedPayment?.paymentStatus ||
        completedPayment?.status ||
        successData?.paymentStatus ||
        "paid";


    // --------------------------------------------------
    // Booking Status
    // --------------------------------------------------

    const currentBookingStatus =
        completedBooking?.bookingStatus ||
        completedBooking?.status ||
        "pending";


    // --------------------------------------------------
    // Set UI
    // --------------------------------------------------

    if (successBookingId) {

        successBookingId.textContent =
            bookingId || "Not available";

    }


    if (successTicketQuantity) {

        successTicketQuantity.textContent =
            quantity;

    }


    if (successPaymentMethod) {

        successPaymentMethod.textContent =
            String(
                paymentMethod
            ).replace(
                /_/g,
                " "
            );

    }


    if (successTotalAmount) {

        successTotalAmount.textContent =
            formatPrice(
                totalAmount
            );

    }


    if (successTransactionId) {

        successTransactionId.textContent =
            transactionId;

    }


    if (successPaymentStatus) {

        successPaymentStatus.textContent =
            String(
                paymentStatus
            ).toUpperCase();

    }


    if (successBookingStatus) {

        successBookingStatus.textContent =
            String(
                currentBookingStatus
            ).toUpperCase();

    }


    if (bookingStatus) {

        bookingStatus.textContent =
            String(
                currentBookingStatus
            ).toUpperCase();

    }


    console.log(
        "Booking information displayed."
    );

}


// ======================================================
// DISPLAY OTP
// ======================================================

function displayBookingOTP() {

    console.log(
        "Displaying OTP:",
        bookingOtp
    );


    // --------------------------------------------------
    // Find OTP elements
    // --------------------------------------------------

    const otpElement =
        document.getElementById(
            "bookingOtp"
        ) ||
        document.getElementById(
            "successOtp"
        ) ||
        document.getElementById(
            "otpCode"
        );


    const otpMessage =
        document.getElementById(
            "otpMessage"
        );


    if (!otpElement) {

        console.warn(
            "OTP element not found in HTML."
        );

        return;

    }


    // --------------------------------------------------
    // OTP exists
    // --------------------------------------------------

    if (bookingOtp) {

        otpElement.textContent =
            String(
                bookingOtp
            );

        otpElement.classList.remove(
            "text-gray-400"
        );

        otpElement.classList.add(
            "text-primary"
        );


        if (otpMessage) {

            otpMessage.textContent =
                "Use this OTP to verify and confirm your booking. The OTP is valid for 5 minutes.";

        }


        return;

    }


    // --------------------------------------------------
    // OTP not returned
    // --------------------------------------------------

    otpElement.textContent =
        "------";


    if (otpMessage) {

        otpMessage.textContent =
            "OTP was not returned by the server. Please check your booking or try again.";

    }

}


// ======================================================
// LOAD EVENT INFORMATION
// ======================================================

async function loadEventInformation() {

    const eventId =
        getEventId();


    console.log(
        "Event ID:",
        eventId
    );


    if (!eventId) {

        console.warn(
            "Event ID not found in booking."
        );

        if (successEventTitle) {

            successEventTitle.textContent =
                "Event information unavailable";

        }

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/events/${eventId}`,
                {
                    method: "GET",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const result =
            await response.json();


        console.log(
            "Event API Response:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load event."
            );

        }


        // ------------------------------------------------
        // Extract event
        // ------------------------------------------------

        eventData =
            result.data?.event ||
            result.data ||
            result.event ||
            result;


        displayEventInformation(
            eventData
        );


    } catch (error) {

        console.error(
            "Event loading error:",
            error
        );

    }

}


// ======================================================
// DISPLAY EVENT INFORMATION
// ======================================================

function displayEventInformation(event) {

    if (!event) {

        return;

    }


    // --------------------------------------------------
    // IMAGE
    // --------------------------------------------------

    let imageUrl = "";


    if (
        typeof event.bannerImage ===
        "string"
    ) {

        imageUrl =
            event.bannerImage;

    } else if (
        event.bannerImage &&
        typeof event.bannerImage ===
            "object"
    ) {

        imageUrl =
            event.bannerImage.url ||
            event.bannerImage.secure_url ||
            "";

    }


    if (!imageUrl) {

        imageUrl =
            event.image ||
            event.imageUrl ||
            "";

    }


    if (
        successEventImage &&
        imageUrl
    ) {

        successEventImage.src =
            imageUrl;

        successEventImage.onerror =
            function () {

                this.src =
                    "https://via.placeholder.com/600x400?text=EventEase";

            };

    }


    // --------------------------------------------------
    // CATEGORY
    // --------------------------------------------------

    let categoryName =
        "Event";


    if (
        typeof event.category ===
        "string"
    ) {

        categoryName =
            event.category;

    } else if (
        event.category &&
        typeof event.category ===
            "object"
    ) {

        categoryName =
            event.category.name ||
            event.category.title ||
            "Event";

    }


    if (successEventCategory) {

        successEventCategory.textContent =
            categoryName;

    }


    // --------------------------------------------------
    // TITLE
    // --------------------------------------------------

    if (successEventTitle) {

        successEventTitle.textContent =
            event.title ||
            event.name ||
            "Untitled Event";

    }


    // --------------------------------------------------
    // DATE
    // --------------------------------------------------

    if (successEventDate) {

        successEventDate.textContent =
            formatDate(
                event.eventDate ||
                event.date ||
                event.startDate
            );

    }


    // --------------------------------------------------
    // LOCATION
    // --------------------------------------------------

    let locationText =
        "Location not available";


    if (
        typeof event.location ===
        "string"
    ) {

        locationText =
            event.location;

    } else if (
        event.location &&
        typeof event.location ===
            "object"
    ) {

        locationText =
            event.location.name ||
            event.location.address ||
            event.location.venue ||
            event.location.city ||
            "Location not available";

    }


    if (
        locationText ===
        "Location not available"
    ) {

        if (
            typeof event.venue ===
            "string"
        ) {

            locationText =
                event.venue;

        } else if (
            event.venue &&
            typeof event.venue ===
                "object"
        ) {

            locationText =
                event.venue.name ||
                event.venue.address ||
                "Location not available";

        }

    }


    if (successEventLocation) {

        successEventLocation.textContent =
            locationText;

    }


    console.log(
        "Event displayed:",
        event
    );

}


// ======================================================
// GENERATE QR
// ======================================================

async function generateQRCode() {

    const token =
        getAuthToken();


    if (!token) {

        if (qrMessage) {

            qrMessage.textContent =
                "Your login session has expired. Please login again.";

        }

        return;

    }


    const bookingId =
        getBookingId();


    if (!bookingId) {

        if (qrMessage) {

            qrMessage.textContent =
                "Booking ID was not found.";

        }

        return;

    }


    if (generateQrButton) {

        generateQrButton.disabled =
            true;

        generateQrButton.textContent =
            "Generating QR...";

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/bookings/${bookingId}/generate-qr`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const result =
            await response.json();


        console.log(
            "QR Response:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to generate QR."
            );

        }


        const data =
            result.data ||
            result;


        const qrImage =
            data.qrCode ||
            data.qrUrl ||
            data.qrImage ||
            data.booking?.qrCode ||
            data.booking?.qrUrl ||
            data.booking?.qrImage;


        if (!qrImage) {

            throw new Error(
                "QR image was not returned by the server."
            );

        }


        if (qrCode) {

            qrCode.innerHTML = "";


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                qrImage;


            image.alt =
                "Booking QR Code";


            image.className =
                "mx-auto h-56 w-56 rounded-xl bg-white p-2";


            qrCode.appendChild(
                image
            );

        }


        if (qrContainer) {

            qrContainer.classList.remove(
                "hidden"
            );

        }


        if (qrMessage) {

            qrMessage.textContent =
                result.message ||
                "Your QR ticket is ready.";

        }


        if (generateQrButton) {

            generateQrButton.textContent =
                "QR Ticket Generated ✓";

        }


    } catch (error) {

        console.error(
            "QR Error:",
            error
        );


        if (qrMessage) {

            qrMessage.textContent =
                error.message ||
                "Unable to generate QR ticket.";

        }


        if (generateQrButton) {

            generateQrButton.disabled =
                false;

            generateQrButton.textContent =
                "Generate QR Ticket";

        }

    }

}


// ======================================================
// QR BUTTON
// ======================================================

if (generateQrButton) {

    generateQrButton.addEventListener(
        "click",
        generateQRCode
    );

}


// ======================================================
// INITIALIZE
// ======================================================

async function initialize() {

    console.log(
        "================================"
    );

    console.log(
        "EventEase Payment Success Page"
    );

    console.log(
        "================================"
    );


    const hasData =
        loadSuccessData();


    if (!hasData) {

        console.error(
            "No booking data found."
        );

        if (successEventTitle) {

            successEventTitle.textContent =
                "Booking information unavailable";

        }

        return;

    }


    // --------------------------------------------------
    // Display booking
    // --------------------------------------------------

    displayBookingInformation();


    // --------------------------------------------------
    // Display OTP
    // --------------------------------------------------

    displayBookingOTP();


    // --------------------------------------------------
    // Load event
    // --------------------------------------------------

    await loadEventInformation();

}


// ======================================================
// START
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