// ========================================
// EventEase Organizer Event Bookings
// ========================================



// ========================================
// Configuration
// ========================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";



// ========================================
// DOM Elements
// ========================================

const eventTitle =
    document.getElementById(
        "eventTitle"
    );

const eventDate =
    document.getElementById(
        "eventDate"
    );

const totalBookings =
    document.getElementById(
        "totalBookings"
    );

const totalTickets =
    document.getElementById(
        "totalTickets"
    );

const confirmedBookings =
    document.getElementById(
        "confirmedBookings"
    );

const pendingBookings =
    document.getElementById(
        "pendingBookings"
    );

const cancelledBookings =
    document.getElementById(
        "cancelledBookings"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );

const loadingState =
    document.getElementById(
        "loadingState"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const bookingTableWrapper =
    document.getElementById(
        "bookingTableWrapper"
    );

const bookingTableBody =
    document.getElementById(
        "bookingTableBody"
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
// Authentication
// ========================================

const token = getToken();



if (!token) {

    alert(
        "Please login to continue."
    );

    window.location.href =
        "./organizer-login.html";

}



// ========================================
// Get Event ID
// ========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const eventId =
    urlParams.get("id");



if (!eventId) {

    alert(
        "Event ID is missing."
    );

    window.location.href =
        "./my-events.html";

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

        return "-";

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
// Format Amount
// ========================================

const formatAmount = (
    amount
) => {

    return Number(
        amount || 0
    ).toLocaleString(
        "en-BD",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }
    );

};



// ========================================
// Status Badge
// ========================================

const getStatusBadge = (
    status
) => {

    let className =
        "bg-gray-100 text-gray-600";


    switch (status) {

        case "confirmed":

            className =
                "bg-green-100 text-green-700";

            break;


        case "pending":

            className =
                "bg-yellow-100 text-yellow-700";

            break;


        case "cancelled":

            className =
                "bg-red-100 text-red-700";

            break;


        case "completed":

            className =
                "bg-blue-100 text-blue-700";

            break;

    }


    return `

        <span
            class="inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}"
        >

            ${status || "unknown"}

        </span>

    `;

};



// ========================================
// Payment Badge
// ========================================

const getPaymentBadge = (
    status
) => {

    let className =
        "bg-gray-100 text-gray-600";


    switch (status) {

        case "paid":

            className =
                "bg-green-100 text-green-700";

            break;


        case "pending":

            className =
                "bg-yellow-100 text-yellow-700";

            break;


        case "failed":

            className =
                "bg-red-100 text-red-700";

            break;

    }


    return `

        <span
            class="inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}"
        >

            ${status || "unknown"}

        </span>

    `;

};



// ========================================
// Load Event
// ========================================

const loadEvent = async () => {

    try {

        const result =
            await apiRequest(
                `/events/${eventId}`
            );


        const event =
            result.data;


        if (!event) {

            throw new Error(
                "Event not found."
            );

        }


        eventTitle.textContent =
            event.title ||
            "Event Bookings";


        eventDate.textContent =
            event.eventDate
                ? `Event Date: ${formatDate(
                    event.eventDate
                )}`
                : "Event date not available";


    } catch (error) {

        console.error(
            "Event loading error:",
            error
        );


        eventTitle.textContent =
            "Event Bookings";


        eventDate.textContent =
            error.message;

    }

};



// ========================================
// Load Event Bookings
// ========================================

const loadBookings = async () => {

    try {

        loadingState.classList.remove(
            "hidden"
        );

        emptyState.classList.add(
            "hidden"
        );

        bookingTableWrapper.classList.add(
            "hidden"
        );


        const result =
            await apiRequest(
                `/bookings/event/${eventId}`
            );


        const bookings =
            result.data || [];


        renderBookings(
            bookings
        );


    } catch (error) {

        console.error(
            "Booking loading error:",
            error
        );


        loadingState.classList.add(
            "hidden"
        );


        bookingTableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="px-6 py-10 text-center"
                >

                    <p
                        class="font-semibold text-red-500"
                    >
                        Failed to load bookings.
                    </p>

                    <p
                        class="mt-2 text-sm text-gray-500"
                    >
                        ${error.message}
                    </p>

                </td>

            </tr>

        `;


        bookingTableWrapper.classList.remove(
            "hidden"
        );

    }

};



// ========================================
// Render Bookings
// ========================================

const renderBookings = (
    bookings
) => {

    loadingState.classList.add(
        "hidden"
    );


    const selectedStatus =
        statusFilter.value;


    const filteredBookings =
        selectedStatus === "all"
            ? bookings
            : bookings.filter(
                (booking) =>
                    booking.bookingStatus ===
                    selectedStatus
            );


    // ====================================
    // Summary
    // ====================================

    totalBookings.textContent =
        bookings.length;


    const ticketCount =
        bookings.reduce(
            (
                total,
                booking
            ) => {

                return (
                    total +
                    Number(
                        booking.ticketQuantity ||
                        0
                    )
                );

            },
            0
        );


    totalTickets.textContent =
        ticketCount;


    confirmedBookings.textContent =
        bookings.filter(
            (booking) =>
                booking.bookingStatus ===
                "confirmed"
        ).length;


    pendingBookings.textContent =
        bookings.filter(
            (booking) =>
                booking.bookingStatus ===
                "pending"
        ).length;


    cancelledBookings.textContent =
        bookings.filter(
            (booking) =>
                booking.bookingStatus ===
                "cancelled"
        ).length;



    // ====================================
    // Empty State
    // ====================================

    if (
        filteredBookings.length === 0
    ) {

        bookingTableWrapper.classList.add(
            "hidden"
        );


        emptyState.classList.remove(
            "hidden"
        );


        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    bookingTableWrapper.classList.remove(
        "hidden"
    );


    bookingTableBody.innerHTML = "";



    // ====================================
    // Booking Rows
    // ====================================

    filteredBookings.forEach(
        (booking) => {

            const customer =
                booking.user || {};


            const row =
                document.createElement(
                    "tr"
                );


            row.className =
                "transition hover:bg-gray-50";


            row.innerHTML = `

                <!-- Customer -->

                <td class="px-6 py-5">

                    <div>

                        <p
                            class="font-semibold text-gray-900"
                        >

                            ${
                                customer.name ||
                                "Unknown User"
                            }

                        </p>

                        <p
                            class="mt-1 text-xs text-gray-500"
                        >

                            ${
                                customer.email ||
                                "No email"
                            }

                        </p>

                    </div>

                </td>



                <!-- Tickets -->

                <td class="px-6 py-5">

                    <span
                        class="font-semibold text-gray-900"
                    >

                        ${
                            booking.ticketQuantity ||
                            0
                        }

                    </span>

                </td>



                <!-- Amount -->

                <td class="px-6 py-5">

                    <span
                        class="font-semibold text-gray-900"
                    >

                        ${formatAmount(
                            booking.totalAmount
                        )}
                        BDT

                    </span>

                </td>



                <!-- Payment -->

                <td class="px-6 py-5">

                    ${
                        getPaymentBadge(
                            booking.paymentStatus
                        )
                    }

                </td>



                <!-- Status -->

                <td class="px-6 py-5">

                    ${
                        getStatusBadge(
                            booking.bookingStatus
                        )
                    }

                </td>



                <!-- Booking Date -->

                <td class="px-6 py-5">

                    <span
                        class="text-sm text-gray-500"
                    >

                        ${formatDate(
                            booking.createdAt
                        )}

                    </span>

                </td>

            `;


            bookingTableBody.appendChild(
                row
            );

        }
    );

};



// ========================================
// Status Filter
// ========================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        loadBookings
    );

}



// ========================================
// Initialize Page
// ========================================

const initializePage = async () => {

    await loadEvent();

    await loadBookings();

};


initializePage();