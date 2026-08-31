// ========================================
// EventEase User Dashboard
// ========================================

const API_URL = "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const welcomeName =
    document.getElementById("welcomeName");

const dashboardProfileImage =
    document.getElementById("dashboardProfileImage");

const dashboardProfileInitial =
    document.getElementById("dashboardProfileInitial");


const recentBookingsLoading =
    document.getElementById("recentBookingsLoading");

const recentBookingsEmpty =
    document.getElementById("recentBookingsEmpty");

const recentBookingsList =
    document.getElementById("recentBookingsList");


// ========================================
// Token
// ========================================

function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken") ||
        sessionStorage.getItem("authToken")
    );

}


const token =
    getToken();


// ========================================
// Check Authentication
// ========================================

if (!token) {

    window.location.replace(
        "./user-login.html"
    );

}


window.addEventListener(
    "pageshow",
    () => {

        const currentToken =
            getToken();


        if (!currentToken) {

            window.location.replace(
                "./user-login.html"
            );

        }

    }
);


// ========================================
// Get Initial
// ========================================

function getInitial(name) {

    if (!name) {
        return "U";
    }

    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


// ========================================
// Format Date
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "Date not available";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

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
        return "Free";
    }

    if (Number(price) === 0) {
        return "Free";
    }

    return `৳${Number(price).toLocaleString()}`;

}


// ========================================
// Get Event From Booking
// ========================================

function getBookingEvent(booking) {

    return (
        booking.event ||
        booking.eventId ||
        {}
    );

}


// ========================================
// Display User
// ========================================

function displayUser(user) {

    if (!user) {
        return;
    }


    const name =
        user.name ||
        "User";


    welcomeName.textContent =
        name;


    dashboardProfileInitial.textContent =
        getInitial(name);


    const profileUrl =
        user.profileImage?.url ||
        "";


    if (profileUrl) {

        dashboardProfileImage.src =
            profileUrl;

        dashboardProfileImage.classList.remove(
            "hidden"
        );

        dashboardProfileInitial.classList.add(
            "hidden"
        );

    }

}


// ========================================
// Create Booking Card
// ========================================

function createBookingCard(booking) {

    const event =
        getBookingEvent(booking);


    const eventTitle =
        event.title ||
        booking.eventTitle ||
        "Event";


    const eventImage =
        event.bannerImage?.url ||
        event.image ||
        booking.eventImage ||
        "https://via.placeholder.com/600x350?text=EventEase";


    const eventDate =
        event.eventDate ||
        event.date ||
        booking.eventDate;


    const location =
        event.location ||
        event.venue ||
        booking.location ||
        "Location not available";


    const quantity =
        Number(
            booking.numberOfTickets ||
            booking.quantity ||
            booking.tickets ||
            1
        );


    const price =
        booking.totalAmount ??
        booking.totalPrice ??
        booking.amount ??
        0;


    const bookingStatus =
        booking.bookingStatus ||
        booking.status ||
        "pending";


    const bookingId =
        booking._id ||
        booking.id ||
        "";


    const statusClass =
        bookingStatus === "confirmed"
            ? "bg-primaryLight text-primary"
            : "bg-yellow-50 text-yellow-700";


    return `

        <div
            class="overflow-hidden rounded-3xl bg-white shadow-soft"
        >

            <div class="flex flex-col sm:flex-row">


                <!-- Event Image -->

                <div class="h-48 sm:h-auto sm:w-52">

                    <img
                        src="${eventImage}"
                        alt="${eventTitle}"
                        class="h-full w-full object-cover"
                        onerror="this.src='https://via.placeholder.com/600x350?text=EventEase'"
                    >

                </div>


                <!-- Booking Information -->

                <div class="flex flex-1 flex-col justify-between p-5">


                    <div>

                        <div
                            class="flex flex-wrap items-start justify-between gap-3"
                        >

                            <h3
                                class="text-lg font-bold text-gray-900"
                            >
                                ${eventTitle}
                            </h3>


                            <span
                                class="rounded-full px-3 py-1 text-xs font-semibold ${statusClass}"
                            >
                                ${bookingStatus}
                            </span>

                        </div>


                        <div class="mt-4 space-y-2">

                            <p class="text-sm text-gray-500">

                                📅

                                <span class="ml-1">
                                    ${formatDate(eventDate)}
                                </span>

                            </p>


                            <p class="text-sm text-gray-500">

                                📍

                                <span class="ml-1">
                                    ${location}
                                </span>

                            </p>


                            <p class="text-sm text-gray-500">

                                🎫

                                <span class="ml-1">
                                    ${quantity} Ticket${quantity > 1 ? "s" : ""}
                                </span>

                            </p>

                        </div>

                    </div>


                    <div
                        class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4"
                    >

                        <div>

                            <p class="text-xs text-gray-400">
                                Total Amount
                            </p>

                            <p
                                class="font-bold text-primary"
                            >
                                ${formatPrice(price)}
                            </p>

                        </div>


                        ${
                            bookingId
                                ? `
                                    <a
                                        href="./booking-details.html?id=${bookingId}"
                                        class="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-primaryDark"
                                    >
                                        View Details
                                    </a>
                                  `
                                : ""
                        }

                    </div>

                </div>

            </div>

        </div>

    `;

}


