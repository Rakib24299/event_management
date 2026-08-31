// ========================================
// EventEase - Events Page
// ========================================


// ========================================
// API Configuration
// ========================================

const API_URL = "http://localhost:5000/api/v1";

const EVENTS_ENDPOINT = `${API_URL}/events`;


// ========================================
// Elements
// ========================================

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


// ========================================
// State
// ========================================

let allEvents = [];


// ========================================
// Authentication
// ========================================

const token =
    localStorage.getItem("token");


// ========================================
// Check Login
// ========================================

if (!token) {

    window.location.href =
        "./user-login.html";

}


// ========================================
// Loading State
// ========================================

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


// ========================================
// Error State
// ========================================

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
                ⚠️
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


// ========================================
// Empty State
// ========================================

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
                🔍
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


// ========================================
// Escape HTML
// ========================================

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


// ========================================
// Get Event ID
// ========================================

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


// ========================================
// Format Date
// ========================================

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


// ========================================
// Get Event Name
// ========================================

function getEventName(event) {

    return (
        event.title ||
        event.name ||
        event.eventName ||
        "Untitled Event"
    );

}


// ========================================
// Get Event Category
// ========================================

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


// ========================================
// Get Event Image
// ========================================

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


// ========================================
// Get Event Price
// ========================================

function getEventPrice(event) {

    const price =
        event.ticketPrice ??
        event.price ??
        event.registrationFee ??
        0;


    return Number(price) || 0;

}


// ========================================
// Get Event Date
// ========================================

function getEventDate(event) {

    return (
        event.eventDate ||
        event.date ||
        event.startDate ||
        event.startTime
    );

}


// ========================================
// Format Location
// ========================================

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


// ========================================
// Get Event Location
// ========================================

function getEventLocation(event) {

    return (
        formatLocation(event.location) ||
        formatLocation(event.venue) ||
        formatLocation(event.address) ||
        "Location not available"
    );

}


// ========================================
// Render Events
// ========================================

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


// ========================================
// Create Event Card
// ========================================

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
                🎟️
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

    const detailsURL =
        `./event-details.html?id=${encodeURIComponent(id)}`;


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
                        📍 ${location}
                    </p>

                    <p>
                        📅 ${date}
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
                                text-primary
                            "
                        >
                            ${
                                price > 0
                                    ? `৳${price.toLocaleString()}`
                                    : "Free"
                            }
                        </p>

                    </div>


                    <a
                        href="${detailsURL}"
                        class="
                            rounded-xl
                            bg-primary
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-primaryDark
                        "
                    >
                        View Details
                    </a>

                </div>

            </div>

        </article>

    `;

}


// ========================================
// Update Event Count
// ========================================

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


// ========================================
// Extract Events From API Response
// ========================================

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


// ========================================
// Fetch Events
// ========================================

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


// ========================================
// Filter Events
// ========================================

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


// ========================================
// Search Button
// ========================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        filterEvents
    );

}


// ========================================
// Search While Typing
// ========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterEvents
    );

}


// ========================================
// Category Filter
// ========================================

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterEvents
    );

}


// ========================================
// Event Type Filter
// ========================================

if (eventTypeFilter) {

    eventTypeFilter.addEventListener(
        "change",
        filterEvents
    );

}


// ========================================
// Clear Filters
// ========================================

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


// ========================================
// Initialize
// ========================================

fetchEvents();