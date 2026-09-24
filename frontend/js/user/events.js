// EventEase - Events Page

// API Configuration

const API_URL = "http://localhost:5000/api/v1";

const EVENTS_ENDPOINT = `${API_URL}/events`;

const BOOKINGS_ENDPOINT = `${API_URL}/bookings`;

const MY_BOOKINGS_ENDPOINT = `${API_URL}/bookings/my`;

// Elements

const eventsContainer =
    document.getElementById("eventsContainer");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const eventTypeFilter =
    document.getElementById("eventTypeFilter");

const searchButton =
    document.getElementById("searchButton");

const clearFilters =
    document.getElementById("clearFilters");

const eventCount =
    document.getElementById("eventCount");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");

const unbookModal =
    document.getElementById("unbookModal");

const closeUnbookModalBtn =
    document.getElementById("closeUnbookModalBtn");

const confirmUnbookBtn =
    document.getElementById("confirmUnbookBtn");

// State

let allEvents = [];

let userBookings = new Map();

let selectedUnbookEventId = null;

let selectedUnbookBookingId = null;

let activeUnbookButton = null;

// Authentication

const token =
    localStorage.getItem("token");

// Check Login

if (!token) {

    window.location.href =
        "./user-login.html";

}

// Toast

function showToast(
    message,
    type = "success"
) {

    if (!toast || !toastMessage) {

        console.log(
            `${type === "success" ? "SUCCESS" : "ERROR"}: ${message}`
        );

        return;

    }

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

// Loading State

function showLoading() {

    if (!eventsContainer) {
        return;
    }

    eventsContainer.innerHTML = `

        <div
            class="
                col-span-full
                flex
                min-h-[250px]
                items-center
                justify-center
            "
        >

            <div class="text-center">

                <div
                    class="
                        mx-auto
                        h-10
                        w-10
                        animate-spin
                        rounded-full
                        border-4
                        border-gray-200
                        border-t-primary
                    "
                ></div>

                <p
                    class="
                        mt-4
                        text-sm
                        text-gray-500
                    "
                >
                    Loading events...
                </p>

            </div>

        </div>

    `;
}

// Error State

function showError(message) {

    if (!eventsContainer) {
        return;
    }

    eventsContainer.innerHTML = `

        <div
            class="
                col-span-full
                rounded-2xl
                border
                border-red-100
                bg-red-50
                p-8
                text-center
            "
        >

            <div class="text-4xl">
                <svg class="h-5 w-5 text-amber-500 inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>

            <h3
                class="
                    mt-4
                    text-lg
                    font-bold
                    text-gray-900
                "
            >
                Unable to load events
            </h3>

            <p
                class="
                    mx-auto
                    mt-2
                    max-w-md
                    text-sm
                    text-gray-500
                "
            >
                ${escapeHTML(message)}
            </p>

            <button
                id="retryButton"
                type="button"
                class="
                    mt-5
                    rounded-xl
                    bg-primary
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-primaryDark
                "
            >
                Try Again
            </button>

        </div>

    `;

    const retryButton =
        document.getElementById("retryButton");

    if (retryButton) {

        retryButton.addEventListener(
            "click",
            fetchEvents
        );

    }

}

// Empty State

function showEmptyState() {

    if (!eventsContainer) {
        return;
    }

    eventsContainer.innerHTML = `

        <div
            class="
                col-span-full
                rounded-2xl
                bg-white
                p-10
                text-center
                shadow-sm
            "
        >

            <div class="text-5xl">
                <svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <h3
                class="
                    mt-4
                    text-xl
                    font-bold
                    text-gray-900
                "
            >
                No events found
            </h3>

            <p
                class="
                    mt-2
                    text-sm
                    text-gray-500
                "
            >
                Try changing your search or filter options.
            </p>

        </div>

    `;

}

// Escape HTML

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// Get Event ID

function getEventId(event) {

    if (!event) {
        return "";
    }

    return String(
        event._id ||
        event.id ||
        event.eventId ||
        ""
    );

}

// Format Date

function formatDate(dateValue) {

    if (!dateValue) {

        return "Date not available";

    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date not available";

    }

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}

// Get Event Name

function getEventName(event) {

    return (
        event.title ||
        event.name ||
        event.eventName ||
        "Untitled Event"
    );

}

// Get Event Category

function getCategory(event) {

    if (
        typeof event.category === "string"
    ) {

        return event.category;

    }

    if (
        event.category &&
        typeof event.category === "object"
    ) {

        return (
            event.category.name ||
            event.category.title ||
            "Event"
        );

    }

    return "Event";

}

// Get Event Image

function getEventImage(event) {

    if (
        event.bannerImage &&
        typeof event.bannerImage === "object" &&
        event.bannerImage.url
    ) {

        return event.bannerImage.url;

    }

    if (event.bannerImage) {

        return event.bannerImage;

    }

    if (event.image) {

        return event.image;

    }

    if (event.imageUrl) {

        return event.imageUrl;

    }

    return null;

}

// Get Event Price

function getEventPrice(event) {

    const price =
        event.ticketPrice ??
        event.price ??
        event.registrationFee ??
        0;

    return Number(price) || 0;

}

// Get Event Date

function getEventDate(event) {

    return (
        event.eventDate ||
        event.date ||
        event.startDate ||
        event.startTime
    );

}

// Get Event DateTime (combines date + startTime)

function getEventDateTime(event) {

    if (!event) {
        return null;
    }

    const eventDate =
        event.eventDate || event.date;

    if (!eventDate) {
        return null;
    }

    const dateTime =
        new Date(eventDate);

    if (
        Number.isNaN(
            dateTime.getTime()
        )
    ) {
        return null;
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
            dateTime.setHours(
                timeParts[0],
                timeParts[1] || 0,
                0,
                0
            );
        }
    }

    return dateTime;

}

