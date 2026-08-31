"use strict";


// ======================================================
// Configuration
// ======================================================

const API_BASE_URL = "http://localhost:5000/api/v1";


// ======================================================
// State
// ======================================================

let historyBookings = [];


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

const historyContainer =
    document.getElementById("historyContainer");


// ======================================================
// Auth Token
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
// Date Utilities
// ======================================================

function isEventExpired(event) {

    if (!event) {
        return true;
    }


    const eventDate =
        event.eventDate || event.date;


    if (!eventDate) {
        return false;
    }


    const eventDateTime =
        new Date(eventDate);


    if (
        Number.isNaN(
            eventDateTime.getTime()
        )
    ) {
        return false;
    }


    const now =
        new Date();


    return now > eventDateTime;

}


function getBookingEvent(booking) {

    return (
        booking.event ||
        booking.eventId ||
        {}
    );

}


function formatDate(dateValue) {

    if (!dateValue) {
        return "Date not available";
    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


function formatTime(dateValue) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {
        return "";
    }


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function formatPrice(price) {

    if (
        price === undefined ||
        price === null ||
        price === ""
    ) {
        return "Free";
    }


    if (Number(price) === 0) {
        return "Free";
    }


    return `৳${Number(price).toLocaleString()}`;

}


function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value == null
            ? ""
            : String(value);


    return div.innerHTML;

}


function capitalize(value) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


// ======================================================
// Booking Card
// ======================================================

function createHistoryCard(booking) {

    const event =
        getBookingEvent(booking);


    const eventTitle =
        event.title ||
        booking.eventTitle ||
        "Event";


    const eventImage =
        event.bannerImage?.url ||
        event.image ||
        booking.eventImage ||
        "https://via.placeholder.com/600x350?text=EventEase";


    const eventDate =
        event.eventDate ||
        event.date ||
        booking.eventDate;


    const venue =
        event.venue || {};


    const venueName =
        venue.venueName ||
        event.location ||
        booking.location ||
        "Location not available";


    const startTime =
        event.startTime ||
        "";


    const quantity =
        Number(
            booking.ticketQuantity ||
            booking.numberOfTickets ||
            booking.quantity ||
            booking.tickets ||
            1
        );


    const price =
        booking.totalAmount ??
        booking.totalPrice ??
        booking.amount ??
        0;


    const bookingStatus =
        booking.bookingStatus ||
        booking.status ||
        "pending";


    const bookingId =
        booking._id ||
        booking.id ||
        "";


    const statusClass =
        bookingStatus === "confirmed"
            ? "bg-green-100 text-green-700"
            : bookingStatus === "cancelled"
                ? "bg-red-100 text-red-700"
                : bookingStatus === "completed"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700";


    const card =
        document.createElement("div");


    card.className =
        "overflow-hidden rounded-3xl bg-white shadow-soft";


    card.innerHTML = `

        <div class="flex flex-col sm:flex-row">

            <!-- Event Image -->

            <div class="h-48 sm:h-auto sm:w-52">

                <img
                    src="${escapeHTML(eventImage)}"
                    alt="${escapeHTML(eventTitle)}"
                    class="h-full w-full object-cover"
                    onerror="this.src='https://via.placeholder.com/600x350?text=EventEase'"
                >

            </div>


            <!-- Booking Information -->

            <div class="flex flex-1 flex-col justify-between p-5">

                <div>

                    <div
                        class="flex flex-wrap items-start justify-between gap-3"
                    >

                        <h3
                            class="text-lg font-bold text-gray-900"
                        >
                            ${escapeHTML(eventTitle)}
                        </h3>

                        <span
                            class="rounded-full px-3 py-1 text-xs font-semibold ${statusClass}"
                        >
                            ${escapeHTML(capitalize(bookingStatus))}
                        </span>

                    </div>


                    <div class="mt-4 space-y-2">

                        <p class="text-sm text-gray-500">

                            📅

                            <span class="ml-1">
                                ${formatDate(eventDate)}${startTime ? " at " + formatTime(eventDate) : ""}
                            </span>

                        </p>


                        <p class="text-sm text-gray-500">

                            📍

                            <span class="ml-1">
                                ${escapeHTML(venueName)}
                            </span>

                        </p>


                        <p class="text-sm text-gray-500">

                            🎫

                            <span class="ml-1">
                                ${quantity} Ticket${quantity > 1 ? "s" : ""}
                            </span>

                        </p>


                        ${
                            bookingStatus === "cancelled"
                                ? `
                                    <p class="text-sm text-red-600 font-medium">
                                        Cancelled on ${formatDate(booking.cancelledAt)}
                                    </p>
                                  `
                                : ""
                        }

                    </div>

                </div>


                <div
                    class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4"
                >

                    <div>

                        <p class="text-xs text-gray-400">
                            Total Amount
                        </p>

                        <p
                            class="font-bold text-primary"
                        >
                            ${formatPrice(price)}
                        </p>

                    </div>


                    ${
                        bookingId
                            ? `
                                <a
                                    href="./booking-details.html?id=${bookingId}"
                                    class="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-primaryDark"
                                >
                                    View Details
                                </a>
                              `
                            : ""
                    }

                </div>

            </div>

        </div>

    `;


    return card;

}


// ======================================================
// Load History
// ======================================================

async function loadEventHistory() {

    showLoading();


    try {

        const result =
            await apiRequest(
                "/bookings/history"
            );


        let bookings = [];


        if (
            result?.data &&
            Array.isArray(result.data.bookings)
        ) {

            bookings =
                result.data.bookings;

        } else if (
            result?.data &&
            Array.isArray(result.data.items)
        ) {

            bookings =
                result.data.items;

        } else if (
            Array.isArray(result?.data)
        ) {

            bookings =
                result.data;

        }


        if (!Array.isArray(bookings)) {

            bookings = [];

        }


        historyBookings = bookings;


        hideLoading();


        /*
         * Client-side safety filter:
         * ensure only expired events are shown.
         */

        const expiredBookings =
            historyBookings.filter(
                (booking) => {
                    const event =
                        getBookingEvent(
                            booking
                        );

                    return (
                        booking.bookingStatus === "cancelled" ||
                        booking.bookingStatus === "completed" ||
                        isEventExpired(event)
                    );
                }
            );


        if (expiredBookings.length === 0) {

            showEmptyState();

            return;

        }


        renderHistory(expiredBookings);

    } catch (error) {

        hideLoading();

        showError(
            error.message ||
            "Failed to load event history."
        );

    }

}


// ======================================================
// Render History
// ======================================================

function renderHistory(bookings) {

    historyContainer.innerHTML = "";


    const sorted =
        bookings.sort(
            (a, b) => {
                const eventA =
                    getBookingEvent(a);

                const eventB =
                    getBookingEvent(b);


                const dateA =
                    eventA?.eventDate || a.createdAt;

                const dateB =
                    eventB?.eventDate || b.createdAt;


                const timeA =
                    new Date(
                        dateA || 0
                    ).getTime();

                const timeB =
                    new Date(
                        dateB || 0
                    ).getTime();


                return timeB - timeA;

            }
        );


    sorted.forEach(
        (booking) => {

            const card =
                createHistoryCard(
                    booking
                );


            historyContainer.appendChild(
                card
            );

        }
    );


    historyContainer.classList.remove(
        "hidden"
    );

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

    historyContainer.classList.add(
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

    historyContainer.classList.add(
        "hidden"
    );

    errorState.classList.add(
        "hidden"
    );

}


// ======================================================
// Error State
// ======================================================

function showError(message) {

    errorMessage.textContent =
        message;


    errorState.classList.remove(
        "hidden"
    );

    emptyState.classList.add(
        "hidden"
    );

    historyContainer.classList.add(
        "hidden"
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
        document.getElementById(
            "logoutBtn"
        );


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
    loadEventHistory
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


        loadEventHistory();

    }
);
