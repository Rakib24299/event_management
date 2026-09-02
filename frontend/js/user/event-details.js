// ========================================
// EventEase - Event Details Page
// ========================================


// ========================================
// API Configuration
// ========================================

const API_URL =
    "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const eventLoading =
    document.getElementById("eventLoading");

const eventContent =
    document.getElementById("eventContent");

const eventError =
    document.getElementById("eventError");

const eventErrorMessage =
    document.getElementById("eventErrorMessage");

const eventImage =
    document.getElementById("eventImage");

const eventCategory =
    document.getElementById("eventCategory");

const eventTitle =
    document.getElementById("eventTitle");

const eventDate =
    document.getElementById("eventDate");

const eventLocation =
    document.getElementById("eventLocation");

const eventTime =
    document.getElementById("eventTime");

const eventEventType =
    document.getElementById("eventEventType");

const eventTicketPriceContainer =
    document.getElementById("eventTicketPriceContainer");

const eventTicketPrice =
    document.getElementById("eventTicketPrice");

const eventCategoryMeta =
    document.getElementById("eventCategoryMeta");

const eventDescription =
    document.getElementById("eventDescription");

const organizerInitial =
    document.getElementById("organizerInitial");

const organizerName =
    document.getElementById("organizerName");

const organizerOrganization =
    document.getElementById(
        "organizerOrganization"
    );

const eventPrice =
    document.getElementById("eventPrice");

const availableSeats =
    document.getElementById("availableSeats");

const seatProgress =
    document.getElementById("seatProgress");

const bookEventButton =
    document.getElementById("bookEventButton");


// ========================================
// Review Elements
// ========================================

const averageRating =
    document.getElementById("averageRating");

const averageStars =
    document.getElementById("averageStars");

const totalReviews =
    document.getElementById("totalReviews");

const reviewFormSection =
    document.getElementById("reviewFormSection");

const reviewLoginMessage =
    document.getElementById(
        "reviewLoginMessage"
    );

const ratingStars =
    document.querySelectorAll(
        ".rating-star"
    );

const ratingError =
    document.getElementById("ratingError");

const reviewComment =
    document.getElementById(
        "reviewComment"
    );

const commentError =
    document.getElementById(
        "commentError"
    );

const submitReviewButton =
    document.getElementById(
        "submitReviewButton"
    );

const reviewMessage =
    document.getElementById(
        "reviewMessage"
    );

const reviewsLoading =
    document.getElementById(
        "reviewsLoading"
    );

const reviewsEmpty =
    document.getElementById(
        "reviewsEmpty"
    );

const reviewsList =
    document.getElementById(
        "reviewsList"
    );


// ========================================
// Variables
// ========================================

let selectedRating = 0;

let reviews = [];

let editingReviewId = null;

let currentEvent = null;


// ========================================
// Get Event ID From URL
// ========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


/*
 * Main expected URL:
 *
 * event-details.html?id=EVENT_ID
 *
 * We also support:
 *
 * event-details.html?eventId=EVENT_ID
 */

const eventId =
    urlParams.get("id") ||
    urlParams.get("eventId");


// ========================================
// Debug Event ID
// ========================================

console.log(
    "Event Details Page URL:",
    window.location.href
);

console.log(
    "Event ID:",
    eventId
);


// ========================================
// Get Token
// ========================================

function getToken() {

    return localStorage.getItem(
        "token"
    );

}


// ========================================
// Show Error
// ========================================

