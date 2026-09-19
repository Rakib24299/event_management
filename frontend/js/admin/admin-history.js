// EventEase Admin Event History

// Configuration

const API_BASE_URL = "http://localhost:5000/api/v1";

// DOM Elements

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const retryBtn = document.getElementById("retryBtn");
const content = document.getElementById("content");
const eventList = document.getElementById("eventList");
const emptyState = document.getElementById("emptyState");
const historyCount = document.getElementById("historyCount");
const historyCountText = document.getElementById("historyCountText");
const logoutBtn = document.getElementById("logoutBtn");

// Reviews Modal Elements
const reviewsModal = document.getElementById("reviewsModal");
const modalEventTitle = document.getElementById("modalEventTitle");
const closeReviewsModalBtn = document.getElementById("closeReviewsModalBtn");
const closeReviewsModalFooterBtn = document.getElementById("closeReviewsModalFooterBtn");
const reviewsModalLoading = document.getElementById("reviewsModalLoading");
const reviewsModalError = document.getElementById("reviewsModalError");
const reviewsModalErrorMessage = document.getElementById("reviewsModalErrorMessage");
const reviewsModalEmpty = document.getElementById("reviewsModalEmpty");
const reviewsModalContent = document.getElementById("reviewsModalContent");
const reviewsAverageRating = document.getElementById("reviewsAverageRating");
const reviewsAverageStars = document.getElementById("reviewsAverageStars");
const reviewsTotalCount = document.getElementById("reviewsTotalCount");
const reviewsList = document.getElementById("reviewsList");

// Get Token

const getToken = () => {
    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );
};

// Authentication Check

const token = getToken();

if (!token) {
    alert("Please login as admin to access this page.");
    window.location.href = "./admin-login.html";
}

// API Request Helper

const apiRequest = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });

    let data = {};
    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
};

// Escape HTML

const escapeHTML = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// Format Date

const formatDate = (date) => {
    if (!date) {
        return "N/A";
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        return "N/A";
    }

    return parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

// Format Time

const formatTime = (time) => {
    if (!time) {
        return "N/A";
    }
    return escapeHTML(time);
};

// Update History Count

const updateHistoryCount = (count) => {
    if (!historyCount) return;
    historyCount.textContent = `${count} ${count === 1 ? "Event" : "Events"}`;
};

// Get Organizer Name

const getOrganizerName = (event) => {
    if (event.organizer && typeof event.organizer === "object") {
        return (
            event.organizer.name ||
            event.organizer.organizationName ||
            "Unknown Organizer"
        );
    }
    return "Unknown Organizer";
};

// Get Category Name

const getCategoryName = (event) => {
    if (event.category && typeof event.category === "object") {
        return event.category.name || "Uncategorized";
    }
    return "Uncategorized";
};

// Get Event Image

const getEventImage = (event) => {
    return (
        event.bannerImage?.url ||
        event.bannerImage ||
        event.image?.url ||
        event.image ||
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80"
    );
};

// Render Stars Helper

const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHTML = "";

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHTML += `<svg class="h-4 w-4 text-amber-400 fill-amber-400 inline-block" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>`;
        } else if (i === fullStars + 1 && hasHalfStar) {
            starsHTML += `<svg class="h-4 w-4 text-amber-400 fill-amber-400 opacity-60 inline-block" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>`;
        } else {
            starsHTML += `<svg class="h-4 w-4 text-gray-300 fill-gray-300 inline-block" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>`;
        }
    }
    return starsHTML;
};

// Render Empty State

const renderEmptyState = () => {
    eventList.innerHTML = "";
    emptyState.classList.remove("hidden");
};

// Render Events

