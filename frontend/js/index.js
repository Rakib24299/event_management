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
  Music:
    '<svg class="h-6 w-6 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
  Others:
    '<svg class="h-4 w-4 inline-block text-current align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
  Cricket:
    '<svg class="h-6 w-6 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 4.5l-2-2a1.5 1.5 0 00-2.12 0L9.5 8.38M14.5 3.38L4.88 13a3.5 3.5 0 00-.98 2.37l.2 3.43 3.43.2a3.5 3.5 0 002.37-.98L19.5 8.4a1.5 1.5 0 000-2.12z" /><circle cx="18" cy="18" r="3" stroke="currentColor" stroke-width="2" /></svg>',
  Entertainment:
    '<svg class="h-6 w-6 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /></svg>',
  Education:
    '<svg class="h-6 w-6 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 14v7" /></svg>',
  "Health & Wellness":
    '<svg class="h-6 w-6 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>',
  "Arts & Culture":
    '<svg class="h-6 w-6 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4 5 5 0 015-5h1.25a1.75 1.75 0 001.75-1.75V9A6 6 0 0117 3a6 6 0 016 0z" /></svg>',
  "Food & Drink":
    '<svg class="h-6 w-6 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18 2v6a3 3 0 01-3 3 3 3 0 01-3-3V2M15 2v20M5 2v13a3 3 0 003 3h1a3 3 0 003-3V2M9 2v20" /></svg>',
  Business:
    '<svg class="h-6 w-6 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path stroke-linecap="round" stroke-linejoin="round" d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>',
  Technology:
    '<svg class="h-6 w-6 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>',
  Sports:
    '<svg class="h-6 w-6 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 7l3.5 2.5-1.5 4h-4L8.5 9.5 12 7z" /></svg>',
  Football:
    '<svg class="h-6 w-6 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /></svg>',
};

// ========================================
// Token (optional)
// ========================================

const token = localStorage.getItem("token") || sessionStorage.getItem("token");

// ========================================
// Elements
// ========================================

const featuredEventsContainer = document.getElementById("featuredEvents");

const categoriesContainer = document.getElementById("categoriesContainer");

const eventsLoading = document.getElementById("eventsLoading");

const eventsError = document.getElementById("eventsError");

const retryEventsBtn = document.getElementById("retryEvents");

const searchInput = document.getElementById("searchInput");

const categoryFilter = document.getElementById("categoryFilter");

const locationFilter = document.getElementById("locationFilter");

const dateFilter = document.getElementById("dateFilter");

const searchButton = document.getElementById("searchButton");

const clearFiltersBtn = document.getElementById("clearFilters");

// ========================================
// API Request Helper
// ========================================

