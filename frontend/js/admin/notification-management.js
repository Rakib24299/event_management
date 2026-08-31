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

            icon: "📅",

            label: "Event",

            className:
                "bg-blue-100 text-blue-700",

        },

        booking: {

            icon: "🎟️",

            label: "Booking",

            className:
                "bg-green-100 text-green-700",

        },

        payment: {

            icon: "💳",

            label: "Payment",

            className:
                "bg-indigo-100 text-indigo-700",

        },

        refund: {

            icon: "💰",

            label: "Refund",

            className:
                "bg-purple-100 text-purple-700",

        },

        approval: {

            icon: "✅",

            label: "Approval",

            className:
                "bg-amber-100 text-amber-700",

        },

        system: {

            icon: "⚙️",

            label: "System",

            className:
                "bg-gray-100 text-gray-700",

        },

    };


    return (
        configs[type] || {

            icon: "🔔",

            label: "Notification",

            className:
                "bg-gray-100 text-gray-700",

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


        totalNotifications.textContent =
            total;


        unreadNotifications.textContent =
            unread;


        readNotifications.textContent =
            read;

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
                    bg-white p-5 shadow-sm
                    transition hover:shadow-md
                    ${
                        isUnread
                            ? "border-primary/20 bg-primaryLight/10"
                            : "border-gray-100"
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
                                    class="font-bold text-gray-900"
                                >
                                    ${escapeHTML(
                                        notification.title ||
                                        "Notification"
                                    )}
                                </h3>


                                ${
                                    isUnread
                                        ? `
                                            <span
                                                class="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                                            >
                                                New
                                            </span>
                                          `
                                        : ""
                                }

                            </div>


                            <p
                                class="mt-2 text-sm leading-6 text-gray-600"
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

                            <button
                                type="button"
                                class="viewNotificationBtn rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                data-id="${escapeHTML(id)}"
                            >
                                View
                            </button>


                            ${
                                isUnread
                                    ? `
                                        <button
                                            type="button"
                                            class="markReadBtn rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primaryDark"
                                            data-id="${escapeHTML(id)}"
                                        >
                                            Read
                                        </button>
                                      `
                                    : ""
                            }


                            <button
                                type="button"
                                class="deleteNotificationBtn rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                data-id="${escapeHTML(id)}"
                            >
                                Delete
                            </button>

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

        const viewButtons =
            document.querySelectorAll(
                ".viewNotificationBtn"
            );


        viewButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openNotification(
                            button.dataset.id
                        );

                    }
                );

            }
        );


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


        const deleteButtons =
            document.querySelectorAll(
                ".deleteNotificationBtn"
            );


        deleteButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteNotification(
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
                id,
                false
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
    id,
    reload = true
) => {

    try {

        await apiRequest(
            `/notifications/${id}/read`,
            {
                method: "PATCH",
            }
        );


        if (reload) {

            await loadNotifications();

        }

    } catch (error) {

        console.error(
            "Mark notification read error:",
            error
        );

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
// Delete Notification
// ========================================

const deleteNotification = async (
    id
) => {

    const confirmed =
        confirm(
            "Are you sure you want to delete this notification?"
        );


    if (!confirmed) {

        return;

    }


    try {

        await apiRequest(
            `/notifications/${id}`,
            {
                method: "DELETE",
            }
        );


        await loadNotifications();

    } catch (error) {

        console.error(
            "Delete notification error:",
            error
        );

        alert(
            error.message ||
            "Failed to delete notification."
        );

    }

};


// ========================================
// Filter Notifications
// ========================================

const filterNotifications = () => {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedType =
        normalizeType(
            typeFilter.value
        );


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

    searchInput.value = "";

    typeFilter.value = "all";

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