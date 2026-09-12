// ========================================
// EventEase Booking
// ========================================

const API_URL = "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const bookingEventImage = document.getElementById("bookingEventImage");
const bookingEventCategory = document.getElementById("bookingEventCategory");
const bookingEventTitle = document.getElementById("bookingEventTitle");
const bookingEventDate = document.getElementById("bookingEventDate");
const bookingEventLocation = document.getElementById("bookingEventLocation");

const bookingTicketPrice = document.getElementById("bookingTicketPrice");
const bookingAvailableSeats = document.getElementById("bookingAvailableSeats");
const bookingTicketInfo = document.getElementById("bookingTicketInfo");

const decreaseTicket = document.getElementById("decreaseTicket");
const increaseTicket = document.getElementById("increaseTicket");
const ticketQuantity = document.getElementById("ticketQuantity");

const customerName = document.getElementById("customerName");
const customerEmail = document.getElementById("customerEmail");
const customerPhone = document.getElementById("customerPhone");

const summaryTicketPrice = document.getElementById("summaryTicketPrice");
const summaryTicketPriceRow = document.getElementById("summaryTicketPriceRow");
const summaryQuantity = document.getElementById("summaryQuantity");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryTotal = document.getElementById("summaryTotal");

const confirmBookingButton = document.getElementById("confirmBookingButton");
const bookingError = document.getElementById("bookingError");


// ========================================
// Get Event ID
// ========================================

const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get("id");


// ========================================
// Variables
// ========================================

let eventData = null;
let quantity = 1;


// ========================================
// Get Logged-in User
// ========================================

function getLoggedInUser() {

    const userData = localStorage.getItem("user");

    if (!userData) {
        return null;
    }

    try {

        return JSON.parse(userData);

    } catch (error) {

        console.error("User Data Error:", error);

        return null;
    }
}


// ========================================
// Show Error
// ========================================

function showBookingError(message) {

    bookingError.textContent = message;

    bookingError.classList.remove("hidden");
}


// ========================================
// Hide Error
// ========================================

function hideBookingError() {

    bookingError.textContent = "";

    bookingError.classList.add("hidden");
}


// ========================================
// Format Date
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "--";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}


// ========================================
// Format Price
// ========================================

function formatPrice(price) {

    const amount = Number(price || 0);

    if (amount === 0) {
        return "Free";
    }

    return `৳${amount.toLocaleString()}`;
}


// ========================================
// Load User Information
// ========================================

function loadUserInformation() {

    const user = getLoggedInUser();

    if (!user) {

        showBookingError(
            "Please login before booking an event."
        );

        confirmBookingButton.disabled = true;

        confirmBookingButton.textContent =
            "Login Required";

        return;
    }

    customerName.value =
        user.name || "";

    customerEmail.value =
        user.email || "";

    customerPhone.value =
        user.phone || "";
}


// ========================================
// Load Event
// ========================================

async function loadEvent() {

    if (!eventId) {

        showBookingError(
            "Event ID is missing. Please select an event first."
        );

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/events/${eventId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );


        const result =
            await response.json();


        console.log(
            "Booking Event Response:",
            result
        );


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Failed to load event."
            );
        }


        eventData =
            result.data;


        if (!eventData) {

            throw new Error(
                "Event information was not found."
            );
        }


        displayEvent();

        updateBookingSummary();

    } catch (error) {

        console.error(
            "Booking Event Error:",
            error
        );

        showBookingError(
            error.message ||
            "Unable to load event information."
        );
    }
}


// ========================================
// Display Event
// ========================================

function displayEvent() {

    const imageUrl =
        eventData.bannerImage?.url ||
        eventData.image ||
        "https://via.placeholder.com/600x400?text=EventEase";


    bookingEventImage.src =
        imageUrl;

    bookingEventImage.alt =
        eventData.title || "Event";


    bookingEventCategory.textContent =
        eventData.category?.name ||
        "Event";


    bookingEventTitle.textContent =
        eventData.title ||
        "Untitled Event";


    bookingEventDate.textContent =
        formatDate(
            eventData.eventDate ||
            eventData.date
        );


    bookingEventLocation.textContent =
        eventData.location ||
        eventData.venue ||
        "Location not available";


    const price =
        Number(
            eventData.ticketPrice ??
            eventData.price ??
            0
        );


    bookingTicketPrice.textContent =
        formatPrice(price);


    bookingAvailableSeats.textContent =
        eventData.availableSeats ??
        0;


    if (eventData.eventType === "free") {

        if (bookingTicketInfo) {
            bookingTicketInfo.classList.add("hidden");
        }

        if (summaryTicketPriceRow) {
            summaryTicketPriceRow.classList.add("hidden");
        }

    }


    const seats =
        Number(
            eventData.availableSeats ?? 0
        );


    if (seats <= 0) {

        quantity = 0;

        ticketQuantity.textContent =
            "0";

        decreaseTicket.disabled = true;

        increaseTicket.disabled = true;

        confirmBookingButton.disabled = true;

        confirmBookingButton.textContent =
            "Sold Out";

        confirmBookingButton.classList.remove(
            "bg-primary",
            "hover:bg-primaryDark"
        );

        confirmBookingButton.classList.add(
            "cursor-not-allowed",
            "bg-gray-400"
        );

    } else {

        quantity = 1;

        ticketQuantity.textContent =
            quantity;

        updateQuantityButtons();
    }
}