// Format Location

function formatLocation(value) {

    if (!value) {
        return null;
    }

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "object") {
        return (
            value.name ||
            value.address ||
            value.venueName ||
            [value.street, value.city, value.country].filter(Boolean).join(", ") ||
            null
        );
    }

    return null;

}

// Get Event Location

function getEventLocation(event) {

    return (
        formatLocation(event.location) ||
        formatLocation(event.venue) ||
        formatLocation(event.address) ||
        "Location not available"
    );

}

// Capitalize

function capitalize(value) {

    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}

// Button HTML Helpers

function bookButtonHTML(eventId) {

    return `
        <button
            type="button"
            data-event-id="${eventId}"
            class="
                book-event-btn
                rounded-xl
                bg-primary
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-primaryDark
            "
        >
            Book
        </button>
    `;

}

function unbookButtonHTML(eventId, bookingId) {

    return `
        <button
            type="button"
            data-event-id="${eventId}"
            data-booking-id="${bookingId}"
            class="
                unbook-event-btn
                rounded-xl
                bg-red-50
                px-4
                py-2
                text-sm
                font-semibold
                text-red-600
                border
                border-red-200
                transition
                hover:bg-red-100
            "
        >
            Unbook
        </button>
    `;

}

function soldOutButtonHTML() {

    return `
        <button
            disabled
            class="
                book-event-btn
                rounded-xl
                bg-gray-400
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                cursor-not-allowed
            "
        >
            Sold Out
        </button>
    `;

}

function unavailableButtonHTML() {

    return `
        <button
            disabled
            class="
                book-event-btn
                rounded-xl
                bg-gray-400
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                cursor-not-allowed
            "
        >
            Unavailable
        </button>
    `;

}

// Fetch User Bookings

