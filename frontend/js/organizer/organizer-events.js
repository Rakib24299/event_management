// ========================================
// EventEase Organizer Events
// ========================================


// ========================================
// Configuration
// ========================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// ========================================
// DOM Elements
// ========================================

const eventsContainer =
    document.getElementById(
        "eventsContainer"
    );

const loadingState =
    document.getElementById(
        "loadingState"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const errorState =
    document.getElementById(
        "errorState"
    );

const errorMessage =
    document.getElementById(
        "errorMessage"
    );

const retryBtn =
    document.getElementById(
        "retryBtn"
    );


// Statistics

const totalEvents =
    document.getElementById(
        "totalEvents"
    );

const publishedEvents =
    document.getElementById(
        "publishedEvents"
    );

const draftEvents =
    document.getElementById(
        "draftEvents"
    );

const completedEvents =
    document.getElementById(
        "completedEvents"
    );

const cancelledEvents =
    document.getElementById(
        "cancelledEvents"
    );


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
        "Please login as an organizer."
    );

    window.location.href =
        "./organizer-login.html";

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


    let data;

    try {

        data =
            await response.json();

    } catch (error) {

        throw new Error(
            "Invalid server response."
        );

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
// Prevent unsafe HTML injection
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
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

};


// ========================================
// Format Date
// ========================================

const formatDate = (
    date
) => {

    if (!date) {

        return "Date not available";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "Date not available";

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

        return "";

    }


    return escapeHTML(
        time
    );

};


// ========================================
// Get Status Classes
// ========================================

const getStatusClasses = (
    status
) => {

    switch (status) {

        case "published":

            return {
                badge:
                    "bg-green-100 text-green-700",
            };


        case "draft":

            return {
                badge:
                    "bg-yellow-100 text-yellow-700",
            };


        case "completed":

            return {
                badge:
                    "bg-blue-100 text-blue-700",
            };


        case "cancelled":

            return {
                badge:
                    "bg-red-100 text-red-700",
            };


        default:

            return {
                badge:
                    "bg-gray-100 text-gray-700",
            };

    }

};


// ========================================
// Get Event Image
// ========================================

const getEventImage = (
    event
) => {

    if (
        event.bannerImage &&
        event.bannerImage.url
    ) {

        return event.bannerImage.url;

    }


    return null;

};


// ========================================
// Render Statistics
// ========================================

const renderStatistics = (
    events
) => {

    totalEvents.textContent =
        events.length;


    publishedEvents.textContent =
        events.filter(
            event =>
                event.status ===
                "published"
        ).length;


    draftEvents.textContent =
        events.filter(
            event =>
                event.status ===
                "draft"
        ).length;


    completedEvents.textContent =
        events.filter(
            event =>
                event.status ===
                "completed"
        ).length;


    cancelledEvents.textContent =
        events.filter(
            event =>
                event.status ===
                "cancelled"
        ).length;

};


// ========================================
// Create Event Card
// ========================================

