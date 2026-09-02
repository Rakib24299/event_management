// ========================================
// EventEase User Notifications
// ========================================


// ========================================
// Configuration
// ========================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";

const SOCKET_URL =
    "http://localhost:5000";


// ========================================
// DOM Elements
// ========================================

const notificationList =
    document.getElementById(
        "notificationList"
    );

const loadingState =
    document.getElementById(
        "loadingState"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const markAllReadBtn =
    document.getElementById(
        "markAllReadBtn"
    );


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
// Get User ID
// ========================================

const getUserId = () => {

    const possibleKeys = [

        "user",

        "currentUser",

        "userData",

        "loggedInUser",

        "userInfo",

    ];


    for (
        const key of possibleKeys
    ) {

        const storedUser =
            localStorage.getItem(
                key
            ) ||
            sessionStorage.getItem(
                key
            );


        if (!storedUser) {
            continue;
        }


        try {

            const parsedUser =
                JSON.parse(
                    storedUser
                );


            const userId =
                parsedUser?._id ||
                parsedUser?.id ||
                parsedUser?.userId;


            if (userId) {

                return userId;

            }

        } catch (error) {

            // Ignore invalid JSON

        }

    }


    // --------------------------------------
    // Direct user ID storage
    // --------------------------------------

    const directUserId =
        localStorage.getItem(
            "userId"
        ) ||
        sessionStorage.getItem(
            "userId"
        );


    return directUserId || null;

};


// ========================================
// Authentication Check
// ========================================

const token =
    getToken();


if (!token) {

    alert(
        "Please login to view your notifications."
    );

    window.location.href =
        "./user-login.html";

}


// ========================================
// API Request Helper
// ========================================

const apiRequest =
    async (
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


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Something went wrong."
            );

        }


        return data;

    };


// ========================================
// Format Date
// ========================================

const formatDate =
    (
        date
    ) => {

        if (!date) {

            return "";

        }


        return new Date(date)
            .toLocaleString(
                "en-US",
                {

                    dateStyle:
                        "medium",

                    timeStyle:
                        "short",

                }
            );

    };


// ========================================
// Get Notification Icon
// ========================================

const getNotificationIcon =
    (
        type
    ) => {

        switch (type) {

            case "booking":

                return "🎟️";


            case "refund":

                return "💰";


            case "payment":

                return "💳";


            case "event":

                return "📅";


            case "approval":

                return "✅";


            case "account":

                return "👤";


            case "system":

                return "⚙️";


            default:

                return "🔔";

        }

    };


// ========================================
// Render Notifications
// ========================================

const renderNotifications =
    (
        notifications
    ) => {

        notificationList.innerHTML =
            "";


        loadingState.classList.add(
            "hidden"
        );


        if (
            !notifications ||
            notifications.length === 0
        ) {

            emptyState.classList.remove(
                "hidden"
            );

            return;

        }


        emptyState.classList.add(
            "hidden"
        );


        notifications.forEach(
            (
                notification
            ) => {

                const isRead =
                    notification.isRead ===
                    true;


                const notificationCard =
                    document.createElement(
                        "div"
                    );


                notificationCard.className =
                    `notification-card rounded-3xl p-5 shadow-soft transition ${
                        isRead
                            ? "bg-gray-100"
                            : "bg-gray-400 text-white"
                    }`;


                notificationCard.innerHTML = `

                    <div class="flex items-start gap-4">

                        <!-- Icon -->

                        <div
                            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                                isRead
                                    ? "bg-gray-100"
                                    : "bg-white"
                            } text-xl"
                        >

                            ${getNotificationIcon(
                                notification.type
                            )}

                        </div>


                        <!-- Content -->

                        <div class="min-w-0 flex-1">

                            <div
                                class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
                            >

                                <div>

                                    <h3
                                        class="font-bold text-gray-900"
                                    >
                                        ${
                                            notification.title ||
                                            "Notification"
                                        }
                                    </h3>


                                    <p
                                        class="mt-1 text-sm leading-6 text-gray-600"
                                    >
                                        ${
                                            notification.message ||
                                            ""
                                        }
                                    </p>

                                </div>


                                ${
                                    !isRead
                                        ? `
                                            <span
                                                class="w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                                            >
                                                New
                                            </span>
                                        `
                                        : ""
                                }

                            </div>


                            <!-- Date -->

                            <p
                                class="mt-3 text-xs text-gray-400"
                            >
                                ${formatDate(
                                    notification.createdAt
                                )}
                            </p>


                            ${
                                !isRead
                                    ? `
                                        <button
                                            type="button"
                                            class="mark-read-btn mt-3 text-sm font-semibold text-primary hover:text-primaryDark"
                                            data-id="${notification._id}"
                                        >
                                            Mark as read
                                        </button>
                                    `
                                    : ""
                            }

                        </div>

                    </div>

                `;


                notificationList.appendChild(
                    notificationCard
                );

            }
        );


        attachMarkReadEvents();

    };


