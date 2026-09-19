// EventEase Organizer - 30-Day Expired Events Reviews

const API_BASE_URL = "http://localhost:5000/api/v1";

// DOM Elements
const reviewsLoading = document.getElementById("reviewsLoading");
const reviewsContent = document.getElementById("reviewsContent");
const reviewsError = document.getElementById("reviewsError");
const reviewsErrorMessage = document.getElementById("reviewsErrorMessage");
const reviewsEmpty = document.getElementById("reviewsEmpty");
const eventReviewsList = document.getElementById("eventReviewsList");
const retryButton = document.getElementById("retryButton");
const totalEventsCount = document.getElementById("totalEventsCount");
const totalReviewsCount = document.getElementById("totalReviewsCount");
const reviewsStatsSummary = document.getElementById("reviewsStatsSummary");

// Modal Elements
const reviewDetailsModal = document.getElementById("reviewDetailsModal");
const modalEventTitle = document.getElementById("modalEventTitle");
const modalRatingSummary = document.getElementById("modalRatingSummary");
const modalReviewsBody = document.getElementById("modalReviewsBody");
const modalReviewCountFooter = document.getElementById("modalReviewCountFooter");
const closeModalBtn = document.getElementById("closeModalBtn");
const closeModalFooterBtn = document.getElementById("closeModalFooterBtn");

// State
const token = localStorage.getItem("token");
let userRole = null;
try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
        const parsed = JSON.parse(rawUser);
        userRole = parsed.role;
    }
} catch (e) {
    console.error("Failed to parse user:", e);
}

// Global cache for event reviews
const eventReviewsCache = new Map();