async function apiRequest(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = {};

  try {
    data = await response.json();
  } catch (e) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// ========================================
// Utility Functions
// ========================================

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

function getEventId(event) {
  if (!event) {
    return "";
  }

  return String(event._id || event.id || event.eventId || "");
}

function getEventName(event) {
  return event.title || event.name || event.eventName || "Untitled Event";
}

function getCategory(event) {
  if (typeof event.category === "string") {
    return event.category;
  }

  if (event.category && typeof event.category === "object") {
    return event.category.name || event.category.title || "Event";
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
  const price = event.ticketPrice ?? event.price ?? event.registrationFee ?? 0;

  return Number(price) || 0;
}

function getEventDate(event) {
  return event.eventDate || event.date || event.startDate || event.startTime;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Date not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date not available";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

                <div class="text-5xl"><svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>

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
  const id = getEventId(event);

  const title = escapeHTML(getEventName(event));

  const category = escapeHTML(getCategory(event));

  const location = escapeHTML(getEventLocation(event));

  const date = formatDate(getEventDate(event));

  const price = getEventPrice(event);

  const eventType = event.eventType || "paid";

  const image = getEventImage(event);

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

                <svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>

            </div>

        `;
  }

  const detailsURL = `./pages/user/event-details.html?id=${encodeURIComponent(id)}`;

  return `

        <article
            class="
                group
                flex
                flex-col
                h-full
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
                    h-48
                    sm:h-52
                    w-full
                    shrink-0
                    overflow-hidden
                    bg-green-50
                "
            >

                ${imageHTML}

                <span
                    class="
                        absolute
                        left-3
                        sm:left-4
                        top-3
                        sm:top-4
                        max-w-[140px]
                        truncate
                        rounded-full
                        bg-white/95
                        px-2.5
                        sm:px-3
                        py-1
                        text-xs
                        font-semibold
                        text-primary
                        shadow-sm
                        backdrop-blur-sm
                    "
                >

                    ${category}

                </span>

                ${
                  eventType === "free" || price === 0
                    ? `
                    <span
                        class="
                            absolute
                            right-3
                            sm:right-4
                            top-3
                            sm:top-4
                            rounded-full
                            bg-emerald-600
                            px-2.5
                            sm:px-3
                            py-1
                            text-xs
                            font-bold
                            text-white
                            shadow-sm
                        "
                    >
                        Free
                    </span>
                `
                    : ""
                }

            </div>

            <div class="p-4 sm:p-5 flex flex-col flex-1 justify-between">

                <div>

                    <h3
                        class="
                            line-clamp-2
                            min-h-[44px]
                            sm:min-h-[52px]
                            text-base
                            sm:text-lg
                            font-bold
                            text-gray-900
                            leading-snug
                        "
                        title="${title}"
                    >

                        ${title}

                    </h3>

                    <div
                        class="
                            mt-2.5
                            sm:mt-3
                            space-y-1.5
                            sm:space-y-2
                            text-xs
                            sm:text-sm
                            text-gray-500
                        "
                    >

                        <p class="flex items-center gap-1.5 truncate" title="${location}">

                            <svg class="h-4 w-4 shrink-0 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span class="truncate">${location}</span>

                        </p>

                        <p class="flex items-center gap-1.5 truncate">

                            <svg class="h-4 w-4 shrink-0 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span class="truncate">${date}</span>

                        </p>

                    </div>

                </div>

                <div
                    class=" mt-4 sm:mt-5 flex items-center justify-between border-t border-gray-100 pt-3 sm:pt-4 gap-2 " >

                    <div class="min-w-0">
                        <p class="text-[11px] sm:text-xs text-gray-400">
                         Ticket Price
                        </p>

                        <p
                            class=" mt-0.5 sm:mt-1 text-base sm:text-lg font-bold truncate
                                ${eventType === "free" || price === 0 ? "text-[#31572c]" : "text-primary"} " >

                            ${
                              eventType === "free" || price === 0
                                ? "Free"
                                : `৳${price.toLocaleString()}`
                            }

                        </p>

                    </div>

                    <a
                        href="${detailsURL}"
                        class=" shrink-0 rounded-xl bg-primary px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-primaryDark text-center " >

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

  if (!Array.isArray(events) || events.length === 0) {
    showEmptyState();

    return;
  }

  hideLoading();

  if (eventsError) {
    eventsError.classList.add("hidden");
  }

  const displayEvents = events.slice(0, 8);

  featuredEventsContainer.innerHTML = displayEvents
    .map(createEventCard)
    .join("");
}

// ========================================
// Render Categories
// ========================================

function createCategoryCard(category) {
  const name = escapeHTML(category.name || category.title || "Category");

  const rawName = category.name || category.title || "";

  const icon =
    categoryIcons[rawName] ||
    category.icon ||
    category.emoji ||
    '<svg class="h-4 w-4 inline-block text-current align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';

  const count = category.eventCount || category.count || "";

  const href = `./pages/user/events.html?category=${encodeURIComponent(name.toLowerCase())}`;

  return `

        <a
            href="${href}"
            class=" group flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 md:p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md text-center " >

            <div class="text-2xl sm:text-3xl text-primary transition group-hover:scale-110">

                ${icon}

            </div>

            <p class="mt-2.5 sm:mt-3 text-xs sm:text-sm font-semibold text-gray-900 break-words line-clamp-1">

                ${name}

            </p>

            ${
              count
                ? `
                        <p class="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-gray-400">

                            ${count} events

                        </p>
                    `
                : ""
            }

        </a>

    `;
}

function renderCategories(categories) {
  if (!categoriesContainer) 
    {
    return; }

  if (!Array.isArray(categories) || categories.length === 0) {
    categoriesContainer.innerHTML = `

            <div
                class="  col-span-full text-center text-sm text-gray-500 " >

                No categories available.

            </div>

        `;

    return;
  }

  categoriesContainer.innerHTML = categories.map(createCategoryCard).join("");
}

function populateCategoryDropdown(categories) {
  if (!categoryFilter) {
    return;
  }

  const options = categories
    .map((cat) => {
      const name = cat.name || cat.title || "";

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
    const data = await apiRequest("/categories");

    const categories = Array.isArray(data)
      ? data
      : data.data || data.categories || [];

    allCategories = categories;

    renderCategories(categories);

    populateCategoryDropdown(categories);
  } catch (error) {
    console.error("Failed to load categories:", error);

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
    const data = await apiRequest("/events");

    const events = extractEvents(data);

    if (!Array.isArray(events)) {
      throw new Error("Invalid events data received from server.");
    }

    allEvents = events;

    renderEvents(events);
  } catch (error) {
    console.error("Fetch Events Error:", error);

    showError();
  }
}

// ========================================
// Filter Events
// ========================================

function filterEvents() {
  const searchTerm = searchInput?.value.trim().toLowerCase() || "";

  const selectedCategory = categoryFilter?.value.trim().toLowerCase() || "";

  const selectedLocation = locationFilter?.value.trim().toLowerCase() || "";

  const selectedDate = dateFilter?.value || "";

  const filteredEvents = allEvents.filter((event) => {
    const title = getEventName(event).toLowerCase();

    const category = getCategory(event).toLowerCase();

    const location = getEventLocation(event).toLowerCase();

    const eventDate = getEventDate(event);

    const matchesSearch = !searchTerm || title.includes(searchTerm);

    const matchesCategory =
      !selectedCategory || category.includes(selectedCategory);

    const matchesLocation =
      !selectedLocation || location.includes(selectedLocation);

    let matchesDate = true;

    if (selectedDate && eventDate) {
      const eventDateTime = new Date(eventDate);

      const selectedDateTime = new Date(selectedDate);

      matchesDate =
        eventDateTime.toDateString() === selectedDateTime.toDateString();
    }

    return matchesSearch && matchesCategory && matchesLocation && matchesDate;
  });

  renderEvents(filteredEvents);
}

// ========================================
// Event Listeners
// ========================================

if (searchButton) {
  searchButton.addEventListener("click", filterEvents);
}

if (searchInput) {
  searchInput.addEventListener("input", filterEvents);
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", filterEvents);
}

if (locationFilter) {
  locationFilter.addEventListener("input", filterEvents);
}

if (dateFilter) {
  dateFilter.addEventListener("change", filterEvents);
}

if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener("click", () => {
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

    renderEvents(allEvents);
  });
}

if (retryEventsBtn) {
  retryEventsBtn.addEventListener("click", fetchEvents);
}

// ========================================
// Initialize
// ========================================

Promise.allSettled([fetchCategories(), fetchEvents()]);
