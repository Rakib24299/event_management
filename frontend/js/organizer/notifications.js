// ========================================
// EventEase Organizer Notifications
// ========================================



// ========================================
// Configuration
// ========================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";



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
// Authentication Check
// ========================================

const token = getToken();



if (!token) {

    alert(
        "Please login to view your notifications."
    );

    window.location.href =
        "./organizer-login.html";

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

const formatDate = (
    date
) => {

    if (!date) {

        return "";

    }



    return new Date(date)
        .toLocaleString(
            "en-US",
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        );

};



// ========================================
// Get Notification Icon
// ========================================

const getNotificationIcon = (
    type
) => {

    switch (type) {

        case "booking":

            return "🎟️";



        case "event":

            return "📅";



        case "refund":

            return "💰";



        case "system":

            return "⚙️";



        case "approval":

            return "✅";



        default:

            return "🔔";

    }

};



// ========================================
// Render Notifications
// ========================================

const renderNotifications = (
    notifications
) => {

    notificationList.innerHTML = "";


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
        (notification) => {

            const isRead =
                notification.isRead === true;



            const notificationCard =
                document.createElement(
                    "div"
                );



            // ====================================
            // Notification Card Color
            // ====================================

            notificationCard.className =
                `notification-card rounded-3xl p-5 shadow-soft transition ${
                    isRead
                        ? "bg-gray-100"
                        : "bg-gray-400"
                }`;



            notificationCard.innerHTML = `

                <div class="flex items-start gap-4">



                    <!-- Icon -->

                    <div
                        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                            isRead
                                ? "bg-white"
                                : "bg-gray-300"
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



                                <!-- Title -->

                                <h3
                                    class="font-bold text-gray-900"
                                >

                                    ${
                                        notification.title ||
                                        "Notification"
                                    }

                                </h3>





                                <!-- Message -->

                                <p
                                    class="mt-1 text-sm leading-6 ${
                                        isRead
                                            ? "text-gray-600"
                                            : "text-gray-700"
                                    }"
                                >

                                    ${
                                        notification.message ||
                                        ""
                                    }

                                </p>



                            </div>





                            <!-- New Badge -->

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
                            class="mt-3 text-xs ${
                                isRead
                                    ? "text-gray-400"
                                    : "text-gray-600"
                            }"
                        >

                            ${formatDate(
                                notification.createdAt
                            )}

                        </p>





                        <!-- Mark As Read -->

                        ${
                            !isRead
                                ? `

                                    <button
                                        type="button"
                                        class="mark-read-btn mt-3 text-sm font-semibold text-primary hover:underline"
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



        } catch (error) {

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
                    method: "PATCH",
                }
            );



            await loadNotifications();



        } catch (error) {

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
            (button) => {

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
                "/notifications/read-all",
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

if (markAllReadBtn) {

    markAllReadBtn.addEventListener(
        "click",
        markAllNotificationsAsRead
    );

}



// ========================================
// Load Notifications on Page Load
// ========================================

loadNotifications();