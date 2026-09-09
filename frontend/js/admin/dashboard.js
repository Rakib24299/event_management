// ========================================
// EventEase Admin Dashboard
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

const dashboardContent =
    document.getElementById("dashboardContent");

const errorState =
    document.getElementById("errorState");

const errorMessage =
    document.getElementById("errorMessage");

const retryBtn =
    document.getElementById("retryBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


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
        "Please login as admin to access the dashboard."
    );

    window.location.href =
        "./admin-login.html";

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
            "Invalid response from server."
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
// Format Currency
// ========================================

const formatCurrency = (
    amount
) => {

    return `৳${Number(
        amount || 0
    ).toLocaleString("en-BD")}`;

};


// ========================================
// Format Date
// ========================================

const formatDate = (
    date
) => {

    if (!date) {

        return "";

    }


    return new Date(date)
        .toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );

};


// ========================================
// Set Element Text
// ========================================

const setText = (
    id,
    value
) => {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

};


// ========================================
// Render Pending Organizers
// ========================================

const renderPendingOrganizers = (
    organizers
) => {

    const container =
        document.getElementById(
            "pendingOrganizerList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    // ====================================
    // No Pending Organizers
    // ====================================

    if (
        !organizers ||
        organizers.length === 0
    ) {

        container.innerHTML = `

            <div
                class="rounded-2xl bg-gray-50 p-6 text-center"
            >

                <div class="text-3xl">
                    <svg class="h-5 w-5 text-primary inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>

                <p
                    class="mt-3 font-semibold text-gray-800"
                >
                    No Pending Organizers
                </p>

                <p
                    class="mt-1 text-sm text-gray-500"
                >
                    There are no organizer applications waiting for approval.
                </p>

            </div>

        `;

        return;

    }


    // ====================================
    // Render Organizers
    // ====================================

    organizers
        .slice(0, 5)
        .forEach(
            (organizer) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "flex items-center justify-between gap-4 rounded-2xl border border-gray-100 p-4 transition hover:bg-gray-50";


                const organizationName =
                    organizer.organizationName ||
                    "Organization";


                const organizerName =
                    organizer.name ||
                    "Organizer";


                const profileImage =
                    organizer.profileImage?.url ||
                    organizer.profileImage ||
                    null;


                card.innerHTML = `

                    <div
                        class="flex min-w-0 items-center gap-3"
                    >

                        <div
                            class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary"
                        >

                            ${
                                profileImage
                                    ? `
                                        <img
                                            src="${profileImage}"
                                            alt="Organizer"
                                            class="h-full w-full object-cover"
                                        >
                                      `
                                    : `
                                        <span class="text-lg">
                                            <svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </span>
                                      `
                            }

                        </div>


                        <div class="min-w-0">

                            <p
                                class="truncate font-semibold text-gray-900"
                            >
                                ${organizerName}
                            </p>


                            <p
                                class="truncate text-xs text-gray-500"
                            >
                                ${organizationName}
                            </p>


                            <p
                                class="mt-1 text-xs text-gray-400"
                            >
                                Applied ${formatDate(
                                    organizer.createdAt
                                )}
                            </p>

                        </div>

                    </div>


                    <span
                        class="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
                    >
                        Pending
                    </span>

                `;


                container.appendChild(
                    card
                );

            }
        );

};


// ========================================
// Load Dashboard Statistics
// ========================================

const loadDashboard = async () => {

    try {

        // ====================================
        // Show Loading
        // ====================================

        if (loadingState) {

            loadingState.classList.remove(
                "hidden"
            );

        }


        if (dashboardContent) {

            dashboardContent.classList.add(
                "hidden"
            );

        }


        if (errorState) {

            errorState.classList.add(
                "hidden"
            );

        }


        // ====================================
        // Get Dashboard Statistics
        // ====================================

        const result =
            await apiRequest(
                "/admin/dashboard-stats"
            );


        const stats =
            result.data || {};


        // ====================================
        // Update Statistics
        // ====================================

        setText(
            "totalUsers",
            stats.totalUsers || 0
        );


        setText(
            "totalOrganizers",
            stats.totalOrganizers || 0
        );


        setText(
            "pendingOrganizerCount",
            stats.pendingOrganizers || 0
        );


        setText(
            "totalEvents",
            stats.totalEvents || 0
        );


        setText(
            "activeEvents",
            stats.activeEvents || 0
        );


        setText(
            "completedEvents",
            stats.completedEvents || 0
        );


        setText(
            "totalBookings",
            stats.totalBookings || 0
        );


        setText(
            "confirmedBookings",
            stats.confirmedBookings || 0
        );


        setText(
            "totalTickets",
            stats.totalTickets || 0
        );


        setText(
            "totalRevenue",
            formatCurrency(
                stats.totalRevenue || 0
            )
        );


        // ====================================
        // Get Pending Organizers
        // ====================================

        const organizerResult =
            await apiRequest(
                "/admin/pending-organizers"
            );


        const organizers =
            organizerResult.data || [];


        // ====================================
        // Render Pending Organizers
        // ====================================

        renderPendingOrganizers(
            organizers
        );


        // ====================================
        // Hide Loading
        // ====================================

        if (loadingState) {

            loadingState.classList.add(
                "hidden"
            );

        }


        if (dashboardContent) {

            dashboardContent.classList.remove(
                "hidden"
            );

        }

    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );


        // ====================================
        // Hide Loading
        // ====================================

        if (loadingState) {

            loadingState.classList.add(
                "hidden"
            );

        }


        if (dashboardContent) {

            dashboardContent.classList.add(
                "hidden"
            );

        }


        // ====================================
        // Show Error
        // ====================================

        if (errorState) {

            errorState.classList.remove(
                "hidden"
            );

        }


        if (errorMessage) {

            errorMessage.textContent =
                error.message ||
                "Failed to load dashboard.";

        }

    }

};


// ========================================
// Retry Button
// ========================================

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        loadDashboard
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
// Load Dashboard on Page Load
// ========================================

loadDashboard();

updateNotificationBadge();