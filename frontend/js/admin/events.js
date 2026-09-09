
// ========================================
// Helper: Is Event Expired
// ========================================
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

// ========================================
// EventEase Admin Manage Events
// ========================================


// ========================================
// Configuration
// ========================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// ========================================
// DOM Elements
// ========================================

const loadingState =
    document.getElementById("loadingState");

const errorState =
    document.getElementById("errorState");

const errorMessage =
    document.getElementById("errorMessage");

const retryBtn =
    document.getElementById("retryBtn");

const content =
    document.getElementById("content");

const eventList =
    document.getElementById("eventList");

const emptyState =
    document.getElementById("emptyState");

const eventCount =
    document.getElementById("eventCount");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const typeFilter =
    document.getElementById("typeFilter");

const logoutBtn =
    document.getElementById("logoutBtn");


// ========================================
// Get Token
// ========================================

const getToken = () => {

    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );

};


// ========================================
// Authentication Check
// ========================================

const token = getToken();


if (!token) {

    alert(
        "Please login as admin to access this page."
    );

    window.location.href =
        "./admin-login.html";

}


// ========================================
// API Request Helper
// ========================================

const apiRequest = async (
    endpoint,
    options = {}
) => {

    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {

                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`,

                    ...(options.headers || {}),

                },

            }
        );


    let data = {};


    try {

        data =
            await response.json();

    } catch (error) {

        data = {};

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Something went wrong."
        );

    }


    return data;

};


// ========================================
// Escape HTML
// ========================================

const escapeHTML = (
    value
) => {

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

};


// ========================================
// Format Date
// ========================================

const formatDate = (
    date
) => {

    if (!date) {

        return "N/A";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "N/A";

    }


    return parsedDate.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );

};


// ========================================
// Format Time
// ========================================

const formatTime = (
    time
) => {

    if (!time) {

        return "N/A";

    }


    return escapeHTML(time);

};


// ========================================
// Update Event Count
// ========================================

const updateEventCount = (
    count
) => {

    if (!eventCount) {

        return;

    }


    eventCount.textContent =
        `${count} ${count === 1 ? "Event" : "Events"}`;

};


// ========================================
// Get Status Badge
// ========================================

const getStatusBadge = (
    status
) => {

    switch (status) {

        case "published":

            return `

                <span
                    class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"
                >
                    <span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    Published
                </span>

            `;


        case "draft":

            return `

                <span
                    class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"
                >
                    <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    Draft
                </span>

            `;


        case "completed":

            return `

                <span
                    class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700"
                >
                    <span class="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    Completed
                </span>

            `;


        case "cancelled":

            return `

                <span
                    class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700"
                >
                    <span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    Cancelled
                </span>

            `;


        case "rejected":

            return `

                <span
                    class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700"
                >
                    <span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    Rejected
                </span>

            `;


        default:

            return `

                <span
                    class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700"
                >
                    <span class="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
                    Unknown
                </span>

            `;

    }

};


// ========================================
// Get Event Type Badge
// ========================================

const getEventTypeBadge = (
    eventType
) => {

    if (eventType === "free") {

        return `

            <span
                class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
            >
                Free
            </span>

        `;

    }


    return `

        <span
            class="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700"
        >
            Paid
        </span>

    `;

};


// ========================================
// Get Organizer Name
// ========================================

const getOrganizerName = (
    event
) => {

    if (
        event.organizer &&
        typeof event.organizer === "object"
    ) {

        return (
            event.organizer.name ||
            event.organizer.organizationName ||
            "Unknown Organizer"
        );

    }


    return "Unknown Organizer";

};


// ========================================
// Get Category Name
// ========================================

const getCategoryName = (
    event
) => {

    if (
        event.category &&
        typeof event.category === "object"
    ) {

        return (
            event.category.name ||
            "Uncategorized"
        );

    }


    return "Uncategorized";

};


// ========================================
// Render Empty State
// ========================================

const renderEmptyState = () => {

    eventList.innerHTML = "";

    emptyState.classList.remove(
        "hidden"
    );

};


// ========================================
// Render Events
// ========================================

const renderEvents = (
    events
) => {

    eventList.innerHTML = "";

    emptyState.classList.add(
        "hidden"
    );


    if (
        !events ||
        events.length === 0
    ) {

        renderEmptyState();

        updateEventCount(0);

        return;

    }


    updateEventCount(
        events.length
    );


    events.forEach(
        (event) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md";


            const eventId =
                event._id || "";


            const title =
                escapeHTML(
                    event.title ||
                    "Untitled Event"
                );


            const slug =
                escapeHTML(
                    event.slug ||
                    ""
                );


            const organizer =
                escapeHTML(
                    getOrganizerName(event)
                );


            const organizerEmail =
                event.organizer &&
                typeof event.organizer === "object"
                    ? escapeHTML(
                        event.organizer.email ||
                        "No email"
                    )
                    : "No email";


            const category =
                escapeHTML(
                    getCategoryName(event)
                );


            const venue =
                event.venue &&
                typeof event.venue === "object"
                    ? escapeHTML(
                        event.venue.venueName ||
                        "Venue not specified"
                    )
                    : "Venue not specified";


            const city =
                event.venue &&
                typeof event.venue === "object"
                    ? escapeHTML(
                        event.venue.city ||
                        ""
                    )
                    : "";


            const eventDate =
                formatDate(
                    event.eventDate
                );


            const startTime =
                formatTime(
                    event.startTime
                );


            const endTime =
                formatTime(
                    event.endTime
                );


            const totalSeats =
                Number(
                    event.totalSeats || 0
                );


            const availableSeats =
                Number(
                    event.availableSeats || 0
                );


            const ticketPrice =
                Number(
                    event.ticketPrice || 0
                );


            const eventType =
                event.eventType ||
                "paid";


            const status =
                event.status ||
                "draft";


            const bannerImage =
                event.bannerImage?.url ||
                "";


            card.innerHTML = `

                <!-- ==================================
                      EVENT BANNER
                =================================== -->

                <div
                    class="relative h-48 w-full shrink-0 overflow-hidden bg-gray-100"
                >

                    ${
                        bannerImage

                            ? `

                                <img
                                    src="${escapeHTML(bannerImage)}"
                                    alt="${title}"
                                    class="h-full w-full object-cover"
                                >

                              `

                            : `

                                <div
                                    class="flex h-full w-full items-center justify-center text-5xl"
                                >
                                    <svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                </div>

                              `
                    }

                </div>


                <!-- ==================================
                      EVENT CONTENT
                =================================== -->

                <div
                    class="flex flex-1 flex-col p-5"
                >


                    <!-- Title / Badges -->

                    <div
                        class="flex flex-wrap items-center gap-2"
                    >

                        <h3
                            class="text-lg font-bold text-gray-900"
                        >
                            ${title}
                        </h3>

                    </div>


                    <div
                        class="mt-2 flex flex-wrap items-center gap-2"
                    >

                        ${getStatusBadge(status)}


                        ${getEventTypeBadge(eventType)}

                    </div>


                    <!-- Slug -->

                    ${
                        slug

                            ? `

                                <p
                                    class="mt-2 text-xs text-gray-400"
                                >
                                    /${slug}
                                </p>

                              `

                            : ""
                    }


                    <!-- Organizer -->

                    <div
                        class="mt-4"
                    >

                        <p
                            class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                        >
                            Organizer
                        </p>


                        <p
                            class="mt-1 text-sm font-semibold text-gray-800"
                        >
                            ${organizer}
                        </p>


                        <p
                            class="mt-0.5 text-xs text-gray-500"
                        >
                            ${organizerEmail}
                        </p>

                    </div>


                    <!-- Event Details -->

                    <div
                        class="mt-4 grid grid-cols-2 gap-3"
                    >

                        <!-- Category -->

                        <div>

                            <p
                                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                            >
                                Category
                            </p>


                            <p
                                class="mt-1 text-sm font-semibold text-gray-800"
                            >
                                ${category}
                            </p>

                        </div>


                        <!-- Date -->

                        <div>

                            <p
                                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                            >
                                Event Date
                            </p>


                            <p
                                class="mt-1 text-sm font-semibold text-gray-800"
                            >
                                ${eventDate}
                            </p>

                        </div>


                        <!-- Time -->

                        <div>

                            <p
                                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                            >
                                Time
                            </p>


                            <p
                                class="mt-1 text-sm font-semibold text-gray-800"
                            >
                                ${startTime} - ${endTime}
                            </p>

                        </div>


                        ${eventType !== "free" ? `

                            <!-- Price -->

                            <div>

                                <p
                                    class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                                >
                                    Ticket Price
                                </p>


                                <p
                                    class="mt-1 text-sm font-semibold text-gray-800"
                                >
                                    BDT ${ticketPrice.toLocaleString()}
                                </p>

                            </div>

                        ` : ""}

                    </div>


                    <!-- Venue -->

                    <div
                        class="mt-4"
                    >

                        <p
                            class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                        >
                            Venue
                        </p>


                        <p
                            class="mt-1 text-sm font-semibold text-gray-800"
                        >
                            <svg class="h-4 w-4 inline-block text-current align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> ${venue}
                            ${
                                city
                                    ? `, ${city}`
                                    : ""
                            }
                        </p>

                    </div>


                    ${eventType !== "free" ? `

                        <!-- Seats -->

                        <div
                            class="mt-4 flex flex-wrap gap-2"
                        >

                            <div
                                class="rounded-xl bg-gray-50 px-3 py-2"
                            >

                                <p
                                    class="text-xs text-gray-400"
                                >
                                    Total Seats
                                </p>


                                <p
                                    class="mt-0.5 text-sm font-bold text-gray-800"
                                >
                                    ${totalSeats}
                                </p>

                            </div>


                            <div
                                class="rounded-xl bg-green-50 px-3 py-2"
                            >

                                <p
                                    class="text-xs text-green-600"
                                >
                                    Available Seats
                                </p>


                                <p
                                    class="mt-0.5 text-sm font-bold text-green-700"
                                >
                                    ${availableSeats}
                                </p>

                            </div>


                            <div
                                class="rounded-xl bg-primaryLight/10 px-3 py-2"
                            >

                                <p
                                    class="text-xs text-primary"
                                >
                                    Max / User
                                </p>


                                <p
                                    class="mt-0.5 text-sm font-bold text-primary"
                                >
                                    ${Number(event.maxTicketsPerUser || 0)}
                                </p>

                            </div>

                        </div>

                    ` : ""}

                </div>


                <!-- ==================================
                      ACTIONS
                =================================== -->

                <div
                    class="flex shrink-0 gap-2 border-t border-gray-100 px-5 py-4"
                >

                    <!-- View -->

                    <button
                        type="button"
                        class="viewBtn flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                        data-id="${escapeHTML(eventId)}"
                    >
                        View
                    </button>


                    <!-- Activate -->

                    ${
                        status === "draft"
                            ? `

                                <button
                                    type="button"
                                    class="activateBtn flex-1 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                                    data-id="${escapeHTML(eventId)}"
                                >
                                    Activate
                                </button>

                              `
                            : ""
                    }


                    <!-- Delete -->

                    <button
                        type="button"
                        class="deleteBtn flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        data-id="${escapeHTML(eventId)}"
                    >
                        Delete
                    </button>

                </div>

            `;


            eventList.appendChild(
                card
            );

        }
    );


    attachEventListeners();

};


// ========================================
// Attach Event Listeners
// ========================================

const attachEventListeners = () => {


    // =====================================
    // View Buttons
    // =====================================

    const viewButtons =
        eventList.querySelectorAll(
            ".viewBtn"
        );


    viewButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const eventId =
                        button.dataset.id;


                    if (!eventId) {

                        alert(
                            "Invalid event ID."
                        );

                        return;

                    }


                    window.location.href =
                        `./event-details.html?id=${encodeURIComponent(eventId)}`;

                }
            );

        }
    );


    // =====================================
    // Activate Buttons
    // =====================================

    const activateButtons =
        eventList.querySelectorAll(
            ".activateBtn"
        );


    activateButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const eventId =
                        button.dataset.id;


                    if (!eventId) {

                        alert(
                            "Invalid event ID."
                        );

                        return;

                    }


                    activateEvent(
                        eventId,
                        button
                    );

                }
            );

        }
    );


    // =====================================
    // Delete Buttons
    // =====================================

    const deleteButtons =
        eventList.querySelectorAll(
            ".deleteBtn"
        );


    deleteButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const eventId =
                        button.dataset.id;


                    deleteEvent(
                        eventId,
                        button
                    );

                }
            );

        }
    );

};


// ========================================
// Activate / Publish Event
// ========================================

const activateEvent = async (
    eventId,
    button
) => {


    // =====================================
    // Validate ID
    // =====================================

    if (!eventId) {

        alert(
            "Invalid event ID."
        );

        return;

    }


    // =====================================
    // Confirmation
    // =====================================

    const confirmed =
        confirm(
            "Are you sure you want to activate this event? The event will be published and visible to users."
        );


    if (!confirmed) {

        return;

    }


    try {

        // =================================
        // Disable Button
        // =================================

        button.disabled = true;

        button.textContent =
            "Activating...";


        // =================================
        // API Request
        // =================================

        const result =
            await apiRequest(
                `/events/${eventId}/publish`,
                {
                    method: "PATCH",
                }
            );


        console.log(
            "Activate Event Response:",
            result
        );


        // =================================
        // Success Message
        // =================================

        alert(
            result.message ||
            "Event published successfully."
        );


        // =================================
        // Reload Events
        // =================================

        await loadEvents();


    } catch (error) {

        console.error(
            "Activate event error:",
            error
        );


        alert(
            error.message ||
            "Failed to activate event."
        );


        // =================================
        // Restore Button
        // =================================

        button.disabled = false;

        button.textContent =
            "Activate";

    }

};


// ========================================
// Delete Event
// ========================================

const deleteEvent = async (
    eventId,
    button
) => {


    // =====================================
    // Validate ID
    // =====================================

    if (!eventId) {

        alert(
            "Invalid event ID."
        );

        return;

    }


    // =====================================
    // Confirmation
    // =====================================

    const confirmed =
        confirm(
            "Are you sure you want to delete this event? This action will remove the event from the active event list."
        );


    if (!confirmed) {

        return;

    }


    try {

        // =================================
        // Disable Button
        // =================================

        button.disabled = true;

        button.textContent =
            "Deleting...";


        // =================================
        // API Request
        // =================================

        const result =
            await apiRequest(
                `/admin/events/${eventId}`,
                {
                    method: "DELETE",
                }
            );


        // =================================
        // Success Message
        // =================================

        alert(
            result.message ||
            "Event deleted successfully."
        );


        // =================================
        // Reload Events
        // =================================

        await loadEvents();


    } catch (error) {

        console.error(
            "Delete event error:",
            error
        );


        alert(
            error.message ||
            "Failed to delete event."
        );


        // =================================
        // Restore Button
        // =================================

        button.disabled = false;

        button.textContent =
            "Delete";

    }

};


// ========================================
// Filter Events
// ========================================

const filterEvents = () => {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    const selectedType =
        typeFilter.value;


    const filteredEvents =
        allEvents.filter(
            (event) => {


                // ==========================
                // Search Values
                // ==========================

                const title =
                    String(
                        event.title || ""
                    ).toLowerCase();


                const organizer =
                    getOrganizerName(
                        event
                    ).toLowerCase();


                const category =
                    getCategoryName(
                        event
                    ).toLowerCase();


                // ==========================
                // Search Match
                // ==========================

                const matchesSearch =
                    !search ||
                    title.includes(search) ||
                    organizer.includes(search) ||
                    category.includes(search);


                // ==========================
                // Status Match
                // ==========================

                const matchesStatus =
                    selectedStatus === "all" ||
                    event.status === selectedStatus;


                // ==========================
                // Type Match
                // ==========================

                const matchesType =
                    selectedType === "all" ||
                    event.eventType === selectedType;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesType
                );

            }
        );


    renderEvents(
        filteredEvents
    );

};


// ========================================
// Load Events
// ========================================

let allEvents = [];


const loadEvents =
    async () => {

        try {

            // =================================
            // Loading State
            // =================================

            loadingState.classList.remove(
                "hidden"
            );

            content.classList.add(
                "hidden"
            );

            errorState.classList.add(
                "hidden"
            );


            // =================================
            // Get Events
            // =================================

            const result =
                await apiRequest(
                    "/admin/events"
                );


            // =================================
            // Store Events
            // =================================

            allEvents =
                (result.data || []).filter(event => !isEventExpired(event));


            // =================================
            // Render Events
            // =================================

            renderEvents(
                allEvents
            );


            // =================================
            // Show Content
            // =================================

            loadingState.classList.add(
                "hidden"
            );

            content.classList.remove(
                "hidden"
            );

        } catch (error) {

            console.error(
                "Load events error:",
                error
            );


            // =================================
            // Loading Off
            // =================================

            loadingState.classList.add(
                "hidden"
            );


            // =================================
            // Content Off
            // =================================

            content.classList.add(
                "hidden"
            );


            // =================================
            // Error On
            // =================================

            errorState.classList.remove(
                "hidden"
            );


            if (errorMessage) {

                errorMessage.textContent =
                    error.message ||
                    "Failed to load events.";

            }

        }

    };


// ========================================
// Search Listener
// ========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterEvents
    );

}


// ========================================
// Status Filter
// ========================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterEvents
    );

}


// ========================================
// Event Type Filter
// ========================================

if (typeFilter) {

    typeFilter.addEventListener(
        "change",
        filterEvents
    );

}


// ========================================
// Retry
// ========================================

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        loadEvents
    );

}


// ========================================
// Logout
// ========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            sessionStorage.removeItem(
                "token"
            );


            window.location.href =
                "./admin-login.html";

        }
    );

}


// ========================================
// Initial Load
// ========================================

loadEvents();