const createEventCard = (
    event
) => {

    const status =
        event.status || "draft";


    const statusClasses =
        getStatusClasses(
            status
        );


    const eventImage =
        getEventImage(
            event
        );


    const imageHTML =
        eventImage

            ? `

                <img
                    src="${escapeHTML(eventImage)}"
                    alt="${escapeHTML(event.title)}"
                    class="h-52 w-full object-cover"
                    loading="lazy"
                >

            `

            : `

                <div
                    class="flex h-52 w-full items-center justify-center bg-gradient-to-br from-primaryLight to-primary text-6xl"
                >
                    📅
                </div>

            `;


    const categoryName =
        event.category &&
        event.category.name

            ? event.category.name

            : "Uncategorized";


    const venueName =
        event.venue &&
        event.venue.venueName

            ? event.venue.venueName

            : "Venue not specified";


    const city =
        event.venue &&
        event.venue.city

            ? event.venue.city

            : "";


    const locationText =
        city
            ? `${venueName}, ${city}`
            : venueName;


    const ticketPrice =
        Number(
            event.ticketPrice || 0
        );


    const availableSeats =
        event.availableSeats !==
        undefined

            ? event.availableSeats

            : 0;


    const totalSeats =
        event.totalSeats !==
        undefined

            ? event.totalSeats

            : 0;


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "overflow-hidden rounded-3xl bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg";


    card.innerHTML = `

        <!-- Event Image -->

        <div class="relative">

            ${imageHTML}


            <!-- Status -->

            <span
                class="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClasses.badge}"
            >
                ${escapeHTML(status)}
            </span>

        </div>


        <!-- Content -->

        <div class="p-5">


            <!-- Category -->

            <p
                class="text-xs font-bold uppercase tracking-wider text-primary"
            >
                ${escapeHTML(categoryName)}
            </p>


            <!-- Title -->

            <h2
                class="mt-2 line-clamp-2 text-xl font-extrabold text-gray-900"
            >
                ${escapeHTML(
                    event.title ||
                    "Untitled Event"
                )}
            </h2>


            <!-- Date -->

            <div
                class="mt-4 flex items-start gap-3"
            >

                <span
                    class="text-lg"
                >
                    📅
                </span>

                <div>

                    <p
                        class="text-xs font-semibold text-gray-400"
                    >
                        Date
                    </p>

                    <p
                        class="text-sm font-semibold text-gray-700"
                    >
                        ${formatDate(
                            event.eventDate
                        )}
                    </p>

                </div>

            </div>


            <!-- Time -->

            <div
                class="mt-3 flex items-start gap-3"
            >

                <span
                    class="text-lg"
                >
                    🕐
                </span>

                <div>

                    <p
                        class="text-xs font-semibold text-gray-400"
                    >
                        Time
                    </p>

                    <p
                        class="text-sm font-semibold text-gray-700"
                    >
                        ${formatTime(
                            event.startTime
                        )}
                        ${
                            event.endTime
                                ? ` - ${formatTime(
                                    event.endTime
                                )}`
                                : ""
                        }
                    </p>

                </div>

            </div>


            <!-- Venue -->

            <div
                class="mt-3 flex items-start gap-3"
            >

                <span
                    class="text-lg"
                >
                    📍
                </span>

                <div>

                    <p
                        class="text-xs font-semibold text-gray-400"
                    >
                        Venue
                    </p>

                    <p
                        class="text-sm font-semibold text-gray-700"
                    >
                        ${escapeHTML(
                            locationText
                        )}
                    </p>

                </div>

            </div>


            <!-- Seats -->

            <div
                class="mt-5 grid grid-cols-2 gap-3"
            >

                <div
                    class="rounded-2xl bg-gray-50 p-3"
                >

                    <p
                        class="text-xs text-gray-400"
                    >
                        Total Seats
                    </p>

                    <p
                        class="mt-1 font-bold text-gray-900"
                    >
                        ${totalSeats}
                    </p>

                </div>


                <div
                    class="rounded-2xl bg-green-50 p-3"
                >

                    <p
                        class="text-xs text-gray-400"
                    >
                        Available
                    </p>

                    <p
                        class="mt-1 font-bold text-primary"
                    >
                        ${availableSeats}
                    </p>

                </div>

            </div>


            <!-- Price -->

            <div
                class="mt-4 flex items-center justify-between"
            >

                <span
                    class="text-sm text-gray-500"
                >
                    Ticket Price
                </span>

                <span
                    class="font-extrabold text-gray-900"
                >
                    ${
                        ticketPrice === 0
                            ? "Free"
                            : `${ticketPrice} BDT`
                    }
                </span>

            </div>


            <!-- Actions -->

            <div
                class="mt-5 grid grid-cols-2 gap-2"
            >

                <button
                    type="button"
                    class="view-event-btn rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    data-id="${event._id}"
                >
                    View
                </button>


                <button
                    type="button"
                    class="edit-event-btn rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primaryDark"
                    data-id="${event._id}"
                >
                    Edit
                </button>

            </div>


            <!-- Danger Actions -->

            <div
                class="mt-2 grid grid-cols-2 gap-2"
            >

                ${
                    status !== "cancelled"

                        ? `

                            <button
                                type="button"
                                class="cancel-event-btn rounded-xl border border-orange-200 px-4 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
                                data-id="${event._id}"
                            >
                                Cancel
                            </button>

                        `

                        : `

                            <div></div>

                        `
                }


                <button
                    type="button"
                    class="delete-event-btn rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    data-id="${event._id}"
                >
                    Delete
                </button>

            </div>

        </div>

    `;


    return card;

};


