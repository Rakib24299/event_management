// ========================================
// EventEase Admin Notification Management
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

const notificationsSection =
    document.getElementById("notificationsSection");

const notificationsContainer =
    document.getElementById("notificationsContainer");

const emptyState =
    document.getElementById("emptyState");

const notificationCountText =
    document.getElementById("notificationCountText");


// ========================================
// Statistics
// ========================================

const totalNotifications =
    document.getElementById("totalNotifications");

const unreadNotifications =
    document.getElementById("unreadNotifications");

const readNotifications =
    document.getElementById("readNotifications");


// ========================================
// Filters
// ========================================

const searchInput =
    document.getElementById("searchInput");

const typeFilter =
    document.getElementById("typeFilter");

const clearFiltersBtn =
    document.getElementById("clearFiltersBtn");


// ========================================
// Buttons
// ========================================

const refreshBtn =
    document.getElementById("refreshBtn");

const markAllReadBtn =
    document.getElementById("markAllReadBtn");


// ========================================
// Modal
// ========================================

const notificationModal =
    document.getElementById("notificationModal");

const modalTitle =
    document.getElementById("modalTitle");

const modalContent =
    document.getElementById("modalContent");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const closeModalFooterBtn =
    document.getElementById("closeModalFooterBtn");


// ========================================
// Token
// ========================================

const getToken = () => {

    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );

};


// ========================================
// Authentication
// ========================================

const token = getToken();


if (!token) {

    alert(
        "Please login to access notifications."
    );

    window.location.href =
        "./admin-login.html";

}


// ========================================
// Global Data
// ========================================

let allNotifications = [];


// ========================================
// API Request
// ========================================

