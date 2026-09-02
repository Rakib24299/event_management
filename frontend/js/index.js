// ========================================
// EventEase - Homepage
// ========================================

const API_URL = "http://localhost:5000/api/v1";

// ========================================
// State
// ========================================

let allEvents = [];
let allCategories = [];

// ========================================
// Category Icons
// ========================================

const categoryIcons = {

    "Music": "🎵",
    "Others": "📍",
    "Cricket": "🏏",
    "Entertainment": "🎭",
    "Education": "🎓",
    "Health & Wellness": "🏥",
    "Arts & Culture": "🎨",
    "Food & Drink": "🍔",
    "Business": "💼",
    "Technology": "💻",
    "Sports": "⚽",
    "Football": "🏈"

};

// ========================================
// Token (optional)
// ========================================

const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

// ========================================
// Elements
// ========================================

const featuredEventsContainer =
    document.getElementById("featuredEvents");

const categoriesContainer =
    document.getElementById("categoriesContainer");

const eventsLoading =
    document.getElementById("eventsLoading");

const eventsError =
    document.getElementById("eventsError");

const retryEventsBtn =
    document.getElementById("retryEvents");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const locationFilter =
    document.getElementById("locationFilter");

const dateFilter =
    document.getElementById("dateFilter");

const searchButton =
    document.getElementById("searchButton");

const clearFiltersBtn =
    document.getElementById("clearFilters");

// ========================================
// API Request Helper
// ========================================

async function apiRequest(endpoint, options = {}) {

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );

    let data = {};

    try {
        data =
            await response.json();
    } catch (e) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Request failed"
        );
    }

    return data;

}

// ========================================
// Utility Functions
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

function getEventName(event) {

    return (
        event.title ||
        event.name ||
        event.eventName ||
        "Untitled Event"
    );

}

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

function getEventPrice(event) {

    const price =
        event.ticketPrice ??
        event.price ??
        event.registrationFee ??
        0;

    return Number(price) || 0;

}

function getEventDate(event) {

    return (
        event.eventDate ||
        event.date ||
        event.startDate ||
        event.startTime
    );

}

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

function getEventLocation(event) {

    return (
        formatLocation(event.location) ||
        formatLocation(event.venue) ||
        formatLocation(event.address) ||
        "Location not available"
    );

}

function extractEvents(result) {

    if (!result) {
        return [];
    }

    if (Array.isArray(result.data)) {
        return result.data;
    }

    if (Array.isArray(result.data?.events)) {
        return result.data.events;
    }

    if (Array.isArray(result.data?.data)) {
        return result.data.data;
    }

    if (Array.isArray(result.events)) {
        return result.events;
    }

    return [];

}

// ========================================
// Loading / Error / Empty States
// ========================================

function showLoading() {

    if (eventsLoading) {
        eventsLoading.classList.remove("hidden");
    }

    if (eventsError) {
        eventsError.classList.add("hidden");
    }

    if (featuredEventsContainer) {
        featuredEventsContainer.innerHTML = "";
    }

}

function hideLoading() {

    if (eventsLoading) {
        eventsLoading.classList.add("hidden");
    }

}

function showError() {

    hideLoading();

    if (eventsError) {
        eventsError.classList.remove("hidden");
    }

    if (featuredEventsContainer) {
        featuredEventsContainer.innerHTML = "";
    }

}

function showEmptyState() {

    hideLoading();

    if (eventsError) {
        eventsError.classList.add("hidden");
    }

    if (featuredEventsContainer) {

        featuredEventsContainer.innerHTML = `

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

                <div class="text-5xl">🔍</div>

                <h3 class="mt-4 text-xl font-bold text-gray-900">

                    No events found

                </h3>

                <p class="mt-2 text-sm text-gray-500">

                    Try changing your search or filter options.

                </p>

            </div>

        `;

    }

}

