
// Helper: Is Event Expired
const isEventExpired = (event) => {
    if (!event || !event.eventDate) return false;
    const date = new Date(event.eventDate);
    if (isNaN(date.getTime())) return false;
    if (event.endTime) {
        const parts = String(event.endTime).split(":").map(Number);
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            date.setHours(parts[0], parts[1], 0, 0);
        }
    } else {
        date.setHours(23, 59, 59, 999);
    }
    return date < new Date();
};

// EventEase Organizer - My Events

const API_URL = "http://localhost:5000/api/v1";

// Elements

const eventsLoading =
    document.getElementById("eventsLoading");

const eventsContent =
    document.getElementById("eventsContent");

const eventsError =
    document.getElementById("eventsError");

const eventsErrorMessage =
    document.getElementById("eventsErrorMessage");

const eventsEmpty =
    document.getElementById("eventsEmpty");

const eventsList =
    document.getElementById("eventsList");

const retryEventsButton =
    document.getElementById("retryEventsButton");

// Authentication

const token =
    localStorage.getItem("token");

// Redirect If Not Logged In

if (!token) {

    window.location.href =
        "../auth/login.html?redirect=../organizer/my-events.html";

}

// Helper: Escape HTML

function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Format Date

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
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
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

// Format Price

function formatPrice(price) {

    if (
        price === undefined ||
        price === null ||
        price === "" ||
        Number(price) === 0
    ) {
        return "Free";
    }

    return `৳${Number(price).toLocaleString()}`;
}

// Get Event Image

function getEventImage(event) {

    return (
        event.bannerImage?.url ||
        event.image ||
        "https://via.placeholder.com/800x500?text=EventEase"
    );
}

// Status Badge

function getStatusBadge(event) {

    const status =
        String(
            event.status ||
            event.eventStatus ||
            "published"
        ).toLowerCase();

    if (
        status === "draft"
    ) {

        return `
            <span
                class="
                    inline-flex
                    rounded-full
                    bg-gray-100
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-gray-600
                "
            >
                Draft
            </span>
        `;
    }

    if (
        status === "cancelled" ||
        status === "canceled"
    ) {

        return `
            <span
                class="
                    inline-flex
                    rounded-full
                    bg-red-100
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-red-600
                "
            >
                Cancelled
            </span>
        `;
    }

    if (
        status === "completed"
    ) {

        return `
            <span
                class="
                    inline-flex
                    rounded-full
                    bg-gray-100
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-gray-600
                "
            >
                Completed
            </span>
        `;
    }

    return `
        <span
            class="
                inline-flex
                rounded-full
                bg-[#e76f51]/10
                px-3
                py-1
                text-xs
                font-semibold
                text-[#e76f51]
            "
        >
            Published
        </span>
    `;
}

// Display Events