// ========================================
// Render Events
// ========================================

const renderEvents = (
    events
) => {

    loadingState.classList.add(
        "hidden"
    );

    errorState.classList.add(
        "hidden"
    );


    eventsContainer.innerHTML =
        "";


    if (
        !events ||
        events.length === 0
    ) {

        emptyState.classList.remove(
            "hidden"
        );

        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    renderStatistics(
        events
    );


    events.forEach(
        event => {

            eventsContainer.appendChild(
                createEventCard(
                    event
                )
            );

        }
    );


    attachEventActions();

};


// ========================================
// Load My Events
// ========================================

const loadMyEvents =
    async () => {

        try {

            loadingState.classList.remove(
                "hidden"
            );

            emptyState.classList.add(
                "hidden"
            );

            errorState.classList.add(
                "hidden"
            );

            eventsContainer.innerHTML =
                "";


            const result =
                await apiRequest(
                    "/events/my-events"
                );


            const events =
                result.data || [];


            renderEvents(
                events
            );


        } catch (error) {

            console.error(
                "Organizer events error:",
                error
            );


            loadingState.classList.add(
                "hidden"
            );

            eventsContainer.innerHTML =
                "";

            errorState.classList.remove(
                "hidden"
            );


            errorMessage.textContent =
                error.message ||
                "Unable to load your events.";

        }

    };


// ========================================
// View Event
// ========================================

const viewEvent = (
    eventId
) => {

    if (!eventId) {
        return;
    }


    window.location.href =
        `./event-details.html?id=${encodeURIComponent(
            eventId
        )}`;

};


// ========================================
// Edit Event
// ========================================

const editEvent = (
    eventId
) => {

    if (!eventId) {
        return;
    }


    window.location.href =
        `./edit-event.html?id=${encodeURIComponent(
            eventId
        )}`;

};


// ========================================
// Cancel Event
// ========================================

const cancelEvent = async (
    eventId
) => {

    if (!eventId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to cancel this event?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/events/${eventId}/cancel`,
            {
                method: "PATCH",
            }
        );


        alert(
            "Event cancelled successfully."
        );


        await loadMyEvents();


    } catch (error) {

        console.error(
            "Cancel event error:",
            error
        );


        alert(
            error.message ||
            "Failed to cancel event."
        );

    }

};


// ========================================
// Delete Event
// ========================================

const deleteEvent = async (
    eventId
) => {

    if (!eventId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete this event? This action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/events/${eventId}`,
            {
                method: "DELETE",
            }
        );


        alert(
            "Event deleted successfully."
        );


        await loadMyEvents();


    } catch (error) {

        console.error(
            "Delete event error:",
            error
        );


        alert(
            error.message ||
            "Failed to delete event."
        );

    }

};


// ========================================
// Attach Event Actions
// ========================================

const attachEventActions = () => {


    // View

    document
        .querySelectorAll(
            ".view-event-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        viewEvent(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    // Edit

    document
        .querySelectorAll(
            ".edit-event-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        editEvent(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    // Cancel

    document
        .querySelectorAll(
            ".cancel-event-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        cancelEvent(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    // Delete

    document
        .querySelectorAll(
            ".delete-event-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteEvent(
                            button.dataset.id
                        );

                    }
                );

            }
        );

};


// ========================================
// Retry
// ========================================

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        loadMyEvents
    );

}


// ========================================
// Initial Load
// ========================================

loadMyEvents();