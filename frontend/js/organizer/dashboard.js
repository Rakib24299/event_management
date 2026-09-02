// ========================================
// EventEase Organizer Dashboard
// ========================================

const API_URL = "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const dashboardLoading =
    document.getElementById("dashboardLoading");

const dashboardContent =
    document.getElementById("dashboardContent");

const dashboardError =
    document.getElementById("dashboardError");

const dashboardErrorMessage =
    document.getElementById("dashboardErrorMessage");

const retryDashboardButton =
    document.getElementById("retryDashboardButton");

const organizerName =
    document.getElementById("organizerName");

const organizationName =
    document.getElementById("organizationName");

const organizerLogo =
    document.getElementById("organizerLogo");

const totalEventsEl =
    document.getElementById("totalEvents");

const publishedEventsEl =
    document.getElementById("publishedEvents");

const ticketsSoldEl =
    document.getElementById("ticketsSold");

const totalRevenueEl =
    document.getElementById("totalRevenue");

const recentEventsEl =
    document.getElementById("recentEvents");

const recentEventsEmpty =
    document.getElementById("recentEventsEmpty");


// ========================================
// Check Authentication
// ========================================

function getToken() {

    return localStorage.getItem("token");

}


// ========================================
// Show Error
// ========================================

function showDashboardError(message) {

    dashboardLoading.classList.add("hidden");

    dashboardContent.classList.add("hidden");

    dashboardErrorMessage.textContent =
        message;

    dashboardError.classList.remove("hidden");

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
        return "৳0";
    }

    return `৳${Number(price).toLocaleString()}`;

}


// ========================================
// Default Image
// ========================================

function getDefaultImage(
    type = "profile"
) {

    if (type === "logo") {

        return (
            "https://placehold.co/200x200?text=Logo"
        );

    }


    return (
        "https://placehold.co/200x200?text=Profile"
    );

}


// ========================================
// Load Organizer Logo
// ========================================