// Helper: Escape HTML
function escapeHTML(value) {
    if (value === undefined || value === null) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Helper: Extract Event Image URL
function getEventImage(event) {
    if (!event) return "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&auto=format&fit=crop&q=60";
    if (typeof event.bannerImage === "string" && event.bannerImage.trim()) return event.bannerImage.trim();
    if (event.bannerImage && typeof event.bannerImage === "object" && event.bannerImage.url && event.bannerImage.url.trim()) {
        return event.bannerImage.url.trim();
    }
    if (typeof event.image === "string" && event.image.trim()) return event.image.trim();
    if (event.image && typeof event.image === "object" && event.image.url && event.image.url.trim()) {
        return event.image.url.trim();
    }
    if (typeof event.banner === "string" && event.banner.trim()) return event.banner.trim();
    return "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&auto=format&fit=crop&q=60";
}

// Helper: Extract Event Location
function getEventLocation(event) {
    if (!event) return "Location not available";
    const loc = event.venue || event.location || event.address;
    if (!loc) return "Location not available";
    if (typeof loc === "string" && loc.trim()) return loc.trim();
    if (typeof loc === "object") {
        if (loc.venueName) {
            const parts = [loc.venueName, loc.street, loc.city, loc.country].filter(Boolean);
            return parts.join(", ");
        }
        if (loc.address || loc.name) {
            return loc.address || loc.name;
        }
        const parts = [loc.street, loc.city, loc.country].filter(Boolean);
        if (parts.length > 0) return parts.join(", ");
    }
    return "Location not available";
}

// Helper: Extract Category Name
function getCategoryName(category) {
    if (!category) return "General";
    if (typeof category === "string" && category.trim()) return category.trim();
    if (typeof category === "object" && category.name) return category.name;
    return "General";
}

// Helper: Extract User Profile Image
function getUserProfileImage(user) {
    if (!user) return null;
    if (typeof user.profileImage === "string" && user.profileImage.trim()) {
        return user.profileImage.trim();
    }
    if (user.profileImage && typeof user.profileImage === "object" && user.profileImage.url && user.profileImage.url.trim()) {
        return user.profileImage.url.trim();
    }
    if (typeof user.avatar === "string" && user.avatar.trim()) {
        return user.avatar.trim();
    }
    if (user.avatar && typeof user.avatar === "object" && user.avatar.url && user.avatar.url.trim()) {
        return user.avatar.url.trim();
    }
    return null;
}

// Helper: Render Star Icons
function renderStars(rating, max = 5, sizeClass = "w-4 h-4") {
    const validRating = Math.max(0, Math.min(max, Number(rating) || 0));
    let starsHtml = "";
    for (let i = 1; i <= max; i++) {
        if (i <= Math.round(validRating)) {
            starsHtml += `<svg class="${sizeClass} text-amber-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>`;
        } else {
            starsHtml += `<svg class="${sizeClass} text-gray-300 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>`;
        }
    }
    return starsHtml;
}

// Format Relative Days
function getDaysAgoText(dateValue) {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Ended Today";
    if (diffDays === 1) return "Ended Yesterday";
    return `Ended ${diffDays} days ago`;
}

// Format Date
function formatDate(dateValue) {
    if (!dateValue) return "Date not available";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return String(dateValue);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// Format Time
function formatTime(timeValue) {
    if (!timeValue) return "";
    return timeValue;
}

// Check Authentication
function checkAuth() {
    if (!token) {
        window.location.href = "../auth/login.html?redirect=../organizer/reviews.html";
        return false;
    }
    return true;
}

// Fetch Reviews for a single event
async function fetchEventReviews(eventId) {
    try {
        const res = await fetch(`${API_BASE_URL}/reviews/event/${eventId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!res.ok) {
            return [];
        }
        const data = await res.json();
        const reviews = data.reviews || data.data?.reviews || (Array.isArray(data.data) ? data.data : []) || [];
        return reviews;
    } catch (err) {
        console.error(`Failed to fetch reviews for event ${eventId}:`, err);
        return [];
    }
}

// Load Expired Events and their Reviews
async function loadExpiredEventReviews() {
    if (!checkAuth()) return;

    reviewsLoading.classList.remove("hidden");
    reviewsContent.classList.add("hidden");
    reviewsError.classList.add("hidden");
    reviewsEmpty.classList.add("hidden");

    try {
        const res = await fetch(`${API_BASE_URL}/events/organizer/history`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch event history (HTTP ${res.status})`);
        }

        const data = await res.json();
        const allHistoryEvents = data.events || data.data?.events || (Array.isArray(data.data) ? data.data : []) || [];

        // Filter: Expired within last 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const eligibleEvents = allHistoryEvents.filter(event => {
            const eventDateStr = event.eventDate || event.date;
            if (!eventDateStr) return false;
            const eventDate = new Date(eventDateStr);
            if (Number.isNaN(eventDate.getTime())) return false;
            return eventDate < now && eventDate >= thirtyDaysAgo;
        });

        // Sort latest expired first
        eligibleEvents.sort((a, b) => {
            const dateA = new Date(a.eventDate || a.date);
            const dateB = new Date(b.eventDate || b.date);
            return dateB - dateA;
        });

        if (eligibleEvents.length === 0) {
            reviewsLoading.classList.add("hidden");
            reviewsEmpty.classList.remove("hidden");
            if (totalEventsCount) totalEventsCount.textContent = "0";
            if (totalReviewsCount) totalReviewsCount.textContent = "0";
            return;
        }

        // Fetch reviews for all eligible events in parallel
        let grandTotalReviews = 0;
        const eventReviewPromises = eligibleEvents.map(async (event) => {
            const reviews = await fetchEventReviews(event._id);
            eventReviewsCache.set(event._id, {
                event: event,
                reviews: reviews
            });

            // Calculate average rating
            let avgRating = 0;
            if (reviews.length > 0) {
                const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
                avgRating = (sum / reviews.length).toFixed(1);
            } else if (event.averageRating !== undefined && event.averageRating !== null) {
                avgRating = Number(event.averageRating).toFixed(1);
            }

            grandTotalReviews += reviews.length;

            return {
                ...event,
                fetchedReviews: reviews,
                computedAvgRating: Number(avgRating),
                computedReviewCount: reviews.length
            };
        });

        const eventsWithReviews = await Promise.all(eventReviewPromises);

        // Update counts
        if (totalEventsCount) totalEventsCount.textContent = eligibleEvents.length;
        if (totalReviewsCount) totalReviewsCount.textContent = grandTotalReviews;
        if (reviewsStatsSummary) reviewsStatsSummary.classList.remove("hidden");

        // Render Events
        renderEventCards(eventsWithReviews);

        reviewsLoading.classList.add("hidden");
        reviewsContent.classList.remove("hidden");

    } catch (err) {
        console.error("Error loading reviews:", err);
        reviewsLoading.classList.add("hidden");
        reviewsError.classList.remove("hidden");
        if (reviewsErrorMessage) {
            reviewsErrorMessage.textContent = err.message || "Failed to load reviews. Please try again.";
        }
    }
}