async function fetchUserBookings() {

    if (!token) {
        return;
    }

    try {

        const response =
            await fetch(
                MY_BOOKINGS_ENDPOINT,
                {
                    method: "GET",

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

        if (
            response.ok &&
            result.success &&
            Array.isArray(result.data)
        ) {

            userBookings.clear();

            result.data.forEach(
                (booking) => {

                    if (
                        booking.event &&
                        booking.bookingStatus !== "cancelled"
                    ) {

                        const eventId =
                            booking.event._id
                                ? String(booking.event._id)
                                : String(booking.event);

                        const bookingId =
                            String(booking._id);

                        userBookings.set(
                            eventId,
                            {
                                bookingId,
                                bookingStatus:
                                    booking.bookingStatus
                            }
                        );

                    }

                }
            );

        }

    } catch (error) {

        console.error(
            "Fetch User Bookings Error:",
            error
        );

    }

}

// Get Book Button HTML

function getBookButtonHTML(event) {

    const eventId =
        getEventId(event);

    if (!eventId) {

        return unavailableButtonHTML();

    }

    const availableSeats =
        Number(event.availableSeats ?? 0);

    const eventStatus =
        event.status;

    const eventDateTime =
        getEventDateTime(event);

    const bookingInfo =
        userBookings.get(eventId);

    const isActiveBooking =
        bookingInfo &&
        (bookingInfo.bookingStatus === "pending" ||
            bookingInfo.bookingStatus === "confirmed");

    const isFree =
        event.eventType === "free";

    // Active Booking -> Show Unbook

    if (isActiveBooking) {

        return unbookButtonHTML(
            eventId,
            bookingInfo.bookingId
        );

    }

    // Sold Out

    if (!isFree && availableSeats <= 0) {

        return soldOutButtonHTML();

    }

    // Event Status Check

    if (
        eventStatus &&
        eventStatus !== "published"
    ) {

        return unavailableButtonHTML();

    }

    // Event Date Check

    if (
        eventDateTime &&
        eventDateTime <= new Date()
    ) {

        return unavailableButtonHTML();

    }

    // Available for Booking

    return bookButtonHTML(
        eventId
    );

}

// Handle Book Event

async function handleBookEvent(
    event,
    bookButton
) {

    if (!token) {

        showToast(
            "Please login to book this event.",
            "error"
        );

        window.location.href =
            "./user-login.html";

        return;

    }

    const eventId =
        getEventId(event);

    if (!eventId) {

        showToast(
            "Event ID is missing.",
            "error"
        );

        return;

    }

    const availableSeats =
        Number(event.availableSeats ?? 0);

    const eventStatus =
        event.status;

    const eventDateTime =
        getEventDateTime(event);

    const isFree =
        event.eventType === "free";

    if (!isFree && availableSeats <= 0) {

        showToast(
            "This event is sold out.",
            "error"
        );

        return;

    }

    if (
        eventStatus &&
        eventStatus !== "published"
    ) {

        showToast(
            "This event is not available for booking.",
            "error"
        );

        return;

    }

    if (
        eventDateTime &&
        eventDateTime <= new Date()
    ) {

        showToast(
            "This event is no longer available for booking.",
            "error"
        );

        return;

    }

    bookButton.disabled =
        true;

    bookButton.textContent =
        "Booking...";

    try {

        const response =
            await fetch(
                BOOKINGS_ENDPOINT,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify(
                        {
                            eventId: eventId,
                            ticketQuantity: 1
                        }
                    )

                }
            );

        const result =
            await response.json();

        if (response.status === 401) {

            showToast(
                "Your session has expired. Please login again.",
                "error"
            );

            setTimeout(
                () => {

                    window.location.href =
                        "./user-login.html";

                },
                1500
            );

            return;

        }

        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Booking could not be created."
            );

        }

        showToast(
            "Booking created successfully.",
            "success"
        );

        const newBookingId =
            String(result.data.booking._id);

        const newBookingStatus =
            result.data.booking.bookingStatus;

        userBookings.set(
            eventId,
            {
                bookingId: newBookingId,
                bookingStatus: newBookingStatus
            }
        );

        renderEvents(
            allEvents
        );

    } catch (error) {

        console.error(
            "Book Event Error:",
            error
        );

        showToast(
            error.message ||
            "Something went wrong while booking.",
            "error"
        );

        bookButton.disabled =
            false;

        bookButton.textContent =
            "Book";

    }

}

// Handle Unbook Event

function handleUnbookEvent(
    eventId,
    bookingId,
    unbookButton
) {

    if (!token) {

        showToast(
            "Please login to book this event.",
            "error"
        );

        window.location.href =
            "./user-login.html";

        return;

    }

    activeUnbookButton =
        unbookButton;

    unbookButton.disabled =
        true;

    unbookButton.textContent =
        "Unbooking...";

    openUnbookModal(
        eventId,
        bookingId
    );

}

