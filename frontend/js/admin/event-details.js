// ========================================
// EventEase Admin Event Details
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

const logoutBtn =
    document.getElementById("logoutBtn");

const bannerContainer =
    document.getElementById("bannerContainer");

const eventTitle =
    document.getElementById("eventTitle");

const eventCategory =
    document.getElementById("eventCategory");

const statusContainer =
    document.getElementById("statusContainer");

const eventDate =
    document.getElementById("eventDate");

const eventTime =
    document.getElementById("eventTime");

const venueName =
    document.getElementById("venueName");

const venueAddress =
    document.getElementById("venueAddress");

const ticketPrice =
    document.getElementById("ticketPrice");

const ticketType =
    document.getElementById("ticketType");

const eventDescription =
    document.getElementById("eventDescription");

const organizerName =
    document.getElementById("organizerName");

const organizerEmail =
    document.getElementById("organizerEmail");

const organizationName =
    document.getElementById("organizationName");

const totalSeats =
    document.getElementById("totalSeats");

const availableSeats =
    document.getElementById("availableSeats");

const maxTickets =
    document.getElementById("maxTickets");

const seatPercentage =
    document.getElementById("seatPercentage");

const seatProgress =
    document.getElementById("seatProgress");

const averageRating =
    document.getElementById("averageRating");

const totalReviews =
    document.getElementById("totalReviews");

const gallerySection =
    document.getElementById("gallerySection");

const galleryGrid =
    document.getElementById("galleryGrid");

const eventId =
    document.getElementById("eventId");

const createdAt =
    document.getElementById("createdAt");

const updatedAt =
    document.getElementById("updatedAt");

const eventSlug =
    document.getElementById("eventSlug");

const deleteEventBtn =
    document.getElementById("deleteEventBtn");


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
// Get Event ID From URL
// ========================================

const getEventIdFromURL = () => {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");

};


const currentEventId =
    getEventIdFromURL();


// ========================================
// Validate Event ID
// ========================================

if (!currentEventId) {

    loadingState.classList.add(
        "hidden"
    );

    errorState.classList.remove(
        "hidden"
    );

    errorMessage.textContent =
        "Event ID is missing from the URL.";

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
// Format Date & Time
// ========================================

const formatDateTime = (
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


    return parsedDate.toLocaleString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }
    );

};


// ========================================
// Status Badge
// ========================================

const getStatusBadge = (
    status
) => {

    const statusConfig = {

        draft: {
            text: "Draft",
            className:
                "bg-gray-100 text-gray-700",
        },

        published: {
            text: "Published",
            className:
                "bg-green-100 text-green-700",
        },

        completed: {
            text: "Completed",
            className:
                "bg-blue-100 text-blue-700",
        },

        cancelled: {
            text: "Cancelled",
            className:
                "bg-red-100 text-red-700",
        },

    };


    const config =
        statusConfig[status] ||
        {
            text: status || "Unknown",
            className:
                "bg-gray-100 text-gray-700",
        };


    return `

        <span
            class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.className}"
        >
            ${escapeHTML(config.text)}
        </span>

    `;

};


// ========================================
// Render Banner
// ========================================

const renderBanner = (
    event
) => {

    const image =
        event.bannerImage?.url || "";


    if (image) {

        bannerContainer.innerHTML = `

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(event.title || "Event")}"
                class="h-full w-full object-cover"
            >

            <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
            ></div>

        `;

    } else {

        bannerContainer.innerHTML = `

            <div
                class="flex h-full items-center justify-center bg-primary/10"
            >

                <div class="text-center">

                    <div class="text-5xl">
                        🎟️
                    </div>

                    <p
                        class="mt-3 text-sm font-semibold text-primary"
                    >
                        No Event Banner
                    </p>

                </div>

            </div>

        `;

    }

};


// ========================================
// Render Gallery
// ========================================

const renderGallery = (
    images
) => {

    galleryGrid.innerHTML = "";


    if (
        !images ||
        images.length === 0
    ) {

        gallerySection.classList.add(
            "hidden"
        );

        return;

    }


    gallerySection.classList.remove(
        "hidden"
    );


    images.forEach(
        (image, index) => {

            if (!image?.url) {

                return;

            }


            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "aspect-square overflow-hidden rounded-2xl bg-gray-100";


            wrapper.innerHTML = `

                <img
                    src="${escapeHTML(image.url)}"
                    alt="Gallery Image ${index + 1}"
                    class="h-full w-full object-cover transition duration-300 hover:scale-105"
                    loading="lazy"
                >

            `;


            galleryGrid.appendChild(
                wrapper
            );

        }
    );

};


// ========================================
// Render Event Details
// ========================================