// Render Event Cards
function renderEventCards(events) {
    eventReviewsList.innerHTML = "";

    events.forEach(event => {
        const title = escapeHTML(event.title || "Untitled Event");
        const category = escapeHTML(getCategoryName(event.category));
        const dateStr = formatDate(event.eventDate || event.date);
        const timeStr = formatTime(event.startTime || event.time || "");
        const location = escapeHTML(getEventLocation(event));
        const daysAgo = getDaysAgoText(event.eventDate || event.date);
        const imageUrl = getEventImage(event);
        
        const avgRating = event.computedAvgRating || 0;
        const reviewCount = event.computedReviewCount || 0;

        const card = document.createElement("div");
        card.className = "flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-xl";

        card.innerHTML = `
            <!-- Image & Badges -->
            <div class="relative h-48 w-full overflow-hidden bg-gray-100">
                <img src="${escapeHTML(imageUrl)}" alt="${title}" class="h-full w-full object-cover transition duration-300 hover:scale-105" onerror="this.src='https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&auto=format&fit=crop&q=60'"/>
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                
                <div class="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span class="rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold text-gray-800 shadow-sm">
                        ${category}
                    </span>
                </div>

                <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span class="inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur px-2.5 py-1 font-semibold">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        ${daysAgo}
                    </span>
                    <span class="font-medium">${dateStr}</span>
                </div>
            </div>

            <!-- Card Body -->
            <div class="flex flex-1 flex-col p-6">
                <h2 class="text-lg font-bold text-gray-900 line-clamp-1 hover:text-primary transition" title="${title}">
                    ${title}
                </h2>

                <div class="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <svg class="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <span class="truncate">${location}</span>
                </div>

                <!-- Review Rating Badge Section -->
                <div class="mt-5 rounded-2xl bg-amber-50/70 border border-amber-100 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-wider text-amber-800">Overall Rating</p>
                            <div class="mt-1 flex items-center gap-1.5">
                                <span class="text-2xl font-black text-gray-900">${avgRating > 0 ? avgRating : '0.0'}</span>
                                <div class="flex items-center">
                                    ${renderStars(avgRating, 5, 'w-4 h-4')}
                                </div>
                            </div>
                        </div>

                        <div class="text-right">
                            <span class="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm border border-amber-200/60">
                                <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                                ${reviewCount} ${reviewCount === 1 ? 'Review' : 'Reviews'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="mt-auto pt-6">
                    <button type="button" class="view-review-details-btn w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primaryDark active:scale-95" data-event-id="${event._id}" data-event-title="${title}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        Review Details
                    </button>
                </div>
            </div>
        `;

        eventReviewsList.appendChild(card);
    });

    // Attach click handlers to all "Review Details" buttons
    const detailBtns = eventReviewsList.querySelectorAll(".view-review-details-btn");
    detailBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const eventId = btn.getAttribute("data-event-id");
            const eventTitle = btn.getAttribute("data-event-title");
            openReviewDetailsModal(eventId, eventTitle);
        });
    });
}