// ========================================
// Render Events
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
                class="h-full w-full object-cover"
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

    const detailsURL =
        `./pages/user/event-details.html?id=${encodeURIComponent(id)}`;

    return `

        <article
            class="
                group
                overflow-hidden
                rounded-2xl
                border
                border-gray-100
                bg-white
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-lg
            "
        >

            <div
                class="
                    relative
                    h-52
                    overflow-hidden
                    bg-green-50
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

                        <p class="text-xs text-gray-400">

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

function renderEvents(events) {

    if (!featuredEventsContainer) {
        return;
    }

    if (
        !Array.isArray(events) ||
        events.length === 0
    ) {

        showEmptyState();

        return;

    }

    hideLoading();

    if (eventsError) {
        eventsError.classList.add("hidden");
    }

    const displayEvents =
        events.slice(0, 8);

    featuredEventsContainer.innerHTML =
        displayEvents
            .map(createEventCard)
            .join("");

}

// ========================================
// Render Categories
// ========================================

function createCategoryCard(category) {

    const name =
        escapeHTML(
            category.name ||
            category.title ||
            "Category"
        );

    const rawName =
        category.name ||
        category.title ||
        "";

    const icon =
        categoryIcons[rawName] ||
        category.icon ||
        category.emoji ||
        "📍";

    const count =
        category.eventCount ||
        category.count ||
        "";

    const href =
        `./pages/user/events.html?category=${encodeURIComponent(name.toLowerCase())}`;

    return `

        <a
            href="${href}"
            class="
                flex
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-6
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-md
            "
        >

            <div class="text-3xl">

                ${icon}

            </div>

            <p class="mt-3 text-sm font-semibold text-gray-900">

                ${name}

            </p>

            ${
                count
                    ? `
                        <p class="mt-1 text-xs text-gray-400">

                            ${count} events

                        </p>
                    `
                    : ""
            }

        </a>

    `;

}

function renderCategories(categories) {

    if (!categoriesContainer) {
        return;
    }

    if (
        !Array.isArray(categories) ||
        categories.length === 0
    ) {

        categoriesContainer.innerHTML = `

            <div
                class="
                    col-span-full
                    text-center
                    text-sm
                    text-gray-500
                "
            >

                No categories available.

            </div>

        `;

        return;

    }

    categoriesContainer.innerHTML =
        categories
            .map(createCategoryCard)
            .join("");

}

function populateCategoryDropdown(categories) {

    if (!categoryFilter) {
        return;
    }

    const options =
        categories
            .map(cat => {

                const name =
                    cat.name ||
                    cat.title ||
                    "";

                return `

                    <option
                        value="${escapeHTML(name.toLowerCase())}"
                    >

                        ${escapeHTML(name)}

                    </option>

                `;

            })
            .join("");

    categoryFilter.innerHTML = `

        <option value="">All Categories</option>

        ${options}

    `;

}

// ========================================
// Fetch Categories
// ========================================

async function fetchCategories() {

    try {

        const data =
            await apiRequest("/categories");

        const categories =
            Array.isArray(data)
                ? data
                : (data.data || data.categories || []);

        allCategories = categories;

        renderCategories(categories);

        populateCategoryDropdown(categories);

    } catch (error) {

        console.error(
            "Failed to load categories:",
            error
        );

        if (categoriesContainer) {

            categoriesContainer.innerHTML = `

                <div
                    class="
                        col-span-full
                        text-center
                        text-sm
                        text-gray-500
                    "
                >

                    Unable to load categories.

                </div>

            `;

        }

    }

}

// ========================================
// Fetch Events
// ========================================

async function fetchEvents() {

    showLoading();

    try {

        const data =
            await apiRequest("/events");

        const events =
            extractEvents(data);

        if (!Array.isArray(events)) {

            throw new Error(
                "Invalid events data received from server."
            );

        }

        allEvents = events;

        renderEvents(events);

    } catch (error) {

        console.error(
            "Fetch Events Error:",
            error
        );

        showError();

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

    const selectedLocation =
        locationFilter?.value
            .trim()
            .toLowerCase() || "";

    const selectedDate =
        dateFilter?.value || "";

    const filteredEvents =
        allEvents.filter(
            (event) => {

                const title =
                    getEventName(event)
                        .toLowerCase();

                const category =
                    getCategory(event)
                        .toLowerCase();

                const location =
                    getEventLocation(event)
                        .toLowerCase();

                const eventDate =
                    getEventDate(event);

                const matchesSearch =
                    !searchTerm ||
                    title.includes(searchTerm);

                const matchesCategory =
                    !selectedCategory ||
                    category.includes(
                        selectedCategory
                    );

                const matchesLocation =
                    !selectedLocation ||
                    location.includes(
                        selectedLocation
                    );

                let matchesDate = true;

                if (
                    selectedDate &&
                    eventDate
                ) {

                    const eventDateTime =
                        new Date(eventDate);

                    const selectedDateTime =
                        new Date(selectedDate);

                    matchesDate =
                        eventDateTime.toDateString() ===
                        selectedDateTime.toDateString();

                }

                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesLocation &&
                    matchesDate
                );

            }
        );

    renderEvents(
        filteredEvents
    );

}

// ========================================
// Event Listeners
// ========================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        filterEvents
    );

}

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterEvents
    );

}

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterEvents
    );

}

if (locationFilter) {

    locationFilter.addEventListener(
        "input",
        filterEvents
    );

}

if (dateFilter) {

    dateFilter.addEventListener(
        "change",
        filterEvents
    );

}

if (clearFiltersBtn) {

    clearFiltersBtn.addEventListener(
        "click",
        () => {

            if (searchInput) {
                searchInput.value = "";
            }

            if (categoryFilter) {
                categoryFilter.value = "";
            }

            if (locationFilter) {
                locationFilter.value = "";
            }

            if (dateFilter) {
                dateFilter.value = "";
            }

            renderEvents(
                allEvents
            );

        }
    );

}

if (retryEventsBtn) {

    retryEventsBtn.addEventListener(
        "click",
        fetchEvents
    );

}

// ========================================
// Initialize
// ========================================

Promise.allSettled([

    fetchCategories(),
    fetchEvents()

]);
