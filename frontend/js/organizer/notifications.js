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
            return '<svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>';

        case "event":
            return '<svg class="h-4 w-4 inline-block text-current align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';

        case "refund":
            return '<svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';

        case "system":
            return '<svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';

        case "approval":
            return '<svg class="h-4 w-4 text-emerald-600 inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>';

        case "account":
            return '<svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';

        default:
            return '<svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>';

    }

};



// ========================================
// Get Type Label
// ========================================

const getTypeLabel = (
    type
) => {

    switch (type) {

        case "booking":

            return "Booking";



        case "event":

            return "Event";



        case "refund":

            return "Refund";



        case "system":

            return "System";



        case "approval":

            return "Approval";



        case "account":

            return "Account";



        case "payment":

            return "Payment";



        default:

            return "Notification";

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





                        <!-- Date and Type -->

                        <div
                            class="mt-3 flex flex-wrap items-center gap-2 text-xs ${
                                isRead
                                    ? "text-gray-400"
                                    : "text-gray-600"
                            }"
                        >

                            <span
                                class="rounded-full bg-gray-200 px-2 py-0.5 font-semibold text-gray-600"
                            >

                                ${getTypeLabel(
                                    notification.type
                                )}

                            </span>

                            <span>
                                ${formatDate(
                                    notification.createdAt
                                )}
                            </span>

                        </div>





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
                        <svg class="h-5 w-5 text-amber-500 inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
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



            if (typeof updateNotificationBadge === "function") {

                await updateNotificationBadge();

            }



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
                "/notifications/mark-all-read",
                {
                    method: "PATCH",
                }
            );



            await loadNotifications();



            if (typeof updateNotificationBadge === "function") {

                await updateNotificationBadge();

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

        } finally {

            markAllReadBtn.disabled =
                false;



            markAllReadBtn.textContent =
                "Mark All as Read";

        }

    };



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