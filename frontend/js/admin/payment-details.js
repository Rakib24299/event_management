// ADMIN PAYMENT DETAILS


// Configuration

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// DOM Elements

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const paymentContent =
    document.getElementById("paymentContent");


// Get Payment ID

function getPaymentId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");

}


// Get Token

function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken")
    );

}


// Safe Text

function safeText(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "N/A";

    }

    return String(value);

}


// Format Currency

function formatCurrency(amount) {

    return `৳${Number(amount || 0).toLocaleString(
        "en-BD",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;

}


// Format Date

function formatDate(date) {

    if (!date) {

        return "N/A";

    }


    const parsedDate =
        new Date(date);


    if (
        isNaN(
            parsedDate.getTime()
        )
    ) {

        return "N/A";

    }


    return parsedDate.toLocaleString(
        "en-BD",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// Payment Status Badge

function getStatusBadge(status) {

    const normalizedStatus =
        String(
            status || ""
        ).toLowerCase();


    const statusMap = {

        paid: {

            text: "Paid",

            className:
                "bg-green-100 text-green-700"

        },

        pending: {

            text: "Pending",

            className:
                "bg-yellow-100 text-yellow-700"

        },

        failed: {

            text: "Failed",

            className:
                "bg-red-100 text-red-700"

        },

        cancelled: {

            text: "Cancelled",

            className:
                "bg-gray-100 text-gray-700"

        },

        refunded: {

            text: "Refunded",

            className:
                "bg-purple-100 text-purple-700"

        },

        partially_refunded: {

            text: "Partially Refunded",

            className:
                "bg-orange-100 text-orange-700"

        }

    };


    const item =
        statusMap[normalizedStatus] || {

            text:
                safeText(status),

            className:
                "bg-gray-100 text-gray-700"

        };


    return `

        <span
            class="
                inline-flex
                rounded-full
                px-4
                py-2
                text-sm
                font-semibold
                ${item.className}
            "
        >
            ${item.text}
        </span>

    `;

}


// Refund Status Badge

function getRefundStatusBadge(status) {

    const normalizedStatus =
        String(
            status || ""
        ).toLowerCase();


    const statusMap = {

        none: {

            text: "No Refund",

            className:
                "bg-gray-100 text-gray-700"

        },

        pending: {

            text: "Refund Pending",

            className:
                "bg-yellow-100 text-yellow-700"

        },

        processed: {

            text: "Refund Processed",

            className:
                "bg-green-100 text-green-700"

        },

        failed: {

            text: "Refund Failed",

            className:
                "bg-red-100 text-red-700"

        }

    };


    const item =
        statusMap[normalizedStatus] || {

            text:
                safeText(status),

            className:
                "bg-gray-100 text-gray-700"

        };


    return `

        <span
            class="
                inline-flex
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold
                ${item.className}
            "
        >
            ${item.text}
        </span>

    `;

}


// Booking Status

function getBookingStatus(booking) {

    if (!booking) {

        return "N/A";

    }


    return safeText(
        booking.bookingStatus
    );

}


// Get Customer

function getCustomer(payment) {

    return payment.user || {};

}


// Get Organizer

function getOrganizer(payment) {

    return payment.organizer || {};

}


// Get Event

function getEvent(payment) {

    return payment.event || {};

}


// Get Booking

function getBooking(payment) {

    return payment.booking || {};

}


// Display Payment

function displayPayment(payment) {

    if (!payment) {

        showError(
            "Payment information was not found."
        );

        return;

    }


    // Hide Loading

    if (loading) {

        loading.classList.add(
            "hidden"
        );

    }


    // Show Content

    if (paymentContent) {

        paymentContent.classList.remove(
            "hidden"
        );

    }


    // Objects

    const user =
        getCustomer(payment);


    const organizer =
        getOrganizer(payment);


    const event =
        getEvent(payment);


    const booking =
        getBooking(payment);


    // Transaction Information

    const transactionId =
        document.getElementById(
            "transactionId"
        );


    const paymentStatus =
        document.getElementById(
            "paymentStatus"
        );


    const paymentMethod =
        document.getElementById(
            "paymentMethod"
        );


    const paidAt =
        document.getElementById(
            "paidAt"
        );


    if (transactionId) {

        transactionId.textContent =
            safeText(
                payment.transactionId ||
                payment._id
            );

    }


    if (paymentStatus) {

        paymentStatus.innerHTML =
            getStatusBadge(
                payment.status
            );

    }


    if (paymentMethod) {

        paymentMethod.textContent =
            safeText(
                payment.paymentMethod
            );

    }


    if (paidAt) {

        paidAt.textContent =
            formatDate(
                payment.paidAt
            );

    }


    // Financial Information

    const grossAmount =
        document.getElementById(
            "grossAmount"
        );


    const platformFee =
        document.getElementById(
            "platformFee"
        );


    const organizerAmount =
        document.getElementById(
            "organizerAmount"
        );


    if (grossAmount) {

        grossAmount.textContent =
            formatCurrency(
                payment.grossAmount
            );

    }


    if (platformFee) {

        platformFee.textContent =
            formatCurrency(
                payment.platformFee
            );

    }


    if (organizerAmount) {

        organizerAmount.textContent =
            formatCurrency(
                payment.organizerAmount
            );

    }


    // Created / Updated

    const createdAt =
        document.getElementById(
            "createdAt"
        );


    const updatedAt =
        document.getElementById(
            "updatedAt"
        );


    if (createdAt) {

        createdAt.textContent =
            formatDate(
                payment.createdAt
            );

    }


    if (updatedAt) {

        updatedAt.textContent =
            formatDate(
                payment.updatedAt
            );

    }


    // SSL Information

    const sessionKey =
        document.getElementById(
            "sessionKey"
        );


    const validationId =
        document.getElementById(
            "validationId"
        );


    if (sessionKey) {

        sessionKey.textContent =
            safeText(
                payment.sessionKey
            );

    }


    if (validationId) {

        validationId.textContent =
            safeText(
                payment.validationId
            );

    }


    // Customer Information

    const customerName =
        document.getElementById(
            "customerName"
        );


    const customerEmail =
        document.getElementById(
            "customerEmail"
        );


    if (customerName) {

        customerName.textContent =
            safeText(
                user.name ||
                user.fullName ||
                user.username
            );

    }


    if (customerEmail) {

        customerEmail.textContent =
            safeText(
                user.email
            );

    }


    // Organizer Information

    const organizerName =
        document.getElementById(
            "organizerName"
        );


    const organizerEmail =
        document.getElementById(
            "organizerEmail"
        );


    if (organizerName) {

        organizerName.textContent =
            safeText(
                organizer.name ||
                organizer.fullName ||
                organizer.username
            );

    }


    if (organizerEmail) {

        organizerEmail.textContent =
            safeText(
                organizer.email
            );

    }


    // Event Information

    const eventName =
        document.getElementById(
            "eventName"
        );


    const eventDate =
        document.getElementById(
            "eventDate"
        );


    const eventVenue =
        document.getElementById(
            "eventVenue"
        );


    if (eventName) {

        eventName.textContent =
            safeText(
                event.title
            );

    }


    if (eventDate) {

        eventDate.textContent =
            formatDate(
                event.eventDate
            );

    }


    if (eventVenue) {

        const venue =
            event.venue || {};


        const venueText = [

            venue.venueName,

            venue.street,

            venue.city,

            venue.country

        ]
            .filter(Boolean)
            .join(", ");


        eventVenue.textContent =
            venueText || "N/A";

    }


    // Booking Information

    const bookingId =
        document.getElementById(
            "bookingId"
        );


    const ticketQuantity =
        document.getElementById(
            "ticketQuantity"
        );


    const bookingStatus =
        document.getElementById(
            "bookingStatus"
        );


    if (bookingId) {

        bookingId.textContent =
            safeText(
                booking._id ||
                payment.booking
            );

    }


    if (ticketQuantity) {

        ticketQuantity.textContent =
            safeText(
                booking.ticketQuantity
            );

    }


    if (bookingStatus) {

        bookingStatus.textContent =
            getBookingStatus(
                booking
            );

    }


    // Refund Information

    const refundAmount =
        document.getElementById(
            "refundAmount"
        );


    const refundStatus =
        document.getElementById(
            "refundStatus"
        );


    const refundedAt =
        document.getElementById(
            "refundedAt"
        );


    if (refundAmount) {

        refundAmount.textContent =
            formatCurrency(
                payment.refundAmount
            );

    }


    if (refundStatus) {

        refundStatus.innerHTML =
            getRefundStatusBadge(
                payment.refundStatus
            );

    }


    if (refundedAt) {

        refundedAt.textContent =
            formatDate(
                payment.refundedAt
            );

    }


    // Gateway Response

    const gatewayResponse =
        document.getElementById(
            "gatewayResponse"
        );


    if (gatewayResponse) {

        if (
            payment.gatewayResponse &&
            typeof payment.gatewayResponse ===
                "object"
        ) {

            gatewayResponse.textContent =
                JSON.stringify(
                    payment.gatewayResponse,
                    null,
                    2
                );

        } else {

            gatewayResponse.textContent =
                "No gateway response available.";

        }

    }

}


// Show Error

function showError(message) {

    if (loading) {

        loading.classList.add(
            "hidden"
        );

    }


    if (paymentContent) {

        paymentContent.classList.add(
            "hidden"
        );

    }


    if (errorMessage) {

        errorMessage.textContent =
            message;

        errorMessage.classList.remove(
            "hidden"
        );

    }

}


// Load Payment Details

async function loadPaymentDetails() {

    // Get Payment ID

    const paymentId =
        getPaymentId();


    if (!paymentId) {

        showError(
            "Payment ID is missing."
        );

        return;

    }


    // Get Token

    const token =
        getToken();


    if (!token) {

        showError(
            "You are not logged in. Please login as an admin."
        );

        return;

    }


    try {

        // API Request

        const response =
            await fetch(

                `${API_BASE_URL}/payments/${encodeURIComponent(
                    paymentId
                )}`,

                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }

                }

            );


        // Read Response

        const result =
            await response.json();


        // Backend Error

        if (!response.ok) {

            throw new Error(

                result.message ||

                "Failed to load payment details."

            );

        }


        // Extract Payment

        const payment =
            result.data;


        // Display Payment

        displayPayment(
            payment
        );

    }

    catch (error) {

        console.error(
            "Admin payment details error:",
            error
        );


        showError(

            error.message ||

            "Something went wrong while loading payment details."

        );

    }

}


// Initial Load

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPaymentDetails();

    }
);