// Unbook Modal

function openUnbookModal(eventId, bookingId) {

    selectedUnbookEventId = eventId;

    selectedUnbookBookingId = bookingId;

    unbookModal.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "overflow-hidden"
    );

    document.querySelectorAll(
        ".unbook-event-btn"
    ).forEach(
        (btn) => {

            btn.disabled =
                true;

        }
    );

}

function closeUnbookModal() {

    selectedUnbookEventId = null;

    selectedUnbookBookingId = null;

    unbookModal.classList.add(
        "hidden"
    );

    document.body.classList.remove(
        "overflow-hidden"
    );

    if (activeUnbookButton) {

        activeUnbookButton.disabled =
            false;

        activeUnbookButton.textContent =
            "Unbook";

        activeUnbookButton =
            null;

    }

    document.querySelectorAll(
        ".unbook-event-btn"
    ).forEach(
        (btn) => {

            btn.disabled =
                false;

        }
    );

}

async function confirmUnbook() {

    if (!selectedUnbookBookingId || !selectedUnbookEventId) {

        closeUnbookModal();

        return;

    }

    const bookingId =
        selectedUnbookBookingId;

    const eventId =
        selectedUnbookEventId;

    confirmUnbookBtn.disabled =
        true;

    confirmUnbookBtn.textContent =
        "Unbooking...";

    try {

        const response =
            await fetch(
                `${BOOKINGS_ENDPOINT}/${bookingId}/cancel`,
                {
                    method: "PATCH",

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

        if (response.status === 401) {

            showToast(
                "Your session has expired. Please login again.",
                "error"
            );

            setTimeout(
                () => {

                    window.location.href =
                        "./user-login.html";

                },
                1500
            );

            return;

        }

        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Booking could not be cancelled."
            );

        }

        userBookings.delete(
            eventId
        );

        let successMessage =
            result.message ||
            "Booking cancelled successfully.";

        const refundAmount =
            result.data?.refundAmount;

        const refundPercentage =
            result.data?.refundPercentage;

        const refundStatus =
            result.data?.refundStatus;

        if (refundAmount > 0) {

            successMessage =
                `Booking cancelled successfully. Refund: ৳${Number(
                    refundAmount
                ).toLocaleString()} (${refundPercentage}%)\nRefund Status: ${refundStatus === "pending" ? "Pending" : capitalize(
                    String(refundStatus || "")
                )}`;

        } else {

            successMessage =
                "Booking cancelled successfully. No refund is applicable.";

        }

        showToast(
            successMessage,
            "success"
        );

        renderEvents(
            allEvents
        );

    } catch (error) {

        console.error(
            "Unbook Event Error:",
            error
        );

        showToast(
            error.message ||
            "Something went wrong while unbooking.",
            "error"
        );

        if (activeUnbookButton) {

            activeUnbookButton.disabled =
                false;

            activeUnbookButton.textContent =
                "Unbook";

        }

    } finally {

        closeUnbookModal();

        confirmUnbookBtn.disabled =
            false;

        confirmUnbookBtn.textContent =
            "Yes, Unbook";

    }

}

// Render Events

function renderEvents(events) {

    if (!eventsContainer) {
        return;
    }

    if (
        !Array.isArray(events) ||
        events.length === 0
    ) {

        showEmptyState();

        updateEventCount(0);

        return;

    }

    eventsContainer.innerHTML =
        events
            .map(createEventCard)
            .join("");

    updateEventCount(
        events.length
    );

}

// Create Event Card