// Open Review Details Modal
function openReviewDetailsModal(eventId, eventTitle) {
    const cachedData = eventReviewsCache.get(eventId);
    const reviews = cachedData ? cachedData.reviews : [];

    modalEventTitle.textContent = eventTitle || "Event Reviews";

    // Summary calculation
    let avg = 0;
    if (reviews.length > 0) {
        const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        avg = (sum / reviews.length).toFixed(1);
    }

    modalRatingSummary.innerHTML = `
        <div class="flex items-center gap-1">
            ${renderStars(avg, 5, "w-4 h-4")}
        </div>
        <span class="text-sm font-bold text-gray-900">${avg}</span>
        <span class="text-xs text-gray-500">(${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'})</span>
    `;

    modalReviewCountFooter.textContent = `Showing ${reviews.length} ${reviews.length === 1 ? 'attendee review' : 'attendee reviews'}`;

    // Render list of individual reviews
    modalReviewsBody.innerHTML = "";

    if (reviews.length === 0) {
        modalReviewsBody.innerHTML = `
            <div class="py-12 text-center">
                <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-400">
                    💬
                </div>
                <h4 class="mt-4 text-base font-bold text-gray-800">No Reviews Yet</h4>
                <p class="mt-1 text-sm text-gray-500">Attendees have not submitted reviews for this event yet.</p>
            </div>
        `;
    } else {
        reviews.forEach(rev => {
            const user = rev.user || {};
            const userName = escapeHTML(user.name || "Anonymous Attendee");
            const userEmail = escapeHTML(user.email || "");
            const userImageUrl = getUserProfileImage(user);
            const rating = Number(rev.rating) || 5;
            const comment = escapeHTML(rev.review || rev.comment || rev.reviewText || "No feedback text provided.");
            const revDate = formatDate(rev.createdAt || rev.date);

            const initial = (user.name ? user.name.trim().charAt(0) : "A").toUpperCase();

            const revEl = document.createElement("div");
            revEl.className = "flex gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition";

            const avatarHtml = userImageUrl ? `
                <img src="${escapeHTML(userImageUrl)}" alt="${userName}" class="h-11 w-11 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-200" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'h-11 w-11 rounded-full bg-primaryLight text-primary flex items-center justify-center font-bold text-base border border-primary/20 shadow-sm\'>${initial}</div>';"/>
            ` : `
                <div class="h-11 w-11 rounded-full bg-primaryLight text-primary flex items-center justify-center font-bold text-base border border-primary/20 shadow-sm">
                    ${initial}
                </div>
            `;

            revEl.innerHTML = `
                <!-- User Avatar -->
                <div class="shrink-0">
                    ${avatarHtml}
                </div>

                <!-- Review Content -->
                <div class="flex-1 min-w-0">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div>
                            <h5 class="text-sm font-bold text-gray-900">${userName}</h5>
                            ${userEmail ? `<p class="text-xs text-gray-400 truncate">${userEmail}</p>` : ''}
                        </div>
                        <div class="flex items-center gap-1.5 self-start sm:self-auto bg-white px-2.5 py-1 rounded-lg border border-gray-100 shadow-xs">
                            <div class="flex items-center">
                                ${renderStars(rating, 5, 'w-3.5 h-3.5')}
                            </div>
                            <span class="text-xs font-bold text-gray-700">${rating}/5</span>
                        </div>
                    </div>

                    <div class="mt-2.5 rounded-xl bg-white p-3.5 border border-gray-100 text-sm text-gray-700 leading-relaxed shadow-xs">
                        ${comment}
                    </div>

                    <div class="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                        <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <span>Reviewed on ${revDate}</span>
                    </div>
                </div>
            `;

            modalReviewsBody.appendChild(revEl);
        });
    }

    // Show modal
    reviewDetailsModal.classList.remove("hidden");
    reviewDetailsModal.classList.add("flex");
    document.body.style.overflow = "hidden";
}

// Close Modal
function closeReviewDetailsModal() {
    reviewDetailsModal.classList.add("hidden");
    reviewDetailsModal.classList.remove("flex");
    document.body.style.overflow = "";
}

// Event Listeners for Modal
if (closeModalBtn) closeModalBtn.addEventListener("click", closeReviewDetailsModal);
if (closeModalFooterBtn) closeModalFooterBtn.addEventListener("click", closeReviewDetailsModal);
if (reviewDetailsModal) {
    reviewDetailsModal.addEventListener("click", (e) => {
        if (e.target === reviewDetailsModal) {
            closeReviewDetailsModal();
        }
    });
}
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !reviewDetailsModal.classList.contains("hidden")) {
        closeReviewDetailsModal();
    }
});

// Retry button
if (retryButton) {
    retryButton.addEventListener("click", () => {
        loadExpiredEventReviews();
    });
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    loadExpiredEventReviews();
});