const renderEvents = (events) => {
    eventList.innerHTML = "";
    emptyState.classList.add("hidden");

    if (!events || events.length === 0) {
        renderEmptyState();
        updateHistoryCount(0);
        historyCountText.textContent = "0 events found";
        return;
    }

    updateHistoryCount(events.length);
    historyCountText.textContent = `${events.length} ${events.length === 1 ? "event" : "events"} found`;

    events.forEach((event) => {
        const card = document.createElement("div");
        card.className = "rounded-3xl bg-white p-6 shadow-soft border border-gray-100";

        const eventId = event._id || event.id || "";
        const title = escapeHTML(event.title || "Untitled Event");
        const organizer = escapeHTML(getOrganizerName(event));
        const category = escapeHTML(getCategoryName(event));
        const imageUrl = getEventImage(event);

        const venue = event.venue && typeof event.venue === "object"
            ? escapeHTML(event.venue.venueName || "Venue not specified")
            : "Venue not specified";

        const city = event.venue && typeof event.venue === "object"
            ? escapeHTML(event.venue.city || "")
            : "";

        const eventDate = formatDate(event.eventDate || event.date);
        const startTime = formatTime(event.startTime);
        const endTime = formatTime(event.endTime);
        const eventType = event.eventType || "paid";

        card.innerHTML = `
            <!-- TOP SECTION -->
            <div class="flex flex-col gap-6 md:flex-row">
                <!-- Event Image -->
                <div class="relative h-48 w-full md:h-auto md:w-60 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                    <img
                        src="${escapeHTML(imageUrl)}"
                        alt="${title}"
                        class="h-full w-full object-cover"
                        onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80';"
                    />
                    <span class="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-gray-900/75 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
                        <span class="h-1.5 w-1.5 rounded-full bg-red-400"></span>
                        Expired
                    </span>
                </div>

                <!-- Event Information -->
                <div class="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                        <!-- Title / Badges -->
                        <div class="flex flex-wrap items-center gap-2">
                            <h2 class="text-xl font-bold text-gray-900">
                                ${title}
                            </h2>

                            ${
                                eventType === "free"
                                    ? `<span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Free</span>`
                                    : `<span class="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">Paid</span>`
                            }
                        </div>

                        <!-- Organizer -->
                        <div class="mt-3">
                            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Organizer
                            </p>
                            <p class="mt-0.5 text-sm font-semibold text-gray-800">
                                ${organizer}
                            </p>
                        </div>

                        <!-- Event Details Grid -->
                        <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div>
                                <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Category</p>
                                <p class="mt-0.5 text-sm font-semibold text-gray-800">${category}</p>
                            </div>
                            <div>
                                <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Date</p>
                                <p class="mt-0.5 text-sm font-semibold text-gray-800">${eventDate}</p>
                            </div>
                            <div>
                                <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Time</p>
                                <p class="mt-0.5 text-sm font-semibold text-gray-800">${startTime} - ${endTime}</p>
                            </div>
                            <div>
                                <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Type</p>
                                <p class="mt-0.5 text-sm font-semibold text-gray-800">${eventType === "free" ? "Free" : "Paid"}</p>
                            </div>
                        </div>

                        <!-- Venue -->
                        <div class="mt-3">
                            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Venue</p>
                            <p class="mt-0.5 text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                <svg class="h-4 w-4 inline-block text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span>${venue}${city ? `, ${city}` : ""}</span>
                            </p>
                        </div>
                    </div>

                    <!-- Bottom Action: Review Button -->
                    <div class="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                        <span class="text-xs text-gray-400 font-medium">Completed / Expired</span>
                        <button
                            type="button"
                            class="view-reviews-btn inline-flex items-center gap-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-800 transition duration-150"
                            data-event-id="${eventId}"
                            data-event-title="${title}"
                        >
                            <svg class="h-4 w-4 text-amber-500 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <span>Reviews</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        eventList.appendChild(card);
    });

    attachReviewButtonListeners();
};

// Review Modal Logic

const openReviewsModal = async (eventId, eventTitle) => {
    if (!reviewsModal) return;

    reviewsModal.classList.remove("hidden");
    reviewsModal.classList.add("flex");
    document.body.classList.add("overflow-hidden");

    if (modalEventTitle) {
        modalEventTitle.textContent = eventTitle || "Event Reviews";
    }

    // Reset states
    reviewsModalLoading?.classList.remove("hidden");
    reviewsModalError?.classList.add("hidden");
    reviewsModalEmpty?.classList.add("hidden");
    reviewsModalContent?.classList.add("hidden");

    try {
        const response = await apiRequest(`/reviews/event/${eventId}`);
        const reviews = response.data || [];

        reviewsModalLoading?.classList.add("hidden");

        if (!reviews || reviews.length === 0) {
            reviewsModalEmpty?.classList.remove("hidden");
            return;
        }

        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
        const avgRating = (totalRating / totalReviews).toFixed(1);

        if (reviewsAverageRating) reviewsAverageRating.textContent = avgRating;
        if (reviewsAverageStars) reviewsAverageStars.innerHTML = renderStars(parseFloat(avgRating));
        if (reviewsTotalCount) reviewsTotalCount.textContent = `Based on ${totalReviews} ${totalReviews === 1 ? "review" : "reviews"}`;

        if (reviewsList) {
            reviewsList.innerHTML = reviews.map((review) => {
                const user = review.user || {};
                const userName = escapeHTML(user.name || "Anonymous User");
                const userAvatar = user.profileImage?.url || user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=457b9d&color=fff`;
                const rating = Number(review.rating) || 5;
                const comment = escapeHTML(review.review || review.comment || "No comment provided.");
                const dateStr = formatDate(review.createdAt);

                return `
                    <div class="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition hover:bg-gray-50">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-center gap-3">
                                <img
                                    src="${escapeHTML(userAvatar)}"
                                    alt="${userName}"
                                    class="h-10 w-10 rounded-full object-cover border border-gray-200"
                                    onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=457b9d&color=fff';"
                                />
                                <div>
                                    <h4 class="text-sm font-bold text-gray-900">${userName}</h4>
                                    <p class="text-xs text-gray-400">${dateStr}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-1">
                                ${renderStars(rating)}
                                <span class="ml-1 text-xs font-bold text-gray-700">${rating}.0</span>
                            </div>
                        </div>
                        <p class="mt-3 text-sm text-gray-600 leading-relaxed">${comment}</p>
                    </div>
                `;
            }).join("");
        }

        reviewsModalContent?.classList.remove("hidden");
    } catch (err) {
        console.error("Load reviews error:", err);
        reviewsModalLoading?.classList.add("hidden");
        reviewsModalError?.classList.remove("hidden");
        if (reviewsModalErrorMessage) {
            reviewsModalErrorMessage.textContent = err.message || "Failed to load user reviews.";
        }
    }
};