const renderEvent = (
    event
) => {

    // =====================================
    // Basic Information
    // =====================================

    eventTitle.textContent =
        event.title ||
        "Untitled Event";


    eventCategory.textContent =
        event.category?.name ||
        "Uncategorized";


    statusContainer.innerHTML =
        getStatusBadge(
            event.status
        );


    // =====================================
    // Date & Time
    // =====================================

    eventDate.textContent =
        formatDate(
            event.eventDate
        );


    eventTime.textContent =
        `${event.startTime || "N/A"} - ${event.endTime || "N/A"}`;


    // =====================================
    // Venue
    // =====================================

    const venue =
        event.venue || {};


    venueName.textContent =
        venue.venueName ||
        "Venue not provided";


    const addressParts = [

        venue.street,

        venue.city,

        venue.country,

    ].filter(Boolean);


    venueAddress.textContent =
        addressParts.length > 0
            ? addressParts.join(", ")
            : "Address not provided";


    // =====================================
    // Ticket
    // =====================================

    const type =
        event.eventType || "paid";


    if (type === "free") {

        ticketPrice.textContent =
            "Free";

        ticketType.textContent =
            "Free Event";

    } else {

        ticketPrice.textContent =
            `${Number(event.ticketPrice || 0).toLocaleString()} BDT`;

        ticketType.textContent =
            "Paid Event";

    }


    // =====================================
    // Description
    // =====================================

    eventDescription.textContent =
        event.description ||
        "No description available.";


    // =====================================
    // Organizer
    // =====================================

    organizerName.textContent =
        event.organizer?.name ||
        "Unknown Organizer";


    organizerEmail.textContent =
        event.organizer?.email ||
        "No email available";


    organizationName.textContent =
        event.organizer?.organizationName ||
        "Organization name not provided";


    // =====================================
    // Seats
    // =====================================

    const total =
        Number(event.totalSeats || 0);

    const available =
        Number(event.availableSeats || 0);


    totalSeats.textContent =
        total.toLocaleString();


    availableSeats.textContent =
        available.toLocaleString();


    maxTickets.textContent =
        Number(
            event.maxTicketsPerUser || 0
        ).toLocaleString();


    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (available / total) * 100
            );

    }


    percentage =
        Math.max(
            0,
            Math.min(
                100,
                percentage
            )
        );


    seatPercentage.textContent =
        `${percentage}%`;


    seatProgress.style.width =
        `${percentage}%`;


    // =====================================
    // Rating
    // =====================================

    averageRating.textContent =
        Number(
            event.averageRating || 0
        ).toFixed(1);


    totalReviews.textContent =
        Number(
            event.totalReviews || 0
        ).toLocaleString();


    // =====================================
    // Gallery
    // =====================================

    renderGallery(
        event.galleryImages
    );


    // =====================================
    // System Information
    // =====================================

    eventId.textContent =
        event._id ||
        "N/A";


    createdAt.textContent =
        formatDateTime(
            event.createdAt
        );


    updatedAt.textContent =
        formatDateTime(
            event.updatedAt
        );


    eventSlug.textContent =
        event.slug ||
        "N/A";


    // =====================================
    // Banner
    // =====================================

    renderBanner(
        event
    );

};


// ========================================
// Load Event
// ========================================

let currentEvent = null;


const loadEvent = async () => {

    if (!currentEventId) {

        return;

    }


    try {

        // Loading

        loadingState.classList.remove(
            "hidden"
        );

        content.classList.add(
            "hidden"
        );

        errorState.classList.add(
            "hidden"
        );


        // API

        const result =
            await apiRequest(
                `/events/${currentEventId}`
            );


        currentEvent =
            result.data;


        if (!currentEvent) {

            throw new Error(
                "Event data not found."
            );

        }


        // Render

        renderEvent(
            currentEvent
        );


        // Show content

        loadingState.classList.add(
            "hidden"
        );

        content.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Load event error:",
            error
        );


        loadingState.classList.add(
            "hidden"
        );

        content.classList.add(
            "hidden"
        );

        errorState.classList.remove(
            "hidden"
        );


        errorMessage.textContent =
            error.message ||
            "Failed to load event.";

    }

};


// ========================================
// Delete Event
// ========================================

const deleteEvent = async () => {

    if (!currentEventId) {

        alert(
            "Invalid event ID."
        );

        return;

    }


    const title =
        currentEvent?.title ||
        "this event";


    const confirmed =
        confirm(
            `Are you sure you want to delete "${title}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        deleteEventBtn.disabled =
            true;


        deleteEventBtn.textContent =
            "Deleting...";


        const result =
            await apiRequest(
                `/admin/events/${currentEventId}`,
                {
                    method: "DELETE",
                }
            );


        alert(
            result.message ||
            "Event deleted successfully."
        );


        window.location.href =
            "./events.html";


    } catch (error) {

        console.error(
            "Delete event error:",
            error
        );


        alert(
            error.message ||
            "Failed to delete event."
        );


        deleteEventBtn.disabled =
            false;


        deleteEventBtn.textContent =
            "Delete Event";

    }

};


// ========================================
// Retry
// ========================================

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        loadEvent
    );

}


// ========================================
// Delete Button
// ========================================

if (deleteEventBtn) {

    deleteEventBtn.addEventListener(
        "click",
        deleteEvent
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

if (currentEventId) {

    loadEvent();

}