function createEventCard(event) {

    const id =
        getEventId(event);

    const title =
        escapeHTML(
            getEventName(event)
        );

    const category =
        escapeHTML(
            getCategory(event)
        );

    const location =
        escapeHTML(
            getEventLocation(event)
        );

    const date =
        formatDate(
            getEventDate(event)
        );

    const price =
        getEventPrice(event);

    const image =
        getEventImage(event);

    let imageHTML;

    if (image) {

        imageHTML = `

            <img
                src="${escapeHTML(image)}"
                alt="${title}"
                class="
                    h-full
                    w-full
                    object-cover
                "
                loading="lazy"
            >

        `;

    } else {

        imageHTML = `

            <div
                class="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    bg-green-50
                    text-6xl
                "
            >
                <svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
            </div>

        `;

    }

    /*
     * IMPORTANT
     *
     * Event ID is now taken from:
     * _id OR id OR eventId
     *
     * and converted to string.
     */

    const bookingInfo =
        userBookings.get(id);

    const detailsURL =
        bookingInfo &&
            String(bookingInfo.bookingStatus).toLowerCase() ===
                "pending"
            ? `./event-details.html?id=${encodeURIComponent(id)}&bookingId=${encodeURIComponent(bookingInfo.bookingId)}`
            : `./event-details.html?id=${encodeURIComponent(id)}`;

    const bookButtonHTML =
        getBookButtonHTML(event);

    const priceDisplay =
        price > 0
            ? `৳${price.toLocaleString()}`
            : "Free";

    return `

        <article
            class="
                overflow-hidden
                rounded-2xl
                border
                border-gray-100
                bg-white
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-lg
            "
        >

            <!-- Image -->

            <div
                class="
                    relative
                    h-52
                    overflow-hidden
                "
            >

                ${imageHTML}

                <span
                    class="
                        absolute
                        left-4
                        top-4
                        rounded-full
                        bg-white
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        text-primary
                        shadow-sm
                    "
                >
                    ${category}
                </span>

            </div>

            <!-- Content -->

            <div class="p-5">

                <h3
                    class="
                        line-clamp-2
                        min-h-[56px]
                        text-lg
                        font-bold
                        text-gray-900
                    "
                >
                    ${title}
                </h3>

                <div
                    class="
                        mt-3
                        space-y-2
                        text-sm
                        text-gray-500
                    "
                >

                    <p>
                        <svg class="h-4 w-4 inline-block text-current align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> ${location}
                    </p>

                    <p>
                        <svg class="h-4 w-4 inline-block text-current align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> ${date}
                    </p>

                </div>

                <div
                    class="
                        mt-5
                        flex
                        items-center
                        justify-between
                        border-t
                        border-gray-100
                        pt-4
                    "
                >

                    <div>

                        <p
                            class="
                                text-xs
                                text-gray-400
                            "
                        >
                            Ticket Price
                        </p>

                        <p
                            class="
                                mt-1
                                text-lg
                                font-bold
                                ${event.eventType === "free" || price === 0 ? "text-emerald-600" : "text-primary"}
                            "
                        >
                            ${priceDisplay}
                        </p>

                    </div>

                    <div class="flex items-center gap-2">

                        <a
                            href="${detailsURL}"
                            class="
                                rounded-xl
                                border
                                border-gray-200
                                px-3
                                py-2
                                text-sm
                                font-semibold
                                text-gray-700
                                transition
                                hover:border-primary
                                hover:bg-primaryLight
                                hover:text-primary
                            "
                        >
                            Details
                        </a>

                        ${bookButtonHTML}

                    </div>

                </div>

            </div>

        </article>

    `;

}

// Update Event Count

function updateEventCount(count) {

    if (!eventCount) {
        return;
    }

    if (count === 0) {

        eventCount.textContent =
            "No events available.";

        return;

    }

    eventCount.textContent =
        `${count} event${count > 1 ? "s" : ""} found.`;

}

// Extract Events From API Response

function extractEvents(result) {

    if (!result) {
        return [];
    }

    if (
        Array.isArray(result.data)
    ) {

        return result.data;

    }

    if (
        Array.isArray(result.data?.events)
    ) {

        return result.data.events;

    }

    if (
        Array.isArray(result.data?.data)
    ) {

        return result.data.data;

    }

    if (
        Array.isArray(result.events)
    ) {

        return result.events;

    }

    return [];

}

// Fetch Events