// ========================================
// Display Recent Bookings
// ========================================

function displayRecentBookings(bookings) {

    recentBookingsLoading.classList.add(
        "hidden"
    );


    if (
        !Array.isArray(bookings) ||
        bookings.length === 0
    ) {

        recentBookingsList.classList.add(
            "hidden"
        );

        recentBookingsEmpty.classList.remove(
            "hidden"
        );

        return;

    }


    recentBookingsEmpty.classList.add(
        "hidden"
    );


    const recentBookings =
        bookings.slice(0, 3);


    recentBookingsList.innerHTML =
        recentBookings
            .map(createBookingCard)
            .join("");


    recentBookingsList.classList.remove(
        "hidden"
    );

}


// ========================================
// Fetch Profile
// ========================================

async function loadProfile() {

    const response =
        await fetch(
            `${API_URL}/users/me`,
            {
                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );


    const result =
        await response.json();


    console.log(
        "Dashboard Profile Response:",
        result
    );


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            "Failed to load profile."
        );

    }


    const user =
        result.data;


    displayUser(user);

}


// ========================================
// Fetch Bookings
// ========================================

async function loadBookings() {

    const response =
        await fetch(
            `${API_URL}/bookings/my`,
            {
                method: "GET",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );


    const result =
        await response.json();


    console.log(
        "Dashboard Bookings Response:",
        result
    );


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            "Failed to load bookings."
        );

    }


    let bookings =
        result.data;


    /*
     * Support different backend
     * response structures.
     */

    if (
        result.data &&
        Array.isArray(result.data.bookings)
    ) {

        bookings =
            result.data.bookings;

    }


    if (
        result.data &&
        Array.isArray(result.data.items)
    ) {

        bookings =
            result.data.items;

    }


    if (!Array.isArray(bookings)) {

        bookings = [];

    }


    /*
     * Latest bookings first
     */

    bookings.sort(
        (a, b) => {

            const dateA =
                new Date(
                    a.createdAt || 0
                );

            const dateB =
                new Date(
                    b.createdAt || 0
                );

            return dateB - dateA;

        }
    );


    displayRecentBookings(
        bookings
    );

}


// ========================================
// Load Dashboard
// ========================================

async function loadDashboard() {

    try {

        /*
         * Profile and bookings
         * load independently.
         */

        const results =
            await Promise.allSettled([
                loadProfile(),
                loadBookings()
            ]);


        const profileResult =
            results[0];

        const bookingsResult =
            results[1];


        if (
            profileResult.status ===
                "rejected"
        ) {

            console.error(
                "Dashboard Profile Error:",
                profileResult.reason
            );

        }


        if (
            bookingsResult.status ===
                "rejected"
        ) {

            console.error(
                "Dashboard Bookings Error:",
                bookingsResult.reason
            );


            recentBookingsLoading.classList.add(
                "hidden"
            );


            recentBookingsEmpty.classList.remove(
                "hidden"
            );

        }

    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );


        recentBookingsLoading.classList.add(
            "hidden"
        );


        recentBookingsEmpty.classList.remove(
            "hidden"
        );

    }

}


// ========================================
// Start Dashboard
// ========================================

loadDashboard();