// ========================================
// EventEase Organizer - My Events
// ========================================

const API_URL = "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

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


// ========================================
// Authentication
// ========================================

const token =
    localStorage.getItem("token");


// ========================================
// Redirect If Not Logged In
// ========================================

if (!token) {

    window.location.href =
        "../auth/login.html?redirect=../organizer/my-events.html";

}


// ========================================
// Helper: Escape HTML
// ========================================

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


// ========================================
// Format Date
// ========================================

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


// ========================================
// Format Price
// ========================================

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


// ========================================
// Get Event Image
// ========================================

function getEventImage(event) {

    return (
        event.bannerImage?.url ||
        event.image ||
        "https://via.placeholder.com/800x500?text=EventEase"
    );
}


// ========================================
// Status Badge
// ========================================

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


// ========================================
// Display Events
// ========================================

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
            event.location ||
            event.venue ||
            "Location not available";


        const price =
            event.ticketPrice ??
            event.price ??
            0;


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

        if (totalSeats > 0) {

            soldSeats =
                Math.max(
                    0,
                    totalSeats - availableSeats
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
                        📅
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
                        📍
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
                        grid-cols-3
                        gap-2
                    "
                >

                    <!-- Price -->

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


// ========================================
// Show Error
// ========================================

function showEventsError(message) {

    eventsLoading.classList.add("hidden");

    eventsContent.classList.add("hidden");

    eventsEmpty.classList.add("hidden");

    eventsErrorMessage.textContent =
        message ||
        "Unable to load your events.";

    eventsError.classList.remove("hidden");
}


// ========================================
// Load My Events
// ========================================

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


        displayEvents(events);


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


// ========================================
// Retry
// ========================================

if (retryEventsButton) {

    retryEventsButton.addEventListener(
        "click",
        loadMyEvents
    );

}


// ========================================
// Start
// ========================================

loadMyEvents();