async function fetchEvents() {

    showLoading();

    try {

        const response =
            await fetch(
                EVENTS_ENDPOINT,
                {
                    method: "GET",

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
            "Events Response:",
            result
        );

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load events."
            );

        }

        const events =
            extractEvents(result);

        if (!Array.isArray(events)) {

            throw new Error(
                "Invalid events data received from server."
            );

        }

        allEvents =
            events;

        /*
         * Debug:
         * This will show us exactly which IDs
         * are coming from backend.
         */

        console.log(
            "Event IDs:",
            allEvents.map(
                event => getEventId(event)
            )
        );

        renderEvents(
            allEvents
        );

    } catch (error) {

        console.error(
            "Fetch Events Error:",
            error
        );

        showError(
            error.message ||
            "Something went wrong while loading events."
        );

    }

}

// Filter Events

function filterEvents() {

    const searchTerm =
        searchInput?.value
            .trim()
            .toLowerCase() || "";

    const selectedCategory =
        categoryFilter?.value
            .trim()
            .toLowerCase() || "";

    const selectedType =
        eventTypeFilter?.value
            .trim()
            .toLowerCase() || "";

    const filteredEvents =
        allEvents.filter(
            (event) => {

                const title =
                    getEventName(event)
                        .toLowerCase();

                const category =
                    getCategory(event)
                        .toLowerCase();

                const price =
                    getEventPrice(event);

                const matchesSearch =
                    !searchTerm ||
                    title.includes(searchTerm);

                const matchesCategory =
                    !selectedCategory ||
                    category.includes(
                        selectedCategory
                    );

                let matchesType = true;

                if (
                    selectedType === "free"
                ) {

                    matchesType =
                        price === 0;

                }

                if (
                    selectedType === "paid"
                ) {

                    matchesType =
                        price > 0;

                }

                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesType
                );

            }
        );

    renderEvents(
        filteredEvents
    );

}

// Search Button

if (searchButton) {

    searchButton.addEventListener(
        "click",
        filterEvents
    );

}

// Search While Typing

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterEvents
    );

}

// Category Filter

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterEvents
    );

}

// Event Type Filter

if (eventTypeFilter) {

    eventTypeFilter.addEventListener(
        "change",
        filterEvents
    );

}

// Clear Filters

if (clearFilters) {

    clearFilters.addEventListener(
        "click",
        () => {

            if (searchInput) {
                searchInput.value = "";
            }

            if (categoryFilter) {
                categoryFilter.value = "";
            }

            if (eventTypeFilter) {
                eventTypeFilter.value = "";
            }

            renderEvents(
                allEvents
            );

        }
    );

}

// Book Button Event Delegation

if (eventsContainer) {

    eventsContainer.addEventListener(
        "click",
        (e) => {

            const bookButton =
                e.target.closest(
                    ".book-event-btn"
                );

            const unbookButton =
                e.target.closest(
                    ".unbook-event-btn"
                );

            if (bookButton) {

                if (bookButton.disabled) {
                    return;
                }

                const eventId =
                    bookButton.dataset.eventId;

                if (!eventId) {
                    return;
                }

                const event =
                    allEvents.find(
                        (ev) =>
                            String(getEventId(ev)) ===
                            String(eventId)
                    );

                if (!event) {
                    return;
                }

                handleBookEvent(
                    event,
                    bookButton
                );

            }

            if (unbookButton) {

                if (
                    unbookButton.disabled ||
                    selectedUnbookEventId !== null
                ) {
                    return;
                }

                const eventId =
                    unbookButton.dataset.eventId;

                const bookingId =
                    unbookButton.dataset.bookingId;

                if (!eventId || !bookingId) {
                    return;
                }

                handleUnbookEvent(
                    eventId,
                    bookingId,
                    unbookButton
                );

            }

        }
    );

}

// Unbook Modal Event Listeners

if (closeUnbookModalBtn) {

    closeUnbookModalBtn.addEventListener(
        "click",
        closeUnbookModal
    );

}

if (confirmUnbookBtn) {

    confirmUnbookBtn.addEventListener(
        "click",
        confirmUnbook
    );

}

if (unbookModal) {

    unbookModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                unbookModal
            ) {

                closeUnbookModal();

            }

        }
    );

}

// Initialize

async function initializePage() {

    showLoading();

    try {

        await fetchUserBookings();

        await fetchEvents();

    } catch (error) {

        console.error(
            "Initialize Page Error:",
            error
        );

        showError(
            error.message ||
            "Something went wrong while loading the page."
        );

    }

}

initializePage();