// ========================================
// Load Notifications
// ========================================

const loadNotifications =
    async () => {

        try {

            loadingState.classList.remove(
                "hidden"
            );


            emptyState.classList.add(
                "hidden"
            );


            const result =
                await apiRequest(
                    "/notifications"
                );


            const notifications =
                result.data || [];


            renderNotifications(
                notifications
            );


        } catch (
            error
        ) {

            console.error(
                "Notification loading error:",
                error
            );


            loadingState.classList.add(
                "hidden"
            );


            notificationList.innerHTML = `

                <div
                    class="rounded-3xl bg-white p-8 text-center shadow-soft"
                >

                    <div
                        class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl"
                    >
                        ⚠️
                    </div>


                    <h3
                        class="mt-4 font-bold text-gray-900"
                    >
                        Failed to Load Notifications
                    </h3>


                    <p
                        class="mt-2 text-sm text-gray-500"
                    >
                        ${
                            error.message ||
                            "Please try again later."
                        }
                    </p>


                    <button
                        id="retryBtn"
                        type="button"
                        class="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primaryDark"
                    >
                        Try Again
                    </button>

                </div>

            `;


            const retryBtn =
                document.getElementById(
                    "retryBtn"
                );


            if (retryBtn) {

                retryBtn.addEventListener(
                    "click",
                    loadNotifications
                );

            }

        }

    };


// ========================================
// Mark Single Notification as Read
// ========================================

const markNotificationAsRead =
    async (
        notificationId
    ) => {

        try {

            await apiRequest(
                `/notifications/${notificationId}/read`,
                {

                    method:
                        "PATCH",

                }
            );


            await loadNotifications();


            if (
                typeof updateNotificationBadge ===
                "function"
            ) {

                await updateNotificationBadge();

            }


        } catch (
            error
        ) {

            console.error(
                "Mark notification error:",
                error
            );


            alert(
                error.message ||
                "Failed to mark notification as read."
            );

        }

    };


// ========================================
// Attach Mark Read Events
// ========================================

const attachMarkReadEvents =
    () => {

        const buttons =
            document.querySelectorAll(
                ".mark-read-btn"
            );


        buttons.forEach(
            (
                button
            ) => {

                button.addEventListener(
                    "click",
                    () => {

                        const notificationId =
                            button.dataset.id;


                        if (
                            notificationId
                        ) {

                            markNotificationAsRead(
                                notificationId
                            );

                        }

                    }
                );

            }
        );

    };


// ========================================
// Mark All Notifications as Read
// ========================================