const closeReviewsModal = () => {
    if (!reviewsModal) return;
    reviewsModal.classList.add("hidden");
    reviewsModal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
};

// Attach Review Button Listeners

const attachReviewButtonListeners = () => {
    const reviewButtons = document.querySelectorAll(".view-reviews-btn");
    reviewButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const eventId = btn.getAttribute("data-event-id");
            const eventTitle = btn.getAttribute("data-event-title");
            if (eventId) {
                openReviewsModal(eventId, eventTitle);
            }
        });
    });
};

// Modal Close Listeners
if (closeReviewsModalBtn) {
    closeReviewsModalBtn.addEventListener("click", closeReviewsModal);
}
if (closeReviewsModalFooterBtn) {
    closeReviewsModalFooterBtn.addEventListener("click", closeReviewsModal);
}
if (reviewsModal) {
    reviewsModal.addEventListener("click", (e) => {
        if (e.target === reviewsModal) {
            closeReviewsModal();
        }
    });
}
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && reviewsModal && !reviewsModal.classList.contains("hidden")) {
        closeReviewsModal();
    }
});

// Load Event History

const loadHistory = async () => {
    try {
        loadingState.classList.remove("hidden");
        content.classList.add("hidden");
        errorState.classList.add("hidden");

        const result = await apiRequest("/admin/events/history");
        const events = result.data || [];

        renderEvents(events);

        loadingState.classList.add("hidden");
        content.classList.remove("hidden");
    } catch (error) {
        console.error("Load event history error:", error);
        loadingState.classList.add("hidden");
        content.classList.add("hidden");
        errorState.classList.remove("hidden");

        if (errorMessage) {
            errorMessage.textContent = error.message || "Failed to load event history.";
        }
    }
};

// Retry Button

if (retryBtn) {
    retryBtn.addEventListener("click", loadHistory);
}

// Logout

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "./admin-login.html";
    });
}

// Load History on Page Load

loadHistory();