// ========================================
// Get Ticket Price
// ========================================

function getTicketPrice() {

    return Number(
        eventData?.ticketPrice ??
        eventData?.price ??
        0
    );
}


// ========================================
// Get Maximum Tickets
// ========================================

function getMaximumTickets() {

    const availableSeats =
        Number(
            eventData?.availableSeats ?? 0
        );

    const maxTicketsPerUser =
        Number(
            eventData?.maxTicketsPerUser ||
            availableSeats
        );

    return Math.min(
        availableSeats,
        maxTicketsPerUser
    );
}


// ========================================
// Update Quantity Buttons
// ========================================

function updateQuantityButtons() {

    const maximum =
        getMaximumTickets();


    decreaseTicket.disabled =
        quantity <= 1;


    increaseTicket.disabled =
        quantity >= maximum;


    decreaseTicket.classList.toggle(
        "opacity-50",
        quantity <= 1
    );


    increaseTicket.classList.toggle(
        "opacity-50",
        quantity >= maximum
    );
}


// ========================================
// Update Booking Summary
// ========================================

function updateBookingSummary() {

    if (!eventData) {
        return;
    }


    const price =
        getTicketPrice();


    const subtotal =
        price * quantity;


    summaryTicketPrice.textContent =
        formatPrice(price);


    summaryQuantity.textContent =
        quantity;


    summarySubtotal.textContent =
        formatPrice(subtotal);


    summaryTotal.textContent =
        formatPrice(subtotal);


    ticketQuantity.textContent =
        quantity;


    updateQuantityButtons();
}


// ========================================
// Decrease Ticket
// ========================================

decreaseTicket.addEventListener(
    "click",
    () => {

        hideBookingError();


        if (quantity > 1) {

            quantity--;

            updateBookingSummary();
        }
    }
);


// ========================================
// Increase Ticket
// ========================================

increaseTicket.addEventListener(
    "click",
    () => {

        hideBookingError();


        const maximum =
            getMaximumTickets();


        if (quantity < maximum) {

            quantity++;

            updateBookingSummary();

        } else {

            showBookingError(
                `You can book a maximum of ${maximum} ticket${maximum > 1 ? "s" : ""}.`
            );
        }
    }
);


// ========================================
// Create Booking
// ========================================

async function createBooking() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        showBookingError(
            "Your login session has expired. Please login again."
        );

        return;
    }


    if (!eventData) {

        showBookingError(
            "Event information is not available."
        );

        return;
    }


    if (quantity < 1) {

        showBookingError(
            "Please select at least one ticket."
        );

        return;
    }


    const maximum =
        getMaximumTickets();


    if (quantity > maximum) {

        showBookingError(
            "Selected ticket quantity is not available."
        );

        return;
    }


    // ====================================
    // Backend Request Body
    // ====================================

    const bookingPayload = {

        eventId: eventId,

        ticketQuantity: quantity

    };


    console.log(
        "Create Booking Payload:",
        bookingPayload
    );


    // ====================================
    // Loading
    // ====================================

    confirmBookingButton.disabled = true;

    confirmBookingButton.textContent =
        "Creating Booking...";


    try {

        const response = await fetch(
            `${API_URL}/bookings`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(
                    bookingPayload
                )
            }
        );


        const result =
            await response.json();


        console.log(
            "Create Booking Response:",
            result
        );


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Booking could not be created."
            );
        }


        // ====================================
        // Booking Created / Existing Pending
        // ====================================

        const booking =
            result.data.booking ||
            result.booking;


        const isExistingPending =
            result.data.isExistingPending ||
            result.isExistingPending;


        sessionStorage.setItem(
            "pendingBooking",
            JSON.stringify({
                eventId: eventId,
                ticketQuantity: quantity,
                booking: booking
            })
        );


        confirmBookingButton.textContent =
            isExistingPending
                ? "Pending Booking Found"
                : "Booking Created";


        // ====================================
        // Next Step: Redirect to OTP Verification
        // ====================================

        const bookingId = booking._id || booking.id;

        const otpData = {
            payment: null,
            booking: booking,
            otp: result.otp || null,
            otpExpiresAt: result.otpExpiresAt || null,
            paymentMethod: eventData.eventType === "free" ? "free" : "sslcommerz"
        };

        sessionStorage.setItem(
            "paymentSuccessData",
            JSON.stringify(otpData)
        );

        sessionStorage.setItem(
            "paymentBookingId",
            bookingId
        );

        sessionStorage.setItem(
            "paymentBookingData",
            JSON.stringify(booking)
        );

        window.location.href =
            `./otp-verification.html?bookingId=${encodeURIComponent(bookingId)}`;

    } catch (error) {

        console.error(
            "Create Booking Error:",
            error
        );


        showBookingError(
            error.message ||
            "Something went wrong while creating the booking."
        );


        confirmBookingButton.disabled = false;

        confirmBookingButton.textContent =
            "Book Now";
    }
}


// ========================================
// Continue Button
// ========================================

confirmBookingButton.addEventListener(
    "click",
    () => {

        hideBookingError();

        createBooking();
    }
);


// ========================================
// Initialize
// ========================================

loadUserInformation();

loadEvent();