// ========================================
// EventEase Review
// ========================================

const API_URL = "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const loadingState =
    document.getElementById("loadingState");

const reviewContent =
    document.getElementById("reviewContent");

const reviewError =
    document.getElementById("reviewError");

const reviewSuccess =
    document.getElementById("reviewSuccess");

const reviewEventImage =
    document.getElementById("reviewEventImage");

const reviewEventCategory =
    document.getElementById("reviewEventCategory");

const reviewEventTitle =
    document.getElementById("reviewEventTitle");

const reviewEventDate =
    document.getElementById("reviewEventDate");

const reviewForm =
    document.getElementById("reviewForm");

const reviewComment =
    document.getElementById("reviewComment");

const characterCount =
    document.getElementById("characterCount");

const ratingText =
    document.getElementById("ratingText");

const ratingError =
    document.getElementById("ratingError");

const commentError =
    document.getElementById("commentError");

const submitReviewButton =
    document.getElementById("submitReviewButton");

const ratingStars =
    document.querySelectorAll(".rating-star");


// ========================================
// Variables
// ========================================

const token =
    localStorage.getItem("token");

let selectedRating = 0;

let eventId = null;

let bookingId = null;

let eventData = null;


// ========================================
// Rating Labels
// ========================================

const ratingLabels = {
    1: "Very Bad",
    2: "Bad",
    3: "Average",
    4: "Good",
    5: "Excellent"
};


// ========================================
// Show Error
// ========================================

function showError(message) {

    reviewSuccess.classList.add("hidden");

    reviewError.textContent = message;

    reviewError.classList.remove("hidden");
}


// ========================================
// Hide Error
// ========================================

function hideError() {

    reviewError.textContent = "";

    reviewError.classList.add("hidden");

    ratingError.textContent = "";

    ratingError.classList.add("hidden");

    commentError.textContent = "";

    commentError.classList.add("hidden");
}


// ========================================
// Show Success
// ========================================

function showSuccess(message) {

    reviewError.classList.add("hidden");

    reviewSuccess.textContent = message;

    reviewSuccess.classList.remove("hidden");
}


// ========================================
// Format Date
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "--";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
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
// Get Booking Information
// ========================================

function loadBookingInformation() {

    /*
     * Priority 1:
     * Check URL query parameters:
     * review.html?eventId=EVENT_ID&bookingId=BOOKING_ID
     */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const urlEventId =
        params.get("eventId");

    const urlBookingId =
        params.get("bookingId");

    if (urlEventId) {

        eventId =
            urlEventId;

        bookingId =
            urlBookingId ||
            null;

        return true;
    }


    /*
     * Priority 2:
     * Check booking information from sessionStorage (completedPayment).
     */

    const completedBooking =
        sessionStorage.getItem(
            "completedPayment"
        );

    if (completedBooking) {

        try {

            const parsedData =
                JSON.parse(completedBooking);

            const booking =
                parsedData?.booking;

            if (booking) {

                bookingId =
                    booking._id ||
                    booking.id;

                eventId =
                    typeof booking.event === "object"
                        ? booking.event?._id
                        : booking.event;

                if (eventId) {
                    return true;
                }
            }

        } catch (error) {

            console.error(
                "Completed Payment Parse Error:",
                error
            );
        }
    }


    /*
     * Priority 3:
     * Check booking information saved by pendingBooking.
     */

    const pendingBooking =
        sessionStorage.getItem(
            "pendingBooking"
        );

    if (pendingBooking) {

        try {

            const parsedBooking =
                JSON.parse(pendingBooking);

            const booking =
                parsedBooking?.booking;

            if (booking) {

                bookingId =
                    booking._id ||
                    booking.id;

                eventId =
                    typeof booking.event === "object"
                        ? booking.event?._id
                        : booking.event;

                if (eventId) {
                    return true;
                }
            }

        } catch (error) {

            console.error(
                "Pending Booking Parse Error:",
                error
            );
        }
    }


    if (!eventId) {

        showError(
            "Event information was not found. Please open the review page from your booking."
        );

        return false;
    }


    return true;
}


// ========================================
// Load Event
// ========================================

async function loadEventInformation() {

    if (!eventId) {

        throw new Error(
            "Event ID was not found."
        );
    }


    try {

        const response =
            await fetch(
                `${API_URL}/events/${eventId}`,
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
            "Review Event Response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load event information."
            );
        }


        eventData =
            result.data;


        displayEventInformation(
            eventData
        );


    } catch (error) {

        console.error(
            "Review Event Error:",
            error
        );

        throw error;
    }
}


// ========================================
// Display Event
// ========================================