const apiRequest = async (
    endpoint,
    options = {}
) => {

    const currentToken =
        getToken();


    if (!currentToken) {

        throw new Error(
            "Authentication token not found. Please login again."
        );

    }


    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {

                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${currentToken}`,

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
            data.error ||
            `Request failed with status ${response.status}`
        );

    }


    return data;

};


// ========================================
// Escape HTML
// ========================================

const escapeHTML = (value) => {

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

const formatDateTime = (date) => {

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
        "en-BD",
        {

            day: "2-digit",

            month: "short",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit",

        }
    );

};


// ========================================
// Normalize Type
// ========================================

const normalizeType = (type) => {

    return String(type || "")
        .trim()
        .toLowerCase();

};


// ========================================
// Notification Type
// ========================================

const getNotificationType =
    (notification) => {

        return normalizeType(
            notification.type
        );

    };


// ========================================
// Type Configuration
// ========================================

const getTypeConfig = (type) => {

    const configs = {

        event: {
            icon: '<svg class="h-4 w-4 inline-block text-current align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
            label: "Event",
            className: "bg-blue-100 text-blue-700",
        },
        booking: {
            icon: '<svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>',
            label: "Booking",
            className: "bg-green-100 text-green-700",
        },
        payment: {
            icon: '<svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>',
            label: "Payment",
            className: "bg-indigo-100 text-indigo-700",
        },
        refund: {
            icon: '<svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
            label: "Refund",
            className: "bg-purple-100 text-purple-700",
        },
        approval: {
            icon: '<svg class="h-4 w-4 text-emerald-600 inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>',
            label: "Approval",
            className: "bg-amber-100 text-amber-700",
        },
        system: {
            icon: '<svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
            label: "System",
            className: "bg-gray-100 text-gray-700",
        },

    };


    return (
        configs[type] || {

            icon: '<svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>',
            label: "Notification",
            className: "bg-gray-100 text-gray-700",
        }
    );

};


// ========================================
// Extract Notifications
// ========================================

const extractNotifications =
    (result) => {

        if (
            Array.isArray(result)
        ) {

            return result;

        }


        if (
            Array.isArray(result.data)
        ) {

            return result.data;

        }


        if (
            result.data &&
            Array.isArray(
                result.data.notifications
            )
        ) {

            return result.data.notifications;

        }


        if (
            Array.isArray(
                result.notifications
            )
        ) {

            return result.notifications;

        }


        return [];

    };


// ========================================
// Update Statistics
// ========================================

const updateStatistics =
    (notifications) => {

        if (!notifications) return;

        const total =
            notifications.length;


        const unread =
            notifications.filter(
                notification =>
                    notification.isRead !== true
            ).length;


        const read =
            notifications.filter(
                notification =>
                    notification.isRead === true
            ).length;


        if (totalNotifications) {
            totalNotifications.textContent = total;
        }

        if (unreadNotifications) {
            unreadNotifications.textContent = unread;
        }

        if (readNotifications) {
            readNotifications.textContent = read;
        }

    };


// ========================================
// Render Empty State
// ========================================

const renderEmptyState = () => {

    notificationsSection.classList.add(
        "hidden"
    );

    emptyState.classList.remove(
        "hidden"
    );

};


// ========================================
// Render Notifications
// ========================================

const renderNotifications =
    (notifications) => {

        notificationsContainer.innerHTML =
            "";


        if (
            !notifications ||
            notifications.length === 0
        ) {

            renderEmptyState();

            return;

        }


        emptyState.classList.add(
            "hidden"
        );

        notificationsSection.classList.remove(
            "hidden"
        );


        notificationCountText.textContent =
            `${notifications.length} ${
                notifications.length === 1
                    ? "notification"
                    : "notifications"
            }`;


        notifications.forEach(
            notification => {

                const card =
                    document.createElement(
                        "div"
                    );


                const type =
                    getNotificationType(
                        notification
                    );


                const config =
                    getTypeConfig(type);


                const isUnread =
                    notification.isRead !== true;


                card.className =
                    `
                    group rounded-2xl border
                    p-5 shadow-sm
                    transition-all duration-200 hover:shadow-md
                    ${
                        isUnread
                            ? "border-gray-200/90 bg-gray-100 hover:bg-gray-200/70"
                            : "border-gray-100 bg-white"
                    }
                    `;


                const id =
                    notification._id ||
                    notification.id ||
                    "";


                card.innerHTML =
                    `

                    <div
                        class="flex items-start gap-4"
                    >

                        <!-- ICON -->

                        <div
                            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${config.className}"
                        >
                            ${config.icon}
                        </div>


                        <!-- CONTENT -->

                        <div
                            class="min-w-0 flex-1"
                        >

                            <div
                                class="flex flex-wrap items-center gap-2"
                            >

                                <h3
                                    class="font-bold ${
                                        isUnread
                                            ? "text-gray-900 font-bold"
                                            : "text-gray-700 font-medium"
                                    }"
                                >
                                    ${escapeHTML(
                                        notification.title ||
                                        "Notification"
                                    )}
                                </h3>


                            </div>


                            <p
                                class="mt-2 text-sm leading-6 ${
                                    isUnread
                                        ? "text-gray-700 font-medium"
                                        : "text-gray-500"
                                }"
                            >
                                ${escapeHTML(
                                    notification.message ||
                                    ""
                                )}
                            </p>


                            <div
                                class="mt-3 flex flex-wrap items-center gap-3"
                            >

                                <span
                                    class="rounded-full px-3 py-1 text-xs font-semibold ${config.className}"
                                >
                                    ${escapeHTML(
                                        config.label
                                    )}
                                </span>


                                <span
                                    class="text-xs text-gray-400"
                                >
                                    ${escapeHTML(
                                        formatDateTime(
                                            notification.createdAt
                                        )
                                    )}
                                </span>

                            </div>

                        </div>


                        <!-- ACTIONS -->

                        <div
                            class="flex shrink-0 flex-col gap-2"
                        >

                            ${
                                isUnread
                                    ? `
                                        <button
                                            type="button"
                                            class="markReadBtn rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primaryDark"
                                            data-id="${escapeHTML(id)}"
                                        >
                                            Mark as Read
                                        </button>
                                      `
                                    : ""
                            }

                        </div>

                    </div>

                    `;


                notificationsContainer.appendChild(
                    card
                );

            }
        );


        attachNotificationListeners();

    };


// ========================================
// Attach Listeners
// ========================================

const attachNotificationListeners =
    () => {

        const readButtons =
            document.querySelectorAll(
                ".markReadBtn"
            );


        readButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        markAsRead(
                            button.dataset.id
                        );

                    }
                );

            }
        );

    };


// ========================================
// Open Notification
// ========================================

const openNotification =
    (id) => {

        const notification =
            allNotifications.find(
                item =>
                    String(
                        item._id ||
                        item.id
                    ) === String(id)
            );


        if (!notification) {

            alert(
                "Notification not found."
            );

            return;

        }


        const type =
            getNotificationType(
                notification
            );


        const config =
            getTypeConfig(type);


        modalTitle.textContent =
            notification.title ||
            "Notification";


        modalContent.innerHTML =
            `

            <div class="text-center">

                <div
                    class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${config.className}"
                >
                    ${config.icon}
                </div>


                <span
                    class="mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}"
                >
                    ${escapeHTML(
                        config.label
                    )}
                </span>

            </div>


            <div class="mt-6">

                <p
                    class="text-sm leading-7 text-gray-600"
                >
                    ${escapeHTML(
                        notification.message ||
                        ""
                    )}
                </p>

            </div>


            <div
                class="mt-6 rounded-xl bg-gray-50 p-4"
            >

                <p
                    class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                >
                    Received
                </p>

                <p
                    class="mt-1 text-sm font-semibold text-gray-700"
                >
                    ${escapeHTML(
                        formatDateTime(
                            notification.createdAt
                        )
                    )}
                </p>

            </div>

            `;


        notificationModal.classList.remove(
            "hidden"
        );

        notificationModal.classList.add(
            "flex"
        );


        if (
            notification.isRead !== true
        ) {

            markAsRead(
                id
            );

        }

    };


// ========================================
// Close Modal
// ========================================

const closeModal = () => {

    notificationModal.classList.add(
        "hidden"
    );

    notificationModal.classList.remove(
        "flex"
    );

};


// ========================================
// Mark As Read
// ========================================

const markAsRead = async (
    id
) => {

    const notification =
        allNotifications.find(
            item =>
                String(
                    item._id ||
                    item.id
                ) === String(id)
        );


    if (
        !notification ||
        notification.isRead === true
    ) {

        return;

    }


    const button = Array.from(
        document.querySelectorAll(
            ".markReadBtn"
        )
    ).find(
        btn =>
            btn.dataset.id ===
            String(id)
    );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Marking...";

        button.classList.add(
            "opacity-75",
            "cursor-not-allowed"
        );

    }


    try {

        await apiRequest(
            `/notifications/${id}/read`,
            {
                method: "PATCH",
            }
        );


        notification.isRead =
            true;


        if (button) {

            const card =
                button.closest(
                    ".group"
                );


            if (card) {

                card.classList.remove(
                    "border-gray-200",
                    "bg-gray-50"
                );

                card.classList.add(
                    "border-gray-100",
                    "bg-white"
                );

            }


            const titleEl =
                card?.querySelector(
                    "h3"
                );


            if (titleEl) {

                titleEl.classList.remove(
                    "text-gray-700"
                );

                titleEl.classList.add(
                    "text-gray-900"
                );

            }


            const messageEl =
                card?.querySelector(
                    "p.leading-6"
                );


            if (messageEl) {

                messageEl.classList.remove(
                    "text-gray-500"
                );

                messageEl.classList.add(
                    "text-gray-600"
                );

            }


            button.remove();

        }


        updateStatistics(
            allNotifications
        );


        if (
            typeof updateNotificationBadge ===
            "function"
        ) {

            updateNotificationBadge();

        }

    } catch (error) {

        console.error(
            "Mark notification read error:",
            error
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Mark as Read";

            button.classList.remove(
                "opacity-75",
                "cursor-not-allowed"
            );

        }


        alert(
            error.message ||
            "Failed to mark notification as read."
        );

    }

};


// ========================================
// Mark All As Read
// ========================================

const markAllAsRead = async () => {

    try {

        await apiRequest(
            "/notifications/mark-all-read",
            {
                method: "PATCH",
            }
        );


        await loadNotifications();


        if (
            typeof updateNotificationBadge ===
            "function"
        ) {

            updateNotificationBadge();

        }

    } catch (error) {

        console.error(
            "Mark all read error:",
            error
        );

        alert(
            error.message ||
            "Failed to mark all notifications as read."
        );

    }

};


// ========================================
// Filter Notifications
// ========================================

const filterNotifications = () => {

    const search =
        (searchInput ? searchInput.value : "")
            .trim()
            .toLowerCase();


    const selectedType =
        typeFilter
            ? normalizeType(typeFilter.value)
            : "all";


    const filtered =
        allNotifications.filter(
            notification => {

                const title =
                    String(
                        notification.title ||
                        ""
                    ).toLowerCase();


                const message =
                    String(
                        notification.message ||
                        ""
                    ).toLowerCase();


                const type =
                    getNotificationType(
                        notification
                    );


                const matchesSearch =
                    !search ||
                    title.includes(search) ||
                    message.includes(search);


                const matchesType =
                    selectedType === "all" ||
                    type === selectedType;


                return (
                    matchesSearch &&
                    matchesType
                );

            }
        );


    renderNotifications(
        filtered
    );

};


// ========================================
// Clear Filters
// ========================================

const clearFilters = () => {

    if (searchInput) searchInput.value = "";

    if (typeFilter) typeFilter.value = "all";

    renderNotifications(
        allNotifications
    );

};


// ========================================
// Load Notifications
// ========================================

const loadNotifications = async () => {

    try {

        // Loading

        loadingState.classList.remove(
            "hidden"
        );

        errorState.classList.add(
            "hidden"
        );

        notificationsSection.classList.add(
            "hidden"
        );

        emptyState.classList.add(
            "hidden"
        );


        // API

        console.log(
            "Loading notifications from:",
            `${API_BASE_URL}/notifications`
        );


        const result =
            await apiRequest(
                "/notifications"
            );


        console.log(
            "Notifications API response:",
            result
        );


        // Extract

        allNotifications =
            extractNotifications(
                result
            );


        console.log(
            "Notifications:",
            allNotifications
        );


        // Statistics

        updateStatistics(
            allNotifications
        );


        // Render

        renderNotifications(
            allNotifications
        );


        // Hide Loading

        loadingState.classList.add(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Load notifications error:",
            error
        );


        loadingState.classList.add(
            "hidden"
        );


        notificationsSection.classList.add(
            "hidden"
        );


        emptyState.classList.add(
            "hidden"
        );


        errorState.classList.remove(
            "hidden"
        );


        errorMessage.textContent =
            error.message ||
            "Failed to load notifications.";

    }

};


// ========================================
// Search
// ========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterNotifications
    );

}


// ========================================
// Type Filter
// ========================================

if (typeFilter) {

    typeFilter.addEventListener(
        "change",
        filterNotifications
    );

}


// ========================================
// Clear Filter
// ========================================

if (clearFiltersBtn) {

    clearFiltersBtn.addEventListener(
        "click",
        clearFilters
    );

}


// ========================================
// Refresh
// ========================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        loadNotifications
    );

}


// ========================================
// Mark All Read
// ========================================

if (markAllReadBtn) {

    markAllReadBtn.addEventListener(
        "click",
        markAllAsRead
    );

}


// ========================================
// Modal Close
// ========================================

if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        closeModal
    );

}


if (closeModalFooterBtn) {

    closeModalFooterBtn.addEventListener(
        "click",
        closeModal
    );

}


// ========================================
// Outside Modal Click
// ========================================

if (notificationModal) {

    notificationModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                notificationModal
            ) {

                closeModal();

            }

        }
    );

}


// ========================================
// Escape Key
// ========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            notificationModal &&
            !notificationModal.classList.contains(
                "hidden"
            )
        ) {

            closeModal();

        }

    }
);


// ========================================
// Retry
// ========================================

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        loadNotifications
    );

}


// ========================================
// Initial Load
// ========================================

loadNotifications();