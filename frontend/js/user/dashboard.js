// EventEase User Dashboard

const API_URL = "http://localhost:5000/api/v1";

// Elements

const welcomeName =
    document.getElementById("welcomeName");

const dashboardProfileImage =
    document.getElementById("dashboardProfileImage");

const dashboardProfileInitial =
    document.getElementById("dashboardProfileInitial");

const recentBookingsLoading =
    document.getElementById("recentBookingsLoading");

const recentBookingsEmpty =
    document.getElementById("recentBookingsEmpty");

const recentBookingsList =
    document.getElementById("recentBookingsList");

const latestEventsLoading =
    document.getElementById("latestEventsLoading");

const latestEventsEmpty =
    document.getElementById("latestEventsEmpty");

const latestEventsList =
    document.getElementById("latestEventsList");

// State

const userBookedEventIds = new Set();

// Token

function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken") ||
        sessionStorage.getItem("authToken")
    );

}

const token =
    getToken();

// Check Authentication

if (!token) {

    window.location.replace(
        "./user-login.html"
    );

}

window.addEventListener(
    "pageshow",
    () => {

        const currentToken =
            getToken();

        if (!currentToken) {

            window.location.replace(
                "./user-login.html"
            );

        }

    }
);

// Escape HTML

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// Get Initial

function getInitial(name) {

    if (!name) {
        return "U";
    }

    return name
        .trim()
        .charAt(0)
        .toUpperCase();

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
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}

// Format Price

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
            value.venueName ||
            value.name ||
            value.address ||
            value.venue ||
            value.city ||
            [value.street, value.city, value.country].filter(Boolean).join(", ") ||
            null
        );
    }

    return null;

}

// Format Category

function formatCategory(value) {

    if (!value) {
        return "Event";
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : "Event";
    }

    if (typeof value === "object") {
        return (
            value.name ||
            value.title ||
            value.slug ||
            "Event"
        );
    }

    return "Event";

}

// Get Event From Booking

function getBookingEvent(booking) {

    return (
        booking.event ||
        booking.eventId ||
        {}
    );

}

// Display User

function displayUser(user) {

    if (!user) {
        return;
    }

    const name =
        user.name ||
        "User";

    if (welcomeName) {
        welcomeName.textContent =
            name;
    }

    if (dashboardProfileInitial) {
        dashboardProfileInitial.textContent =
            getInitial(name);
    }

    const profileUrl =
        user.profileImage?.url ||
        "";

    if (profileUrl && dashboardProfileImage) {

        dashboardProfileImage.src =
            profileUrl;

        dashboardProfileImage.classList.remove(
            "hidden"
        );

        if (dashboardProfileInitial) {
            dashboardProfileInitial.classList.add(
                "hidden"
            );
        }

    }

}

// Create Booking Card