function displayEvents(events) {

    eventsList.innerHTML = "";

    if (
        !Array.isArray(events) ||
        events.length === 0
    ) {

        eventsContent.classList.add("hidden");

        eventsEmpty.classList.remove("hidden");

        return;
    }

    eventsEmpty.classList.add("hidden");

    eventsContent.classList.remove("hidden");

    events.forEach(event => {

        const eventId =
            event._id ||
            event.id;

        const title =
            event.title ||
            "Untitled Event";

        const category =
            event.category?.name ||
            event.category ||
            "Event";

        const eventDate =
            event.eventDate ||
            event.date;

        const location =
            getEventLocation(event);
        const price =
            event.ticketPrice ??
            event.price ??
            0;

        const isFreeEvent =
            event.eventType === "free";

        const availableSeats =
            Number(
                event.availableSeats ?? 0
            );

        const totalSeats =
            Number(
                event.totalSeats ??
                event.capacity ??
                availableSeats
            );

        let soldSeats = 0;

        if (
            totalSeats > 0 &&
            !isFreeEvent
        ) {

            soldSeats =
                Math.max(
                    0,
                    totalSeats -
                        availableSeats
                );

        }

        const image =
            getEventImage(event);

        const card =
            document.createElement("article");

        card.className =
            `
                overflow-hidden
                rounded-3xl
                bg-white
                shadow-[0_10px_30px_rgba(0,0,0,0.07)]
                transition
                hover:-translate-y-1
            `;

        card.innerHTML = `

            <!-- Event Image -->

            <div class="relative h-52 overflow-hidden">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(title)}"
                    class="
                        h-full
                        w-full
                        object-cover
                    "
                >

                <div
                    class="
                        absolute
                        left-4
                        top-4
                    "
                >
                    ${getStatusBadge(event)}
                </div>

            </div>

            <!-- Event Information -->

            <div class="p-5">

                <!-- Category -->

                <p
                    class="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-[#e76f51]
                    "
                >
                    ${escapeHTML(category)}
                </p>

                <!-- Title -->

                <h2
                    class="
                        mt-2
                        line-clamp-2
                        text-xl
                        font-bold
                        text-gray-900
                    "
                >
                    ${escapeHTML(title)}
                </h2>

                <!-- Date -->

                <div
                    class="
                        mt-4
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-600
                    "
                >

                    <span>
                        <svg class="h-4 w-4 inline-block text-current align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </span>

                    <span>
                        ${escapeHTML(
                            formatDate(eventDate)
                        )}
                    </span>

                </div>

                <!-- Location -->

                <div
                    class="
                        mt-2
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-600
                    "
                >

                    <span>
                        <svg class="h-4 w-4 inline-block text-current align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </span>

                    <span class="line-clamp-1">
                        ${escapeHTML(location)}
                    </span>

                </div>

                <!-- Stats -->

                <div
                    class="
                        mt-5
                        grid
                        gap-2
                        ${
                            isFreeEvent
                                ? "grid-cols-1"
                                : "grid-cols-3"
                        }
                    "
                >

                    ${!isFreeEvent ? `

                        <!-- Sold -->

                        <div
                            class="
                                rounded-2xl
                                bg-[#e76f51]/10
                                p-3
                            "
                        >

                            <p
                                class="
                                    text-xs
                                    text-gray-500
                                "
                            >
                                Price
                            </p>

                            <p
                                class="
                                    mt-1
                                    font-bold
                                    text-[#e76f51]
                                "
                            >
                                ${escapeHTML(
                                    formatPrice(price)
                                )}
                            </p>

                        </div>

                        <!-- Sold -->

                        <div
                            class="
                                rounded-2xl
                                bg-gray-50
                                p-3
                            "
                        >

                            <p
                                class="
                                    text-xs
                                    text-gray-500
                                "
                            >
                                Sold
                            </p>

                            <p
                                class="
                                    mt-1
                                    font-bold
                                    text-gray-900
                                "
                            >
                                ${soldSeats}
                            </p>

                        </div>

                        <!-- Available -->

                        <div
                            class="
                                rounded-2xl
                                bg-gray-50
                                p-3
                            "
                        >

                            <p
                                class="
                                    text-xs
                                    text-gray-500
                                "
                            >
                                Available
                            </p>

                            <p
                                class="
                                    mt-1
                                    font-bold
                                    text-gray-900
                                "
                            >
                                ${availableSeats}
                            </p>

                        </div>

                    ` : `

                        <!-- Free Event spacer -->

                        <div
                            class="
                                rounded-2xl
                                bg-gray-50
                                p-3
                            "
                        >

                            <p
                                class="
                                    text-xs
                                    text-gray-500
                                "
                            >
                                Type
                            </p>

                            <p
                                class="
                                    mt-1
                                    font-bold
                                    text-gray-900
                                "
                            >
                                Free
                            </p>

                        </div>

                    `}

                </div>

                <!-- Action -->

                <div class="mt-5">

                    <a
                        href="./event-details.html?id=${encodeURIComponent(eventId)}"
                        class="
                            inline-flex
                            w-full
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-[#e76f51]
                            px-4
                            py-3
                            text-sm
                            font-bold
                            text-[#e76f51]
                            transition
                            hover:bg-[#e76f51]
                            hover:text-white
                        "
                    >
                        View Event
                    </a>

                </div>

            </div>
        `;

        eventsList.appendChild(card);

    });
}

// Show Error

function showEventsError(message) {

    eventsLoading.classList.add("hidden");

    eventsContent.classList.add("hidden");

    eventsEmpty.classList.add("hidden");

    eventsErrorMessage.textContent =
        message ||
        "Unable to load your events.";

    eventsError.classList.remove("hidden");
}

// Load My Events

async function loadMyEvents() {

    eventsLoading.classList.remove("hidden");

    eventsError.classList.add("hidden");

    eventsContent.classList.add("hidden");

    eventsEmpty.classList.add("hidden");

    try {

        /*
         * Organizer events endpoint
         *
         * Change only this endpoint if
         * your backend uses another route.
         */

        const response =
            await fetch(
                `${API_URL}/events/my-events`,
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
            "My Events Response:",
            result
        );

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load your events."
            );
        }

        /*
         * Expected:
         *
         * result.data
         *
         * OR
         *
         * result.data.events
         */

        const events =
            Array.isArray(result.data)
                ? result.data
                : (
                    result.data?.events ||
                    []
                );

        eventsLoading.classList.add("hidden");

        const activeEvents = (events || []).filter(event => !isEventExpired(event));
        displayEvents(activeEvents);

    } catch (error) {

        console.error(
            "My Events Error:",
            error
        );

        eventsLoading.classList.add("hidden");

        showEventsError(
            error.message ||
            "Unable to load your events. Please try again."
        );
    }
}

// Retry

if (retryEventsButton) {

    retryEventsButton.addEventListener(
        "click",
        loadMyEvents
    );

}

// Start

loadMyEvents();