const markAllNotificationsAsRead =
    async () => {

        try {

            markAllReadBtn.disabled =
                true;


            markAllReadBtn.textContent =
                "Updating...";


            await apiRequest(
                "/notifications/mark-all-read",
                {

                    method:
                        "PATCH",

                }
            );


            await loadNotifications();


            if (
                typeof updateNotificationBadge ===
                "function"
            ) {

                await updateNotificationBadge();

            }


        } catch (
            error
        ) {

            console.error(
                "Mark all read error:",
                error
            );


            alert(
                error.message ||
                "Failed to mark all notifications as read."
            );

        } finally {

            markAllReadBtn.disabled =
                false;


            markAllReadBtn.textContent =
                "Mark All as Read";

        }

    };


// ========================================
// Mark All Read Button
// ========================================

if (
    markAllReadBtn
) {

    markAllReadBtn.addEventListener(
        "click",
        markAllNotificationsAsRead
    );

}


// ========================================
// SOCKET.IO CONNECTION
// ========================================

const connectNotificationSocket =
    () => {

        if (
            typeof io !==
            "function"
        ) {

            console.error(
                "❌ Socket.IO client is not loaded."
            );

            return;

        }


        const userId =
            getUserId();


        if (!userId) {

            console.warn(
                "⚠️ User ID not found. Socket room cannot be joined."
            );

            return;

        }


        const socket =
            io(
                SOCKET_URL,
                {

                    transports: [
                        "websocket",
                        "polling",
                    ],

                    reconnection:
                        true,

                    reconnectionAttempts:
                        Infinity,

                    reconnectionDelay:
                        1000,

                }
            );


        // --------------------------------------------
        // SOCKET CONNECTED
        // --------------------------------------------

        socket.on(
            "connect",
            () => {

                console.log(
                    `🔌 Notification Socket connected: ${socket.id}`
                );


                socket.emit(
                    "joinUserRoom",
                    userId
                );


                console.log(
                    `👤 Joined notification room: user_${userId}`
                );

            }
        );


        // --------------------------------------------
        // NEW NOTIFICATION
        // --------------------------------------------

        socket.on(
            "newNotification",
            (
                notification
            ) => {

                console.log(
                    "🔔 New real-time notification:",
                    notification
                );


                // ----------------------------------------
                // Ignore notification for another user
                // ----------------------------------------

                if (
                    notification?.user &&
                    notification.user.toString() !==
                        userId.toString()
                ) {

                    return;

                }


                // ----------------------------------------
                // Reload notification list
                // ----------------------------------------

                loadNotifications();


                // ----------------------------------------
                // Update notification badge
                // ----------------------------------------

                if (
                    typeof updateNotificationBadge ===
                    "function"
                ) {

                    updateNotificationBadge();

                }


                // ----------------------------------------
                // Browser notification
                // ----------------------------------------

                if (
                    "Notification" in window
                ) {

                    if (
                        Notification.permission ===
                        "granted"
                    ) {

                        new Notification(
                            notification.title ||
                            "New Notification",
                            {

                                body:
                                    notification.message ||
                                    "You have a new notification.",

                            }
                        );

                    }

                }

            }
        );


        // --------------------------------------------
        // SOCKET ERROR
        // --------------------------------------------

        socket.on(
            "connect_error",
            (
                error
            ) => {

                console.error(
                    "❌ Notification Socket connection error:",
                    error.message
                );

            }
        );


        // --------------------------------------------
        // SOCKET DISCONNECTED
        // --------------------------------------------

        socket.on(
            "disconnect",
            (
                reason
            ) => {

                console.log(
                    "🔌 Notification Socket disconnected:",
                    reason
                );

            }
        );


        // --------------------------------------------
        // Request Browser Notification Permission
        // --------------------------------------------

        if (
            "Notification" in window &&
            Notification.permission ===
                "default"
        ) {

            Notification.requestPermission()
                .catch(
                    () => {}
                );

        }


        // --------------------------------------------
        // Make socket accessible if needed
        // --------------------------------------------

        window.eventEaseNotificationSocket =
            socket;

    };


// ========================================
// Start Socket Connection
// ========================================

connectNotificationSocket();


// ========================================
// Load Notifications on Page Load
// ========================================

loadNotifications();