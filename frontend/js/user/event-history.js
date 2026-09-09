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
// Review Modal Elements & State
// ======================================================

const reviewModal =
    document.getElementById("reviewModal");

const reviewModalBox =
    document.getElementById("reviewModalBox");

const closeReviewModal =
    document.getElementById("closeReviewModal");

const cancelReviewModal =
    document.getElementById("cancelReviewModal");

const modalEventImage =
    document.getElementById("modalEventImage");

const modalEventCategory =
    document.getElementById("modalEventCategory");

const modalEventTitle =
    document.getElementById("modalEventTitle");

const modalEventDate =
    document.getElementById("modalEventDate");

const modalReviewAlert =
    document.getElementById("modalReviewAlert");

const modalReviewForm =
    document.getElementById("modalReviewForm");

const modalEventId =
    document.getElementById("modalEventId");

const modalBookingId =
    document.getElementById("modalBookingId");

const modalStarGroup =
    document.getElementById("modalStarGroup");

const modalRatingText =
    document.getElementById("modalRatingText");

const modalRatingError =
    document.getElementById("modalRatingError");

const modalReviewComment =
    document.getElementById("modalReviewComment");

const modalCharCount =
    document.getElementById("modalCharCount");

const modalCommentError =
    document.getElementById("modalCommentError");

const submitModalReviewBtn =
    document.getElementById("submitModalReviewBtn");

let selectedModalRating = 0;