async function loadOrganizerLogo() {

    const token = getToken();

    if (!token) {

        if (organizerLogo) {

            organizerLogo.src =
                getDefaultImage("logo");

        }

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/users/me`,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    },

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            if (organizerLogo) {

                organizerLogo.src =
                    getDefaultImage("logo");

            }

            return;

        }


        const user =
            result.data || {};


        const logoUrl =
            user.organizationLogo?.url;


        if (organizerLogo) {

            organizerLogo.src =
                logoUrl ||
                getDefaultImage("logo");

        }


        if (organizerName && user.name) {

            organizerName.textContent =
                user.name;

        }


        if (
            organizationName &&
            user.organizationName
        ) {

            organizationName.textContent =
                user.organizationName;

        } else if (organizationName) {

            organizationName.textContent =
                "Manage your organization and events.";

        }


        const storedUser =
            localStorage.getItem("user");


        if (storedUser) {

            try {

                const parsedUser =
                    JSON.parse(storedUser);

                parsedUser.organizationLogo =
                    user.organizationLogo ||
                    parsedUser.organizationLogo;

                parsedUser.name =
                    user.name || parsedUser.name;

                parsedUser.organizationName =
                    user.organizationName ||
                    parsedUser.organizationName;

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        parsedUser
                    )
                );

            } catch (e) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        user
                    )
                );

            }

        } else {

            localStorage.setItem(
                "user",
                JSON.stringify(
                    user
                )
            );

        }

    } catch (error) {

        console.error(
            "Load organizer logo error:",
            error
        );


        if (organizerLogo) {

            organizerLogo.src =
                getDefaultImage("logo");

        }

    }

}


// ========================================
// Update Statistics
// ========================================

function updateStatistics(data) {

    if (totalEventsEl) {
        totalEventsEl.textContent =
            data.totalEvents !== undefined
                ? data.totalEvents
                : 0;
    }

    if (publishedEventsEl) {
        publishedEventsEl.textContent =
            data.publishedEvents !== undefined
                ? data.publishedEvents
                : 0;
    }

    if (ticketsSoldEl) {
        ticketsSoldEl.textContent =
            data.ticketsSold !== undefined
                ? data.ticketsSold
                : 0;
    }

    if (totalRevenueEl) {
        totalRevenueEl.textContent =
            formatPrice(data.totalRevenue);
    }

}


// ========================================
// Display Recent Events
// ========================================

function displayRecentEvents(events) {

    if (
        !Array.isArray(events) ||
        events.length === 0
    ) {

        recentEventsEl.classList.add("hidden");

        recentEventsEmpty.classList.remove("hidden");

        return;

    }


    const cards =
        events.map((event) => {

            const eventDate =
                event.eventDate
                    ? new Date(
                        event.eventDate
                    ).toLocaleDateString(
                        "en-US",
                        {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        }
                    )
                    : "Date not available";

            const status =
                event.status || "draft";

            const statusClasses = {
                published: "bg-green-100 text-green-700",
                draft: "bg-yellow-100 text-yellow-700",
                completed: "bg-blue-100 text-blue-700",
                cancelled: "bg-red-100 text-red-700",
                rejected: "bg-red-100 text-red-700",
            };

            const statusClass =
                statusClasses[status] ||
                "bg-gray-100 text-gray-700";


            return `
                <div
                    class="rounded-3xl bg-white p-6 shadow-soft"
                >
                    <div
                        class="flex items-center justify-between"
                    >
                        <h3
                            class="text-lg font-bold text-gray-900"
                        >
                            ${event.title || "Untitled Event"}
                        </h3>

                        <span
                            class="rounded-full px-3 py-1 text-xs font-semibold ${statusClass}"
                        >
                            ${status}
                        </span>
                    </div>

                    <p
                        class="mt-2 text-sm text-gray-500"
                    >
                        📅 ${eventDate}
                    </p>

                    <p
                        class="mt-1 text-sm text-gray-500"
                    >
                        🎫 ${event.totalSeats || 0} seats
                    </p>
                </div>
            `;

        }).join("");


    recentEventsEl.innerHTML = cards;

    recentEventsEl.classList.remove("hidden");

    recentEventsEmpty.classList.add("hidden");

}


// ========================================
// Update Notification Badge
// ========================================

async function updateNotificationBadge() {

    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (!badge) {
        return;
    }


    const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");


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
                "http://localhost:5000/api/v1/notifications/unread-count",
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


// ========================================
// Load Dashboard
// ========================================

async function loadDashboard() {

    const token = getToken();


    if (!token) {

        window.location.href =
            "../auth/login.html?redirect=../organizer/dashboard.html";

        return;

    }


    dashboardLoading.classList.remove("hidden");

    dashboardError.classList.add("hidden");

    dashboardContent.classList.add("hidden");


    try {

        const response =
            await fetch(
                `${API_URL}/dashboard/organizer`,
                {
                    method: "GET",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                }
            );


        const result =
            await response.json();


        console.log(
            "Organizer Dashboard Response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load dashboard."
            );

        }


        const data =
            result.data || {};


        // ====================================
        // Update user info
        // ====================================

        const storedUser =
            localStorage.getItem("user");

        if (storedUser) {

            try {

                const user =
                    JSON.parse(storedUser);

                if (organizerName && user.name) {
                    organizerName.textContent =
                        user.name;
                }

                if (
                    organizationName &&
                    user.organizationName
                ) {
                    organizationName.textContent =
                        user.organizationName;
                } else if (organizationName) {
                    organizationName.textContent =
                        "Manage your organization and events.";
                }

            } catch (e) {
                // ignore parse error
            }

        }


        // ====================================
        // Update statistics
        // ====================================

        updateStatistics(data);


        // ====================================
        // Load organizer logo
        // ====================================

        await loadOrganizerLogo();


        // ====================================
        // Update recent events
        // ====================================

        if (data.recentEvents && Array.isArray(data.recentEvents)) {
            displayRecentEvents(data.recentEvents);
        } else if (data.recentReviews && Array.isArray(data.recentReviews)) {
            displayRecentEvents([]);
        } else {
            displayRecentEvents([]);
        }


        // ====================================
        // Show content
        // ====================================

        dashboardLoading.classList.add("hidden");

        dashboardError.classList.add("hidden");

        dashboardContent.classList.remove("hidden");


    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

        showDashboardError(
            error.message ||
            "Something went wrong while loading the dashboard."
        );

    }

}


// ========================================
// Retry
// ========================================

retryDashboardButton.addEventListener(
    "click",
    loadDashboard
);


// ========================================
// Start
// ========================================

loadDashboard();

updateNotificationBadge();