function displayEventInformation(event) {

    const imageUrl =
        event.bannerImage?.url ||
        event.image ||
        "https://via.placeholder.com/600x400?text=EventEase";


    reviewEventImage.src =
        imageUrl;


    reviewEventImage.alt =
        event.title ||
        "Event";


    reviewEventCategory.textContent =
        event.category?.name ||
        "Event";


    reviewEventTitle.textContent =
        event.title ||
        "Untitled Event";


    reviewEventDate.textContent =
        formatDate(
            event.eventDate ||
            event.date
        );
}


// ========================================
// Select Rating
// ========================================

function selectRating(rating) {

    selectedRating =
        Number(rating);


    ratingStars.forEach(
        (star) => {

            const starRating =
                Number(
                    star.dataset.rating
                );


            if (
                starRating <= selectedRating
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


    ratingText.textContent =
        ratingLabels[selectedRating] ||
        "Select a rating";


    ratingError.classList.add(
        "hidden"
    );
}


// ========================================
// Rating Events
// ========================================

ratingStars.forEach(
    (star) => {

        star.addEventListener(
            "click",
            () => {

                selectRating(
                    star.dataset.rating
                );

            }
        );

    }
);


// ========================================
// Character Counter
// ========================================

reviewComment.addEventListener(
    "input",
    () => {

        const length =
            reviewComment.value.length;

        characterCount.textContent =
            `${length} / 1000`;

        if (length > 0) {

            commentError.classList.add(
                "hidden"
            );
        }
    }
);


// ========================================
// Validate Review
// ========================================

function validateReview() {

    let isValid = true;


    // Rating

    if (
        !selectedRating ||
        selectedRating < 1 ||
        selectedRating > 5
    ) {

        ratingError.textContent =
            "Please select a rating.";

        ratingError.classList.remove(
            "hidden"
        );

        isValid = false;
    }


    // Comment

    const comment =
        reviewComment.value.trim();


    if (!comment) {

        commentError.textContent =
            "Please write a review.";

        commentError.classList.remove(
            "hidden"
        );

        isValid = false;

    } else if (comment.length < 5) {

        commentError.textContent =
            "Review must be at least 5 characters.";

        commentError.classList.remove(
            "hidden"
        );

        isValid = false;

    } else if (comment.length > 1000) {

        commentError.textContent =
            "Review cannot exceed 1000 characters.";

        commentError.classList.remove(
            "hidden"
        );

        isValid = false;
    }


    return isValid;
}


// ========================================
// Submit Review
// ========================================

async function submitReview() {

    hideError();


    if (!token) {

        showError(
            "Your login session has expired. Please login again."
        );

        return;
    }


    if (!validateReview()) {
        return;
    }


    if (!eventId) {

        showError(
            "Event information was not found."
        );

        return;
    }


    const payload = {

        event: eventId,

        rating: selectedRating,

        comment:
            reviewComment.value.trim()

    };


    console.log(
        "Review Payload:",
        payload
    );


    submitReviewButton.disabled =
        true;

    submitReviewButton.textContent =
        "Submitting Review...";


    try {

        /*
         * Expected endpoint:
         *
         * POST /api/v1/reviews
         *
         * We will verify this against
         * your review.route.js later.
         */

        const response =
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
                        JSON.stringify(
                            payload
                        )
                }
            );


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
                "Unable to submit review."
            );
        }


        showSuccess(
            result.message ||
            "Your review was submitted successfully."
        );


        reviewForm.reset();


        selectedRating = 0;


        ratingStars.forEach(
            (star) => {

                star.classList.remove(
                    "text-primary"
                );

                star.classList.add(
                    "text-gray-300"
                );
            }
        );


        ratingText.textContent =
            "Select a rating";


        characterCount.textContent =
            "0 / 1000";


        submitReviewButton.textContent =
            "Review Submitted";


        /*
         * After successful submission,
         * return to booking list.
         */

        setTimeout(
            () => {

                window.location.href =
                    "./my-bookings.html";

            },
            1500
        );


    } catch (error) {

        console.error(
            "Submit Review Error:",
            error
        );


        showError(
            error.message ||
            "Something went wrong while submitting your review."
        );


        submitReviewButton.disabled =
            false;

        submitReviewButton.textContent =
            "Submit Review";
    }
}


// ========================================
// Form Submit
// ========================================

reviewForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        submitReview();

    }
);


// ========================================
// Initialize
// ========================================

async function initializeReviewPage() {

    if (!token) {

        showError(
            "Please login to write a review."
        );

        loadingState.classList.add(
            "hidden"
        );

        return;
    }


    if (!loadBookingInformation()) {

        loadingState.classList.add(
            "hidden"
        );

        return;
    }


    try {

        await loadEventInformation();


        loadingState.classList.add(
            "hidden"
        );


        reviewContent.classList.remove(
            "hidden"
        );


    } catch (error) {

        loadingState.classList.add(
            "hidden"
        );

        showError(
            error.message ||
            "Unable to load review information."
        );
    }
}


initializeReviewPage();