const modalRatingLabels = {
    1: "Very Bad",
    2: "Bad",
    3: "Average",
    4: "Good",
    5: "Excellent"
};


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


    const startTime =
        event.startTime;


    if (startTime) {
        const timeParts =
            String(startTime)
                .split(":")
                .map(Number);

        if (
            timeParts.length >= 2 &&
            !Number.isNaN(timeParts[0]) &&
            !Number.isNaN(timeParts[1])
        ) {
            eventDateTime.setHours(
                timeParts[0],
                timeParts[1] || 0,
                0,
                0
            );
        }
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


    const eventId =
        event._id ||
        event.id ||
        (typeof booking.event === "string" ? booking.event : "") ||
        booking.eventId ||
        "";


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

                            <svg class="h-4 w-4 inline-block text-current align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>

                            <span class="ml-1">
                                ${formatDate(eventDate)}${startTime ? " at " + formatTime(eventDate) : ""}
                            </span>

                        </p>


                        <p class="text-sm text-gray-500">

                            <svg class="h-4 w-4 inline-block text-current align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>

                            <span class="ml-1">
                                ${escapeHTML(venueName)}
                            </span>

                        </p>


                        <p class="text-sm text-gray-500">

                            <svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>

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


                    <div>
                        ${
                            eventId && bookingStatus !== "cancelled"
                                ? `
                                    <button
                                        type="button"
                                        class="open-review-btn rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-primaryDark shadow-sm cursor-pointer"
                                    >
                                        Review
                                    </button>
                                  `
                                : ""
                        }
                    </div>

                </div>

            </div>

        </div>

    `;


    const reviewBtn =
        card.querySelector(".open-review-btn");

    if (reviewBtn) {

        reviewBtn.addEventListener(
            "click",
            () => {

                openReviewModal({
                    id: eventId,
                    bookingId: bookingId,
                    title: eventTitle,
                    image: eventImage,
                    category: event.category?.name || "Event",
                    date: formatDate(eventDate) + (startTime ? ` at ${formatTime(eventDate)}` : "")
                });

            }
        );

    }


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
         * ensure only expired events with confirmed
         * bookings are shown. Cancelled bookings
         * must never appear in history.
         */

        const expiredBookings =
            historyBookings.filter(
                (booking) => {
                    const event =
                        getBookingEvent(
                            booking
                        );

                    return (
                        booking.bookingStatus === "confirmed" &&
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
// Review Modal Logic
// ======================================================

function openReviewModal(eventInfo) {

    if (!reviewModal) return;

    if (modalEventId) {
        modalEventId.value = eventInfo.id || "";
    }

    if (modalBookingId) {
        modalBookingId.value = eventInfo.bookingId || "";
    }

    if (modalEventImage) {
        modalEventImage.src =
            eventInfo.image ||
            "https://via.placeholder.com/100";
        modalEventImage.alt =
            eventInfo.title || "Event";
    }

    if (modalEventCategory) {
        modalEventCategory.textContent =
            eventInfo.category || "Event";
    }

    if (modalEventTitle) {
        modalEventTitle.textContent =
            eventInfo.title || "Untitled Event";
    }

    if (modalEventDate) {
        modalEventDate.textContent =
            eventInfo.date || "--";
    }

    // Reset Form Fields
    setModalRating(0);

    if (modalReviewComment) {
        modalReviewComment.value = "";
    }

    if (modalCharCount) {
        modalCharCount.textContent = "0 / 1000";
    }

    if (modalRatingError) {
        modalRatingError.classList.add("hidden");
    }

    if (modalCommentError) {
        modalCommentError.classList.add("hidden");
    }

    hideModalAlert();

    if (submitModalReviewBtn) {
        submitModalReviewBtn.disabled = false;
        submitModalReviewBtn.textContent = "Submit Review";
    }

    reviewModal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

}


function closeReviewModalFunc() {

    if (!reviewModal) return;

    reviewModal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");

}


function setModalRating(rating) {

    selectedModalRating =
        Number(rating) || 0;

    const stars =
        modalStarGroup
            ? modalStarGroup.querySelectorAll(".modal-rating-star")
            : [];

    stars.forEach((star) => {

        const starRating =
            Number(star.dataset.rating);

        if (starRating <= selectedModalRating) {

            star.classList.remove("text-gray-300");
            star.classList.add("text-yellow-400");

        } else {

            star.classList.remove("text-yellow-400");
            star.classList.add("text-gray-300");

        }

    });

    if (modalRatingText) {

        modalRatingText.textContent =
            modalRatingLabels[selectedModalRating] ||
            "Select a rating";

    }

    if (selectedModalRating > 0 && modalRatingError) {
        modalRatingError.classList.add("hidden");
    }

}


function showModalAlert(message, type = "error") {

    if (!modalReviewAlert) return;

    modalReviewAlert.textContent = message;

    if (type === "success") {

        modalReviewAlert.className =
            "rounded-xl p-3.5 text-sm mb-4 bg-green-50 text-green-700 border border-green-200";

    } else {

        modalReviewAlert.className =
            "rounded-xl p-3.5 text-sm mb-4 bg-red-50 text-red-700 border border-red-200";

    }

    modalReviewAlert.classList.remove("hidden");

}


function hideModalAlert() {

    if (!modalReviewAlert) return;

    modalReviewAlert.textContent = "";
    modalReviewAlert.classList.add("hidden");

}


function setupReviewModalListeners() {

    if (closeReviewModal) {
        closeReviewModal.addEventListener("click", closeReviewModalFunc);
    }

    if (cancelReviewModal) {
        cancelReviewModal.addEventListener("click", closeReviewModalFunc);
    }

    if (reviewModal) {
        reviewModal.addEventListener("click", (event) => {
            if (event.target === reviewModal) {
                closeReviewModalFunc();
            }
        });
    }

    if (modalStarGroup) {
        const stars = modalStarGroup.querySelectorAll(".modal-rating-star");
        stars.forEach((star) => {
            star.addEventListener("click", () => {
                setModalRating(star.dataset.rating);
            });
        });
    }

    if (modalReviewComment) {
        modalReviewComment.addEventListener("input", () => {
            const length = modalReviewComment.value.length;
            if (modalCharCount) {
                modalCharCount.textContent = `${length} / 1000`;
            }
            if (length >= 5 && modalCommentError) {
                modalCommentError.classList.add("hidden");
            }
        });
    }

    if (modalReviewForm) {
        modalReviewForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            hideModalAlert();

            const eventId = modalEventId ? modalEventId.value : "";
            const comment = modalReviewComment ? modalReviewComment.value.trim() : "";

            let isValid = true;

            if (!selectedModalRating || selectedModalRating < 1 || selectedModalRating > 5) {
                if (modalRatingError) {
                    modalRatingError.classList.remove("hidden");
                }
                isValid = false;
            } else if (modalRatingError) {
                modalRatingError.classList.add("hidden");
            }

            if (!comment || comment.length < 5) {
                if (modalCommentError) {
                    modalCommentError.textContent = "Review must be at least 5 characters.";
                    modalCommentError.classList.remove("hidden");
                }
                isValid = false;
            } else if (comment.length > 1000) {
                if (modalCommentError) {
                    modalCommentError.textContent = "Review cannot exceed 1000 characters.";
                    modalCommentError.classList.remove("hidden");
                }
                isValid = false;
            } else if (modalCommentError) {
                modalCommentError.classList.add("hidden");
            }

            if (!isValid) return;

            const token = getToken();
            if (!token) {
                showModalAlert("Please log in again to submit a review.", "error");
                return;
            }

            if (!eventId) {
                showModalAlert("Event information was not found.", "error");
                return;
            }

            if (submitModalReviewBtn) {
                submitModalReviewBtn.disabled = true;
                submitModalReviewBtn.textContent = "Submitting Review...";
            }

            try {
                const response = await fetch(`${API_BASE_URL}/reviews`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        event: eventId,
                        rating: selectedModalRating,
                        comment: comment
                    })
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Failed to submit review.");
                }

                showModalAlert(result.message || "Your review has been submitted successfully!", "success");

                if (submitModalReviewBtn) {
                    submitModalReviewBtn.textContent = "Submitted ✓";
                }

                setTimeout(() => {
                    closeReviewModalFunc();
                }, 1500);

            } catch (err) {
                console.error("Submit Modal Review Error:", err);
                showModalAlert(err.message || "Something went wrong while submitting your review.", "error");

                if (submitModalReviewBtn) {
                    submitModalReviewBtn.disabled = false;
                    submitModalReviewBtn.textContent = "Submit Review";
                }
            }
        });
    }

}


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

        setupReviewModalListeners();

        loadEventHistory();

    }
);

// Fallback in case DOM is already loaded
if (document.readyState === "complete" || document.readyState === "interactive") {
    setupReviewModalListeners();
}