function createBookingCard(booking) {

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

    const location =
        formatLocation(
            event.location ||
            event.venue ||
            booking.location
        ) || "Location not available";

    const quantity =
        Number(
            booking.numberOfTickets ||
            booking.ticketQuantity ||
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
        String(
            booking.bookingStatus ||
            booking.status ||
            "pending"
        ).toLowerCase();

    const bookingId =
        booking._id ||
        booking.id ||
        "";

    const statusClass =
        bookingStatus === "confirmed"
            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            : "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

    return `
        <div class="overflow-hidden rounded-3xl bg-white shadow-soft transition hover:-translate-y-0.5 border border-gray-100">
            <div class="flex flex-col sm:flex-row">
                <!-- Event Image -->
                <div class="h-44 sm:h-auto sm:w-44 shrink-0 overflow-hidden relative">
                    <img
                        src="${escapeHTML(eventImage)}"
                        alt="${escapeHTML(eventTitle)}"
                        class="h-full w-full object-cover"
                        onerror="this.src='https://via.placeholder.com/600x350?text=EventEase'"
                    >
                    <span class="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusClass}">
                        ${escapeHTML(bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1))}
                    </span>
                </div>

                <!-- Booking Information -->
                <div class="flex flex-1 flex-col justify-between p-5">
                    <div>
                        <h3 class="text-base font-bold text-gray-900 line-clamp-1">
                            ${escapeHTML(eventTitle)}
                        </h3>

                        <div class="mt-3 space-y-1.5 text-xs text-gray-500">
                            <p class="flex items-center gap-1.5">
                                <span class="text-primary shrink-0">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </span>
                                <span>${formatDate(eventDate)}</span>
                            </p>

                            <p class="flex items-center gap-1.5">
                                <span class="text-primary shrink-0">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </span>
                                <span class="truncate">${escapeHTML(location)}</span>
                            </p>

                            <p class="flex items-center gap-1.5">
                                <span class="text-primary shrink-0">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                </span>
                                <span>${quantity} Ticket${quantity > 1 ? "s" : ""} • ${formatPrice(price)}</span>
                            </p>
                        </div>
                    </div>

                    <div class="mt-4 flex items-center justify-end border-t border-gray-100 pt-3">
                        ${
                            bookingId
                                ? `
                                    <a
                                        href="./booking-details.html?id=${bookingId}"
                                        class="inline-flex items-center gap-1 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primaryDark active:scale-95"
                                    >
                                        <span>Details</span>
                                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    </a>
                                  `
                                : ""
                        }
                    </div>
                </div>
            </div>
        </div>
    `;

}

// Display Recent Bookings

function displayRecentBookings(bookings) {

    if (recentBookingsLoading) {
        recentBookingsLoading.classList.add(
            "hidden"
        );
    }

    if (
        !Array.isArray(bookings) ||
        bookings.length === 0
    ) {

        if (recentBookingsList) {
            recentBookingsList.classList.add(
                "hidden"
            );
        }

        if (recentBookingsEmpty) {
            recentBookingsEmpty.classList.remove(
                "hidden"
            );
        }

        return;

    }

    if (recentBookingsEmpty) {
        recentBookingsEmpty.classList.add(
            "hidden"
        );
    }

    const recentBookings = bookings.slice(0, 3);

    if (recentBookingsList) {
        recentBookingsList.innerHTML =
            recentBookings
                .map(createBookingCard)
                .join("");

        recentBookingsList.classList.remove(
            "hidden"
        );
    }

}

// Create Latest Event Card

function createLatestEventCard(event) {

    const eventId =
        event._id ||
        event.id ||
        "";

    const eventTitle =
        event.title ||
        "Event";

    const eventImage =
        event.bannerImage?.url ||
        event.image ||
        "https://via.placeholder.com/600x350?text=EventEase";

    const eventDate =
        event.eventDate ||
        event.date;

    const location =
        formatLocation(
            event.location ||
            event.venue
        ) || "Location not available";

    const category =
        formatCategory(event.category);

    const price =
        event.ticketPrice ??
        event.price ??
        0;

    const isFree =
        event.eventType === "free" ||
        Number(price) === 0;

    return `
        <div class="overflow-hidden rounded-3xl bg-white shadow-soft transition hover:-translate-y-0.5 border border-gray-100">
            <div class="flex flex-col sm:flex-row">
                <!-- Event Image -->
                <div class="h-44 sm:h-auto sm:w-44 shrink-0 overflow-hidden relative">
                    <img
                        src="${escapeHTML(eventImage)}"
                        alt="${escapeHTML(eventTitle)}"
                        class="h-full w-full object-cover"
                        onerror="this.src='https://via.placeholder.com/600x350?text=EventEase'"
                    >
                    <span class="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                        ${escapeHTML(category)}
                    </span>
                </div>

                <!-- Event Information -->
                <div class="flex flex-1 flex-col justify-between p-5">
                    <div>
                        <div class="flex items-start justify-between gap-2">
                            <h3 class="text-base font-bold text-gray-900 line-clamp-1">
                                ${escapeHTML(eventTitle)}
                            </h3>
                            <span class="shrink-0 rounded-full ${isFree ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-primary/10 text-primary ring-1 ring-primary/20'} px-2.5 py-0.5 text-xs font-bold">
                                ${isFree ? 'Free' : formatPrice(price)}
                            </span>
                        </div>

                        <div class="mt-3 space-y-1.5 text-xs text-gray-500">
                            <p class="flex items-center gap-1.5">
                                <span class="text-primary shrink-0">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </span>
                                <span>${formatDate(eventDate)}</span>
                            </p>

                            <p class="flex items-center gap-1.5">
                                <span class="text-primary shrink-0">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </span>
                                <span class="truncate">${escapeHTML(location)}</span>
                            </p>
                        </div>
                    </div>

                    <div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                        <span class="text-[11px] font-medium text-gray-400">
                            ${event.availableSeats !== undefined ? `${event.availableSeats} seats left` : 'Upcoming'}
                        </span>

                        <a
                            href="./event-details.html?id=${eventId}"
                            class="inline-flex items-center gap-1 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primaryDark active:scale-95"
                        >
                            <span>View Event</span>
                            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;

}

// Display Latest Events

function displayLatestEvents(events) {

    if (latestEventsLoading) {
        latestEventsLoading.classList.add(
            "hidden"
        );
    }

    if (
        !Array.isArray(events) ||
        events.length === 0
    ) {

        if (latestEventsList) {
            latestEventsList.classList.add(
                "hidden"
            );
        }

        if (latestEventsEmpty) {
            latestEventsEmpty.classList.remove(
                "hidden"
            );
        }

        return;

    }

    if (latestEventsEmpty) {
        latestEventsEmpty.classList.add(
            "hidden"
        );
    }

    const topEvents =
        events.slice(0, 3);

    if (latestEventsList) {
        latestEventsList.innerHTML =
            topEvents
                .map(createLatestEventCard)
                .join("");

        latestEventsList.classList.remove(
            "hidden"
        );
    }

}

// Fetch Profile

async function loadProfile() {

    const response =
        await fetch(
            `${API_URL}/users/me`,
            {
                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );

    const result =
        await response.json();

    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            "Failed to load profile."
        );

    }

    const user =
        result.data;

    displayUser(user);

}

// Fetch Bookings

async function loadBookings() {

    const response =
        await fetch(
            `${API_URL}/bookings/my`,
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
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            "Failed to load bookings."
        );

    }

    let bookings =
        result.data;

    if (
        result.data &&
        Array.isArray(result.data.bookings)
    ) {

        bookings =
            result.data.bookings;

    }

    if (
        result.data &&
        Array.isArray(result.data.items)
    ) {

        bookings =
            result.data.items;

    }

    if (!Array.isArray(bookings)) {

        bookings = [];

    }

    // Collect all booked event IDs to exclude them from New Events
    userBookedEventIds.clear();

    bookings.forEach(
        (b) => {

            const status =
                String(
                    b.bookingStatus ||
                    b.status ||
                    ""
                ).toLowerCase();

            // Exclude non-cancelled active bookings
            if (
                status !== "cancelled" &&
                status !== "rejected"
            ) {

                const ev =
                    b.event ||
                    b.eventId;

                const evId =
                    typeof ev === "object"
                        ? (ev?._id || ev?.id)
                        : ev;

                if (evId) {
                    userBookedEventIds.add(
                        String(evId)
                    );
                }

            }

        }
    );

    /*
     * Latest bookings first
     */
    bookings.sort(
        (a, b) => {

            const dateA =  new Date(  a.createdAt || 0 );

            const dateB = new Date(  b.createdAt || 0 );

            return dateB - dateA;

        }
    );

    displayRecentBookings(
        bookings
    );

}

// Fetch Latest Events

async function loadLatestEvents() {

    try {

        const response =
            await fetch(
                `${API_URL}/events`,
                {
                    method: "GET",

                    headers: {

                        "Content-Type":
                            "application/json"

                    }

                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load events."
            );

        }

        let events =
            result.data || [];

        if (
            result.data &&
            Array.isArray(result.data.events)
        ) {

            events =
                result.data.events;

        }

        if (!Array.isArray(events)) {

            events = [];

        }

        // Filter: Exclude events the user already booked, inactive events, and past expired events
        events =
            events.filter(
                (e) => {

                    const eventId =
                        String(
                            e._id ||
                            e.id ||
                            ""
                        );

                    // Skip already booked events
                    if (userBookedEventIds.has(eventId)) {
                        return false;
                    }

                    // Only published events
                    const isPublished =
                        e.status === "published" ||
                        !e.status;

                    if (!isPublished) {
                        return false;
                    }

                    // Skip expired events
                    const eventDate =
                        e.eventDate ||
                        e.date ||
                        e.startDate;

                    if (eventDate) {
                        const d = new Date(eventDate);
                        if (!Number.isNaN(d.getTime()) && d < new Date()) {
                            return false;
                        }
                    }

                    return true;

                }
            );

        // Sort by newest created first
        events.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.createdAt || 0
                    );

                const dateB =
                    new Date(
                        b.createdAt || 0
                    );

                return dateB - dateA;

            }
        );

        displayLatestEvents(
            events
        );

    } catch (error) {

        console.error(
            "Dashboard Latest Events Error:",
            error
        );

        if (latestEventsLoading) {
            latestEventsLoading.classList.add(
                "hidden"
            );
        }

        if (latestEventsEmpty) {
            latestEventsEmpty.classList.remove(
                "hidden"
            );
        }

    }

}

// Update Notification Badge

async function updateNotificationBadge() {

    const badge =
        document.getElementById(
            "notificationBadge"
        );

    if (!badge) {
        return;
    }

    const token =
        getToken();

    if (!token) {

        badge.classList.add(
            "hidden"
        );

        badge.textContent = "0";

        return;

    }

    try {

        const response =
            await fetch(
                `${API_URL}/notifications/unread-count`,
                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`,

                    },

                }
            );

        const result =
            await response.json();

        if (
            response.ok &&
            result.success &&
            result.data
        ) {

            const count =
                result.data.unreadCount ||
                0;

            badge.textContent = count;

            if (count > 0) {

                badge.classList.remove(
                    "hidden"
                );

            } else {

                badge.classList.add(
                    "hidden"
                );

            }

        } else {

            badge.classList.add(
                "hidden"
            );

            badge.textContent = "0";

        }

    } catch (error) {

        console.error(
            "Notification badge error:",
            error
        );

    }

}

// Load Dashboard

async function loadDashboard() {

    try {

        // 1. Load profile and bookings first
        await Promise.allSettled([
            loadProfile(),
            loadBookings()
        ]);

        // 2. Load latest events (excluding the booked ones)
        await loadLatestEvents();

    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

        if (recentBookingsLoading) {
            recentBookingsLoading.classList.add(
                "hidden"
            );
        }

        if (recentBookingsEmpty) {
            recentBookingsEmpty.classList.remove(
                "hidden"
            );
        }

        if (latestEventsLoading) {
            latestEventsLoading.classList.add(
                "hidden"
            );
        }

        if (latestEventsEmpty) {
            latestEventsEmpty.classList.remove(
                "hidden"
            );
        }

    }

}

// Start Dashboard

loadDashboard();

updateNotificationBadge();