function showError(message) {

    eventLoading.classList.add(
        "hidden"
    );

    eventContent.classList.add(
        "hidden"
    );

    eventErrorMessage.textContent =
        message;

    eventError.classList.remove(
        "hidden"
    );

    eventError.classList.add(
        "flex"
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

        return dateValue;

    }


    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


// ========================================
// Format Time
// ========================================

function formatTime(timeValue) {

    if (
        !timeValue
    ) {

        return null;

    }


    const timeString =
        String(timeValue).trim();


    const parts =
        timeString.split(":");


    const hours =
        Number(parts[0]);

    const minutes =
        Number(parts[1]);


    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {

        return timeString;

    }


    const period =
        hours >= 12
            ? "PM"
            : "AM";

    const displayHours =
        hours % 12 || 12;

    const displayMinutes =
        String(minutes).padStart(
            2,
            "0"
        );


    return `${displayHours}:${displayMinutes} ${period}`;

}


// ========================================
// Format Price
// ========================================

function formatPrice(price) {

    if (
        price === undefined ||
        price === null ||
        price === ""
    ) {

        return "Free";

    }


    const numericPrice =
        Number(price);


    if (
        Number.isNaN(numericPrice) ||
        numericPrice === 0
    ) {

        return "Free";

    }


    return `৳${numericPrice.toLocaleString()}`;

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
// Get Initial
// ========================================

function getInitial(name) {

    if (!name) {

        return "O";

    }


    return String(name)
        .trim()
        .charAt(0)
        .toUpperCase();

}


// ========================================
// Create Stars
// ========================================

function createStars(rating) {

    const roundedRating =
        Math.round(
            Number(rating) || 0
        );


    let stars = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        stars +=
            i <= roundedRating
                ? "★"
                : "☆";

    }


    return stars;

}


// ========================================
// Escape HTML
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


// ========================================
// Get Event ID
// ========================================

function getEventObjectId(event) {

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
// Extract Single Event
// ========================================

function extractSingleEvent(result) {

    if (!result) {
        return null;
    }


    /*
     * Expected backend:
     *
     * {
     *   success: true,
     *   data: event
     * }
     */


    if (
        result.data &&
        typeof result.data === "object" &&
        !Array.isArray(result.data)
    ) {

        /*
         * Case:
         * data = event
         */

        if (
            result.data._id ||
            result.data.id ||
            result.data.eventId
        ) {

            return result.data;

        }


        /*
         * Case:
         * data = { event: event }
         */

        if (
            result.data.event &&
            typeof result.data.event === "object"
        ) {

            return result.data.event;

        }


        /*
         * Case:
         * data = { data: event }
         */

        if (
            result.data.data &&
            typeof result.data.data === "object"
        ) {

            return result.data.data;

        }

    }


    /*
     * Case:
     *
     * {
     *   success: true,
     *   event: {...}
     * }
     */

    if (
        result.event &&
        typeof result.event === "object"
    ) {

        return result.event;

    }


    return null;

}


// ========================================
// Extract Events List
// ========================================

function extractEventsList(result) {

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
// Display Event
// ========================================

function displayEvent(event) {

    currentEvent =
        event;


    console.log(
        "Displaying Event:",
        event
    );


    // ====================================
    // Image
    // ====================================

    const image =
        event.bannerImage?.url ||
        event.bannerImage ||
        event.image ||
        event.imageUrl ||
        "";


    if (image) {

        eventImage.src =
            image;

    } else {

        eventImage.src =
            "https://via.placeholder.com/1200x700?text=EventEase+Event";

    }


    eventImage.alt =
        event.title ||
        event.name ||
        "Event";


    // ====================================
    // Category
    // ====================================

    if (
        typeof event.category === "string"
    ) {

        eventCategory.textContent =
            event.category;

    } else {

        eventCategory.textContent =
            event.category?.name ||
            event.category?.title ||
            "Event";

    }


    // ====================================
    // Title
    // ====================================

    eventTitle.textContent =
        event.title ||
        event.name ||
        event.eventName ||
        "Untitled Event";


    // ====================================
    // Date
    // ====================================

    eventDate.textContent =
        formatDate(
            event.eventDate ||
            event.date ||
            event.startDate ||
            event.startTime
        );


    // ====================================
    // Time
    // ====================================

    const timeValue =
        event.startTime ||
        event.time ||
        event.endTime ||
        null;


    if (timeValue) {

        eventTime.textContent =
            formatTime(timeValue);

    } else {

        eventTime.textContent =
            "Not available";

    }


    // ====================================
    // Category (Meta)
    // ====================================

    const categoryName =
        event.category?.name ||
        event.category?.title ||
        event.categoryName ||
        null;


    if (categoryName) {

        eventCategoryMeta.textContent =
            categoryName;

    } else {

        eventCategoryMeta.textContent =
            "Not available";

    }


    // ====================================
    // Event Type
    // ====================================

    const eventType =
        event.eventType ||
        "paid";


    eventEventType.textContent =
        eventType === "free"
            ? "Free"
            : "Paid";


    // ====================================
    // Ticket Price
    // ====================================

    const ticketPriceValue =
        event.ticketPrice ??
        event.price ??
        event.registrationFee ??
        0;


    const numericPrice =
        Number(ticketPriceValue);


    if (
        eventType === "free" ||
        numericPrice === 0
    ) {

        eventTicketPriceContainer.classList.add(
            "hidden"
        );

    } else {

        eventTicketPriceContainer.classList.remove(
            "hidden"
        );


        eventTicketPrice.textContent =
            `৳${numericPrice.toLocaleString()}`;

    }


    // ====================================
    // Location
    // ====================================

    const locationText =
        formatLocation(event.location) ||
        formatLocation(event.venue) ||
        formatLocation(event.address) ||
        "Location not available";


    eventLocation.textContent =
        locationText;


    // ====================================
    // Description
    // ====================================

    eventDescription.textContent =
        event.description ||
        "No description available for this event.";


    // ====================================
    // Organizer
    // ====================================

    const organizer =
        event.organizer || {};


    const firstName =
        organizer.firstName ||
        "";


    const lastName =
        organizer.lastName ||
        "";


    const fullName =
        organizer.name ||
        `${firstName} ${lastName}`.trim() ||
        organizer.fullName ||
        "Event Organizer";


    organizerInitial.textContent =
        getInitial(
            fullName
        );


    organizerName.textContent =
        fullName;


    organizerOrganization.textContent =
        organizer.organizationName ||
        organizer.organization ||
        "Event Organizer";


    // ====================================
    // Price
    // ====================================

    const price =
        event.ticketPrice ??
        event.price ??
        event.registrationFee ??
        0;


    eventPrice.textContent =
        formatPrice(price);


    // ====================================
    // Seats
    // ====================================

    const seats =
        Number(
            event.availableSeats ??
            event.remainingSeats ??
            0
        );


    const totalSeats =
        Number(
            event.totalSeats ??
            event.capacity ??
            event.maxSeats ??
            seats
        );


    availableSeats.textContent =
        `${seats} seats`;


    // ====================================
    // Seat Progress
    // ====================================

    let progress = 0;


    if (
        totalSeats > 0
    ) {

        progress =
            (
                seats /
                totalSeats
            ) * 100;

    }


    progress =
        Math.max(
            0,
            Math.min(
                100,
                progress
            )
        );


    seatProgress.style.width =
        `${progress}%`;


    // ====================================
    // Booking Button
    // ====================================

    if (
        seats <= 0
    ) {

        bookEventButton.disabled =
            true;


        bookEventButton.textContent =
            "Sold Out";


        bookEventButton.classList.remove(
            "bg-primary",
            "hover:bg-primaryDark"
        );


        bookEventButton.classList.add(
            "cursor-not-allowed",
            "bg-gray-400"
        );

    } else {

        bookEventButton.disabled =
            false;


        bookEventButton.textContent =
            "Book This Event";


        bookEventButton.classList.remove(
            "cursor-not-allowed",
            "bg-gray-400"
        );


        bookEventButton.classList.add(
            "bg-primary",
            "hover:bg-primaryDark"
        );

    }


    // ====================================
    // Show Content
    // ====================================

    eventLoading.classList.add(
        "hidden"
    );


    eventError.classList.add(
        "hidden"
    );


    eventError.classList.remove(
        "flex"
    );


    eventContent.classList.remove(
        "hidden"
    );

}


// ========================================
// Find Event From Events List
// ========================================

async function findEventFromList() {

    console.log(
        "Trying to find event from events list..."
    );


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


    console.log(
        "Events Fallback Response:",
        result
    );


    if (!response.ok) {

        throw new Error(
            result.message ||
            "Unable to load events."
        );

    }


    const events =
        extractEventsList(result);


    const foundEvent =
        events.find(
            event => {

                const id =
                    getEventObjectId(
                        event
                    );


                return (
                    id &&
                    String(id) ===
                    String(eventId)
                );

            }
        );


    if (!foundEvent) {

        return null;

    }


    return foundEvent;

}


// ========================================
// Load Event
// ========================================

async function loadEvent() {

    // ====================================
    // Check Event ID
    // ====================================

    if (!eventId) {

        showError(
            "Event ID is missing. Please select an event from the Events page."
        );

        return;

    }


    console.log(
        "Loading Event ID:",
        eventId
    );


    try {

        // ==================================
        // First Try:
        // GET /events/:id
        // ==================================

        const response =
            await fetch(
                `${API_URL}/events/${encodeURIComponent(eventId)}`,
                {
                    method: "GET",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        let result = null;


        try {

            result =
                await response.json();

        } catch (jsonError) {

            console.error(
                "Invalid JSON response:",
                jsonError
            );

        }


        console.log(
            "Event Details Response:",
            result
        );


        // ==================================
        // Direct API Success
        // ==================================

        if (
            response.ok &&
            result &&
            result.success
        ) {

            const event =
                extractSingleEvent(
                    result
                );


            if (event) {

                console.log(
                    "Event loaded directly:",
                    getEventObjectId(event)
                );


                displayEvent(
                    event
                );


                await loadReviews();


                return;

            }

        }


        // ==================================
        // Fallback
        // ==================================

        console.warn(
            "Direct event API failed. Trying events list fallback..."
        );


        const fallbackEvent =
            await findEventFromList();


        if (!fallbackEvent) {

            throw new Error(
                result?.message ||
                "Event not found."
            );

        }


        console.log(
            "Event loaded using fallback:",
            fallbackEvent
        );


        displayEvent(
            fallbackEvent
        );


        await loadReviews();


    } catch (error) {

        console.error(
            "Event Details Error:",
            error
        );


        showError(
            error.message ||
            "Unable to load event details. Please try again."
        );

    }

}


// ========================================
// Load Reviews
// ========================================

async function loadReviews() {

    if (!eventId) {

        return;

    }


    reviewsLoading.classList.remove(
        "hidden"
    );


    reviewsEmpty.classList.add(
        "hidden"
    );


    reviewsList.innerHTML = "";


    try {

        const response =
            await fetch(
                `${API_URL}/reviews/event/${encodeURIComponent(eventId)}`,
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


        console.log(
            "Reviews Response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load reviews."
            );

        }


        if (
            Array.isArray(result.data)
        ) {

            reviews =
                result.data;

        } else if (
            Array.isArray(
                result.data?.reviews
            )
        ) {

            reviews =
                result.data.reviews;

        } else {

            reviews = [];

        }


        displayReviewSummary();

        displayReviews();

        setupReviewForm();


    } catch (error) {

        console.error(
            "Review Loading Error:",
            error
        );


        reviewsLoading.textContent =
            "Unable to load reviews.";

    } finally {

        reviewsLoading.classList.add(
            "hidden"
        );

    }

}


// ========================================
// Display Review Summary
// ========================================

function displayReviewSummary() {

    const count =
        reviews.length;


    let totalRating = 0;


    reviews.forEach(
        review => {

            totalRating +=
                Number(
                    review.rating || 0
                );

        }
    );


    const average =
        count > 0
            ? totalRating / count
            : 0;


    averageRating.textContent =
        average.toFixed(1);


    averageStars.textContent =
        createStars(
            average
        );


    totalReviews.textContent =
        `${count} ${
            count === 1
                ? "Review"
                : "Reviews"
        }`;

}


// ========================================
// Display Reviews
// ========================================

function displayReviews() {

    reviewsList.innerHTML = "";


    if (
        reviews.length === 0
    ) {

        reviewsEmpty.classList.remove(
            "hidden"
        );

        return;

    }


    reviewsEmpty.classList.add(
        "hidden"
    );


    reviews.forEach(
        review => {

            const reviewElement =
                createReviewElement(
                    review
                );


            reviewsList.appendChild(
                reviewElement
            );

        }
    );

}


// ========================================
// Create Review Element
// ========================================

function createReviewElement(
    review
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "rounded-2xl border border-gray-100 bg-white p-5";


    const user =
        review.user || {};


    const userName =
        user.name ||
        user.fullName ||
        "Anonymous User";


    const profileImage =
        user.profileImage?.url ||
        user.profileImage ||
        "";


    const initial =
        getInitial(
            userName
        );


    const date =
        review.createdAt
            ? new Date(
                review.createdAt
            ).toLocaleDateString(
                "en-US",
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                }
            )
            : "";


    const rating =
        Number(
            review.rating || 0
        );


    const comment =
        review.comment ||
        review.review ||
        "";


    const token =
        getToken();


    const currentUserId =
        getCurrentUserId();


    const reviewUserId =
        user._id ||
        user.id;


    const isOwner =
        token &&
        currentUserId &&
        reviewUserId &&
        currentUserId ===
            String(reviewUserId);


    let avatarHTML;


    if (profileImage) {

        avatarHTML = `

            <img
                src="${escapeHTML(profileImage)}"
                alt="${escapeHTML(userName)}"
                class="h-11 w-11 rounded-full object-cover"
            >

        `;

    } else {

        avatarHTML = `

            <div
                class="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-primary
                    text-sm
                    font-bold
                    text-white
                "
            >
                ${escapeHTML(initial)}
            </div>

        `;

    }


    wrapper.innerHTML = `

        <div
            class="
                flex
                items-start
                justify-between
                gap-4
            "
        >

            <div
                class="
                    flex
                    items-center
                    gap-3
                "
            >

                ${avatarHTML}

                <div>

                    <p
                        class="
                            font-bold
                            text-gray-900
                        "
                    >
                        ${escapeHTML(userName)}
                    </p>

                    <p
                        class="
                            mt-0.5
                            text-xs
                            text-gray-400
                        "
                    >
                        ${date}
                    </p>

                </div>

            </div>


            <div class="text-right">

                <div
                    class="
                        text-lg
                        tracking-wide
                        text-primary
                    "
                >
                    ${createStars(rating)}
                </div>

                <span
                    class="
                        text-xs
                        font-semibold
                        text-gray-500
                    "
                >
                    ${rating}/5
                </span>

            </div>

        </div>


        <p
            class="
                mt-4
                whitespace-pre-line
                text-sm
                leading-6
                text-gray-600
            "
        >
            ${escapeHTML(comment)}
        </p>


        ${
            isOwner
                ? `

                    <div
                        class="
                            mt-4
                            flex
                            gap-3
                        "
                    >

                        <button
                            type="button"
                            class="
                                edit-review-button
                                rounded-xl
                                border
                                border-primary
                                px-4
                                py-2
                                text-xs
                                font-semibold
                                text-primary
                                transition
                                hover:bg-primaryLight
                            "
                            data-review-id="${review._id}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="
                                delete-review-button
                                rounded-xl
                                border
                                border-red-200
                                px-4
                                py-2
                                text-xs
                                font-semibold
                                text-red-600
                                transition
                                hover:bg-red-50
                            "
                            data-review-id="${review._id}"
                        >
                            Delete
                        </button>

                    </div>

                `
                : ""
        }

    `;


    return wrapper;

}


// ========================================
// Get Current User ID
// ========================================

function getCurrentUserId() {

    try {

        const storedUser =
            localStorage.getItem(
                "user"
            );


        if (!storedUser) {

            return null;

        }


        const user =
            JSON.parse(
                storedUser
            );


        return String(
            user._id ||
            user.id ||
            ""
        );

    } catch (error) {

        console.error(
            "User Parse Error:",
            error
        );


        return null;

    }

}


// ========================================
// Setup Review Form
// ========================================

function setupReviewForm() {

    const token =
        getToken();


    if (!token) {

        reviewFormSection.classList.add(
            "hidden"
        );


        reviewLoginMessage.classList.remove(
            "hidden"
        );


        return;

    }


    reviewLoginMessage.classList.add(
        "hidden"
    );


    reviewFormSection.classList.remove(
        "hidden"
    );

}


// ========================================
// Rating Selection
// ========================================

ratingStars.forEach(
    star => {

        star.addEventListener(
            "click",
            () => {

                selectedRating =
                    Number(
                        star.dataset.rating
                    );


                updateRatingStars();


                ratingError.classList.add(
                    "hidden"
                );

            }
        );

    }
);


// ========================================
// Update Rating Stars
// ========================================

function updateRatingStars() {

    ratingStars.forEach(
        star => {

            const value =
                Number(
                    star.dataset.rating
                );


            if (
                value <=
                selectedRating
            ) {

                star.classList.remove(
                    "text-gray-300"
                );


                star.classList.add(
                    "text-primary"
                );

            } else {

                star.classList.remove(
                    "text-primary"
                );


                star.classList.add(
                    "text-gray-300"
                );

            }

        }
    );

}


// ========================================
// Review Message
// ========================================

function showReviewMessage(
    message,
    type = "success"
) {

    reviewMessage.textContent =
        message;


    reviewMessage.className =
        "mt-4 rounded-xl px-4 py-3 text-sm";


    if (
        type === "success"
    ) {

        reviewMessage.classList.add(
            "bg-green-50",
            "text-green-700"
        );

    } else {

        reviewMessage.classList.add(
            "bg-red-50",
            "text-red-600"
        );

    }


    reviewMessage.classList.remove(
        "hidden"
    );

}


// ========================================
// Clear Review Message
// ========================================

function clearReviewMessage() {

    reviewMessage.textContent = "";

    reviewMessage.classList.add(
        "hidden"
    );

}


// ========================================
// Submit Review
// ========================================

if (submitReviewButton) {

    submitReviewButton.addEventListener(
        "click",
        async () => {

            clearReviewMessage();


            ratingError.classList.add(
                "hidden"
            );


            commentError.classList.add(
                "hidden"
            );


            const token =
                getToken();


            if (!token) {

                showReviewMessage(
                    "Please login to write a review.",
                    "error"
                );


                return;

            }


            if (
                selectedRating < 1 ||
                selectedRating > 5
            ) {

                ratingError.textContent =
                    "Please select a rating from 1 to 5.";


                ratingError.classList.remove(
                    "hidden"
                );


                return;

            }


            const comment =
                reviewComment.value.trim();


            if (
                comment.length < 5
            ) {

                commentError.textContent =
                    "Comment must be at least 5 characters.";


                commentError.classList.remove(
                    "hidden"
                );


                return;

            }


            if (
                comment.length > 1000
            ) {

                commentError.textContent =
                    "Comment cannot exceed 1000 characters.";


                commentError.classList.remove(
                    "hidden"
                );


                return;

            }


            submitReviewButton.disabled =
                true;


            submitReviewButton.textContent =
                editingReviewId
                    ? "Updating..."
                    : "Submitting...";


            try {

                let response;


                if (
                    editingReviewId
                ) {

                    response =
                        await fetch(
                            `${API_URL}/reviews/${editingReviewId}`,
                            {
                                method: "PATCH",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`
                                },

                                body:
                                    JSON.stringify({
                                        rating:
                                            selectedRating,

                                        comment:
                                            comment
                                    })
                            }
                        );

                } else {

                    response =
                        await fetch(
                            `${API_URL}/reviews`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`
                                },

                                body:
                                    JSON.stringify({
                                        event:
                                            eventId,

                                        rating:
                                            selectedRating,

                                        comment:
                                            comment
                                    })
                            }
                        );

                }


                const result =
                    await response.json();


                console.log(
                    "Review Response:",
                    result
                );


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Unable to save review."
                    );

                }


                showReviewMessage(
                    result.message ||
                    (
                        editingReviewId
                            ? "Review updated successfully."
                            : "Review created successfully."
                    )
                );


                editingReviewId =
                    null;


                selectedRating =
                    0;


                reviewComment.value =
                    "";


                updateRatingStars();


                submitReviewButton.textContent =
                    "Submit Review";


                await loadReviews();


            } catch (error) {

                console.error(
                    "Review Submit Error:",
                    error
                );


                showReviewMessage(
                    error.message ||
                    "Something went wrong while saving your review.",
                    "error"
                );

            } finally {

                submitReviewButton.disabled =
                    false;


                submitReviewButton.textContent =
                    editingReviewId
                        ? "Update Review"
                        : "Submit Review";

            }

        }
    );

}


// ========================================
// Edit / Delete Review
// ========================================

if (reviewsList) {

    reviewsList.addEventListener(
        "click",
        async event => {

            const editButton =
                event.target.closest(
                    ".edit-review-button"
                );


            const deleteButton =
                event.target.closest(
                    ".delete-review-button"
                );


            if (editButton) {

                startEditReview(
                    editButton.dataset.reviewId
                );

            }


            if (deleteButton) {

                await deleteReview(
                    deleteButton.dataset.reviewId
                );

            }

        }
    );

}


// ========================================
// Start Edit Review
// ========================================

function startEditReview(
    reviewId
) {

    const review =
        reviews.find(
            item =>
                String(item._id) ===
                String(reviewId)
        );


    if (!review) {

        return;

    }


    editingReviewId =
        reviewId;


    selectedRating =
        Number(
            review.rating || 0
        );


    reviewComment.value =
        review.comment ||
        review.review ||
        "";


    updateRatingStars();


    submitReviewButton.textContent =
        "Update Review";


    clearReviewMessage();


    reviewFormSection.classList.remove(
        "hidden"
    );


    reviewFormSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ========================================
// Delete Review
// ========================================

async function deleteReview(
    reviewId
) {

    const token =
        getToken();


    if (!token) {

        return;

    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete this review?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/reviews/${reviewId}`,
                {
                    method: "DELETE",

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
            "Delete Review Response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to delete review."
            );

        }


        showReviewMessage(
            result.message ||
            "Review deleted successfully."
        );


        await loadReviews();


    } catch (error) {

        console.error(
            "Delete Review Error:",
            error
        );


        showReviewMessage(
            error.message ||
            "Unable to delete review.",
            "error"
        );

    }

}


// ========================================
// Book Event
// ========================================

// ========================================
// Book Event
// ========================================

if (bookEventButton) {

    bookEventButton.addEventListener(
        "click",
        () => {

            // ================================
            // Event ID Check
            // ================================

            if (!eventId) {

                alert(
                    "Event ID is missing."
                );

                return;

            }


            // ================================
            // Authentication Check
            // ================================

            const token =
                getToken();


            if (!token) {

                window.location.href =
                    "./user-login.html";

                return;

            }


            // ================================
            // Go To Payment Page
            // ================================

            window.location.href =
                `./payment.html?id=${encodeURIComponent(
                    eventId
                )}`;

        }
    );

}

// ========================================
// Start
// ========================================

loadEvent();