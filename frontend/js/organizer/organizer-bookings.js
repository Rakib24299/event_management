// EventEase Organizer Bookings

// Configuration

const API_BASE_URL =
    "http://localhost:5000/api/v1";

// DOM Elements

const totalBookings =
    document.getElementById(
        "totalBookings"
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

const bookingList =
    document.getElementById(
        "bookingList"
    );

const bookingContainer =
    document.getElementById(
        "bookingContainer"
    );

const loadingState =
    document.getElementById(
        "loadingState"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const errorState =
    document.getElementById(
        "errorState"
    );

const errorMessage =
    document.getElementById(
        "errorMessage"
    );

const retryBtn =
    document.getElementById(
        "retryBtn"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

// Get Token

const getToken = () => {

    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );

};

const token = getToken();

// Authentication Check

if (!token) {

    alert(
        "Please login to view organizer bookings."
    );

    window.location.href =
        "./organizer-login.html";

}

// Store Bookings

let allBookings = [];

// API Request Helper

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

// Format Date

const formatDate = (
    date
) => {

    if (!date) {

        return "N/A";

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

// Format Currency

const formatCurrency = (
    amount
) => {

    return `${Number(
        amount || 0
    ).toLocaleString()} BDT`;

};

// Get Status Badge

const getBookingStatusBadge = (
    status
) => {

    switch (status) {

        case "confirmed":

            return `
                <span
                    class="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                >
                    Confirmed
                </span>
            `;

        case "pending":

            return `
                <span
                    class="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700"
                >
                    Pending
                </span>
            `;

        case "cancelled":

            return `
                <span
                    class="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                >
                    Cancelled
                </span>
            `;

        case "completed":

            return `
                <span
                    class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                >
                    Completed
                </span>
            `;

        default:

            return `
                <span
                    class="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                >
                    ${status || "Unknown"}
                </span>
            `;

    }

};

// Get Payment Status Badge

const getPaymentStatusBadge = (
    status
) => {

    switch (status) {

        case "paid":

            return `
                <span
                    class="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                >
                    Paid
                </span>
            `;

        case "pending":

            return `
                <span
                    class="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700"
                >
                    Pending
                </span>
            `;

        case "failed":

            return `
                <span
                    class="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                >
                    Failed
                </span>
            `;

        case "refunded":

            return `
                <span
                    class="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700"
                >
                    Refunded
                </span>
            `;

        default:

            return `
                <span
                    class="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                >
                    ${status || "N/A"}
                </span>
            `;

    }

};

// Update Statistics

const updateStatistics = (
    bookings
) => {

    const total =
        bookings.length;

    const confirmed =
        bookings.filter(
            (booking) =>
                booking.bookingStatus ===
                "confirmed"
        ).length;

    const pending =
        bookings.filter(
            (booking) =>
                booking.bookingStatus ===
                "pending"
        ).length;

    const cancelled =
        bookings.filter(
            (booking) =>
                booking.bookingStatus ===
                "cancelled"
        ).length;

    totalBookings.textContent =
        total;

    confirmedBookings.textContent =
        confirmed;

    pendingBookings.textContent =
        pending;

    cancelledBookings.textContent =
        cancelled;

};

// Render Bookings

const renderBookings = (
    bookings
) => {

    bookingList.innerHTML = "";

    if (
        !bookings ||
        bookings.length === 0
    ) {

        bookingContainer.classList.add(
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

    bookingContainer.classList.remove(
        "hidden"
    );

    bookings.forEach(
        (booking) => {

            const row =
                document.createElement(
                    "tr"
                );

            row.className =
                "transition hover:bg-gray-50";

            const customer =
                booking.user || {};

            const event =
                booking.event || {};

            row.innerHTML = `

                <!-- Customer -->

                <td class="whitespace-nowrap px-6 py-5">

                    <div class="flex items-center gap-3">

                        <div
                            class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primaryLight text-sm font-bold text-white"
                        >

                            ${
                                customer.profileImage &&
                                customer.profileImage.url
                                    ?

                                `
                                    <img
                                        src="${customer.profileImage.url}"
                                        alt="${customer.name || "Customer"}"
                                        class="h-full w-full object-cover"
                                    >
                                `

                                    :

                                (
                                    customer.name
                                        ?

                                    customer.name
                                        .charAt(0)
                                        .toUpperCase()

                                        :

                                    "U"
                                )

                            }

                        </div>

                        <div>

                            <p
                                class="font-semibold text-gray-900"
                            >
                                ${
                                    customer.name ||
                                    "Unknown Customer"
                                }
                            </p>

                            <p
                                class="text-xs text-gray-500"
                            >
                                ${
                                    customer.email ||
                                    "No email"
                                }
                            </p>

                        </div>

                    </div>

                </td>

                <!-- Event -->

                <td class="px-6 py-5">

                    <p
                        class="max-w-xs font-semibold text-gray-900"
                    >
                        ${
                            event.title ||
                            "Unknown Event"
                        }
                    </p>

                    ${
                        event.eventDate
                            ?

                        `
                            <p
                                class="mt-1 text-xs text-gray-500"
                            >
                                ${new Date(
                                    event.eventDate
                                ).toLocaleDateString(
                                    "en-US",
                                    {
                                        dateStyle:
                                            "medium"
                                    }
                                )}
                            </p>
                        `

                            :

                        ""
                    }

                </td>

                <!-- Tickets -->

                <td
                    class="px-6 py-5 text-center"
                >

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

                <td
                    class="whitespace-nowrap px-6 py-5 text-right"
                >

                    <span
                        class="font-semibold text-gray-900"
                    >
                        ${formatCurrency(
                            booking.totalAmount
                        )}
                    </span>

                </td>

                <!-- Booking Status -->

                <td
                    class="whitespace-nowrap px-6 py-5 text-center"
                >

                    ${getBookingStatusBadge(
                        booking.bookingStatus
                    )}

                </td>

                <!-- Payment -->

                <td
                    class="whitespace-nowrap px-6 py-5 text-center"
                >

                    ${getPaymentStatusBadge(
                        booking.paymentStatus
                    )}

                </td>

                <!-- Date -->

                <td
                    class="whitespace-nowrap px-6 py-5"
                >

                    <span
                        class="text-sm text-gray-500"
                    >
                        ${formatDate(
                            booking.createdAt
                        )}
                    </span>

                </td>

            `;

            bookingList.appendChild(
                row
            );

        }
    );

};

// Search Bookings

const searchBookings = () => {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();

    if (!searchTerm) {

        renderBookings(
            allBookings
        );

        return;

    }

    const filteredBookings =
        allBookings.filter(
            (booking) => {

                const customer =
                    booking.user || {};

                const event =
                    booking.event || {};

                const customerName =
                    (
                        customer.name ||
                        ""
                    ).toLowerCase();

                const customerEmail =
                    (
                        customer.email ||
                        ""
                    ).toLowerCase();

                const eventTitle =
                    (
                        event.title ||
                        ""
                    ).toLowerCase();

                return (
                    customerName.includes(
                        searchTerm
                    ) ||

                    customerEmail.includes(
                        searchTerm
                    ) ||

                    eventTitle.includes(
                        searchTerm
                    )
                );

            }
        );

    renderBookings(
        filteredBookings
    );

};

// Load Organizer Bookings

const loadOrganizerBookings =
    async () => {

        try {

            loadingState.classList.remove(
                "hidden"
            );

            bookingContainer.classList.add(
                "hidden"
            );

            emptyState.classList.add(
                "hidden"
            );

            errorState.classList.add(
                "hidden"
            );

            const result =
                await apiRequest(
                    "/bookings/organizer-bookings"
                );

            allBookings =
                result.data || [];

            updateStatistics(
                allBookings
            );

            renderBookings(
                allBookings
            );

        } catch (error) {

            console.error(
                "Organizer bookings error:",
                error
            );

            bookingContainer.classList.add(
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
                "Unable to load bookings.";

        } finally {

            loadingState.classList.add(
                "hidden"
            );

        }

    };

// Search Event

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchBookings
    );

}

// Retry Button

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        loadOrganizerBookings
    );

}

// Initial Load

loadOrganizerBookings();