// ========================================
// EventEase Admin Booking Management
// ========================================


// ========================================
// Configuration
// ========================================

const API_BASE_URL = "http://localhost:5000/api/v1";


// ========================================
// DOM Elements
// ========================================

const loadingState = document.getElementById("loadingState");

const errorState = document.getElementById("errorState");

const errorMessage = document.getElementById("errorMessage");

const retryBtn = document.getElementById("retryBtn");

const bookingsSection = document.getElementById("bookingsSection");

const bookingTableBody = document.getElementById("bookingTableBody");

const bookingCountText = document.getElementById("bookingCountText");

const emptyState = document.getElementById("emptyState");


// ========================================
// Statistics
// ========================================

const totalBookings = document.getElementById("totalBookings");

const confirmedBookings =
    document.getElementById("confirmedBookings");

const pendingBookings =
    document.getElementById("pendingBookings");

const cancelledBookings =
    document.getElementById("cancelledBookings");


// ========================================
// Filters
// ========================================

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const paymentFilter =
    document.getElementById("paymentFilter");

const clearFiltersBtn =
    document.getElementById("clearFiltersBtn");


// ========================================
// Pagination
// ========================================

const paginationContainer =
    document.getElementById("paginationContainer");

const paginationInfo =
    document.getElementById("paginationInfo");

const paginationButtons =
    document.getElementById("paginationButtons");


// ========================================
// Refresh
// ========================================

const refreshBtn =
    document.getElementById("refreshBtn");


// ========================================
// Modal
// ========================================

const bookingModal =
    document.getElementById("bookingModal");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const closeModalFooterBtn =
    document.getElementById("closeModalFooterBtn");

const modalBookingId =
    document.getElementById("modalBookingId");

const bookingDetailsContent =
    document.getElementById("bookingDetailsContent");


// ========================================
// Logout
// ========================================

const logoutBtn =
    document.getElementById("logoutBtn");


// ========================================
// Token
// ========================================

const getToken = () => {

    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );

};


const token = getToken();


// ========================================
// Authentication Check
// ========================================

if (!token) {

    alert("Please login as admin to access this page.");

    window.location.href = "./admin-login.html";

}


// ========================================
// Global Booking Data
// ========================================

let allBookings = [];


// ========================================
// API Request Helper
// ========================================

const apiRequest = async (
    endpoint,
    options = {}
) => {

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {

            ...options,

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`,

                ...(options.headers || {}),

            },

        }
    );


    let data = {};


    try {

        data = await response.json();

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

const formatDate = (date) => {

    if (!date) {

        return "N/A";

    }


    const parsedDate = new Date(date);


    if (Number.isNaN(parsedDate.getTime())) {

        return "N/A";

    }


    return parsedDate.toLocaleDateString(
        "en-GB",
        {

            day: "2-digit",

            month: "short",

            year: "numeric",

        }
    );

};


// ========================================
// Format Date + Time
// ========================================

const formatDateTime = (date) => {

    if (!date) {

        return "N/A";

    }


    const parsedDate = new Date(date);


    if (Number.isNaN(parsedDate.getTime())) {

        return "N/A";

    }


    return parsedDate.toLocaleString(
        "en-GB",
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
// Currency
// ========================================

const formatCurrency = (amount) => {

    const number = Number(amount || 0);


    return `৳${number.toLocaleString("en-BD")}`;

};


// ========================================
// Get ID
// ========================================

const getId = (value) => {

    if (!value) {

        return "";

    }


    if (
        typeof value === "object" &&
        value._id
    ) {

        return String(value._id);

    }


    return String(value);

};


// ========================================
// Get Customer
// ========================================

const getCustomer = (booking) => {

    const user =
        booking.user ||
        booking.customer ||
        booking.customerId;


    if (
        user &&
        typeof user === "object"
    ) {

        return {

            name:
                user.name ||
                user.fullName ||
                user.username ||
                "Unknown User",

            email:
                user.email ||
                "No email",

            image:
                user.profileImage ||
                user.image ||
                "",

        };

    }


    return {

        name:
            booking.customerName ||
            "Unknown User",

        email:
            booking.customerEmail ||
            "No email",

        image: "",

    };

};


// ========================================
// Get Event
// ========================================

const getEvent = (booking) => {

    const event =
        booking.event ||
        booking.eventId;


    if (
        event &&
        typeof event === "object"
    ) {

        return {

            name:
                event.title ||
                event.name ||
                "Unknown Event",

            id:
                event._id ||
                "",

            date:
                event.date ||
                event.eventDate ||
                event.startDate ||
                "",

        };

    }


    return {

        name:
            booking.eventName ||
            "Unknown Event",

        id:
            getId(booking.eventId),

        date:
            booking.eventDate ||
            "",

    };

};


// ========================================
// Normalize Status
// ========================================

const normalizeStatus = (status) => {

    return String(status || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");

};


// ========================================
// Booking Status
// ========================================

const getBookingStatus = (booking) => {

    return normalizeStatus(
        booking.status ||
        booking.bookingStatus
    );

};


// ========================================
// Payment Status
// ========================================

const getPaymentStatus = (booking) => {

    const payment = booking.payment;


    if (
        payment &&
        typeof payment === "object"
    ) {

        return normalizeStatus(
            payment.status ||
            payment.paymentStatus
        );

    }


    return normalizeStatus(
        booking.paymentStatus ||
        booking.payment_status
    );

};


// ========================================
// Status Badge
// ========================================

const getStatusBadge = (status) => {

    const normalized =
        normalizeStatus(status);


    const config = {

        confirmed: {

            text: "Confirmed",

            className:
                "bg-green-100 text-green-700",

        },

        pending: {

            text: "Pending",

            className:
                "bg-amber-100 text-amber-700",

        },

        cancelled: {

            text: "Cancelled",

            className:
                "bg-red-100 text-red-700",

        },

        completed: {

            text: "Completed",

            className:
                "bg-blue-100 text-blue-700",

        },

        failed: {

            text: "Failed",

            className:
                "bg-red-100 text-red-700",

        },

    };


    return (
        config[normalized] || {

            text:
                status ||
                "Unknown",

            className:
                "bg-gray-100 text-gray-700",

        }
    );

};


// ========================================
// Payment Badge
// ========================================

const getPaymentBadge = (status) => {

    const normalized =
        normalizeStatus(status);


    const config = {

        paid: {

            text: "Paid",

            className:
                "bg-green-100 text-green-700",

        },

        completed: {

            text: "Completed",

            className:
                "bg-green-100 text-green-700",

        },

        pending: {

            text: "Pending",

            className:
                "bg-amber-100 text-amber-700",

        },

        refunded: {

            text: "Refunded",

            className:
                "bg-purple-100 text-purple-700",

        },

        failed: {

            text: "Failed",

            className:
                "bg-red-100 text-red-700",

        },

    };


    return (
        config[normalized] || {

            text:
                status ||
                "Unknown",

            className:
                "bg-gray-100 text-gray-700",

        }
    );

};


// ========================================
// Scanned Status
// ========================================

const getScannedStatus = (booking) => {

    const scanned =
        booking.isScanned === true ||
        booking.scanned === true;


    if (scanned) {

        return {

            text: "Scanned",

            className:
                "bg-green-100 text-green-700",

        };

    }


    return {

        text: "Not Scanned",

        className:
            "bg-gray-100 text-gray-600",

    };

};


// ========================================
// Update Statistics
// ========================================

const updateStatistics = (bookings) => {

    const total = bookings.length;


    const confirmed =
        bookings.filter(
            booking =>
                getBookingStatus(booking) ===
                "confirmed"
        ).length;


    const pending =
        bookings.filter(
            booking =>
                getBookingStatus(booking) ===
                "pending"
        ).length;


    const cancelled =
        bookings.filter(
            booking =>
                getBookingStatus(booking) ===
                "cancelled"
        ).length;


    if (totalBookings) {

        totalBookings.textContent = total;

    }


    if (confirmedBookings) {

        confirmedBookings.textContent = confirmed;

    }


    if (pendingBookings) {

        pendingBookings.textContent = pending;

    }


    if (cancelledBookings) {

        cancelledBookings.textContent = cancelled;

    }

};


// ========================================
// Empty State
// ========================================

const renderEmptyState = (
    message = "No bookings found."
) => {

    bookingTableBody.innerHTML = "";

    emptyState.classList.remove("hidden");

    const paragraph =
        emptyState.querySelector("p");

    if (paragraph) {

        paragraph.textContent = message;

    }

};


// ========================================
// Render Bookings
// ========================================

const renderBookings = (bookings) => {

    bookingTableBody.innerHTML = "";


    if (
        !bookings ||
        bookings.length === 0
    ) {

        renderEmptyState(
            "No bookings match your current search or filter."
        );

        updatePagination(0);

        return;

    }


    emptyState.classList.add("hidden");


    bookings.forEach(
        booking => {

            const row =
                document.createElement("tr");


            row.className =
                "transition hover:bg-gray-50";


            const id =
                getId(
                    booking._id ||
                    booking.id
                );


            const shortId =
                id
                    ? id.slice(-8)
                    : "N/A";


            const customer =
                getCustomer(booking);


            const event =
                getEvent(booking);


            const bookingStatus =
                getBookingStatus(booking);


            const paymentStatus =
                getPaymentStatus(booking);


            const statusBadge =
                getStatusBadge(bookingStatus);


            const paymentBadge =
                getPaymentBadge(paymentStatus);


            const scannedStatus =
                getScannedStatus(booking);


            const ticketCount =
                booking.quantity ??
                booking.numberOfTickets ??
                booking.ticketsCount ??
                (
                    Array.isArray(booking.tickets)
                        ? booking.tickets.length
                        : 1
                );


            const amount =
                booking.totalAmount ??
                booking.totalPrice ??
                booking.amount ??
                booking.payment?.amount ??
                0;


            row.innerHTML = `

                <!-- BOOKING -->

                <td class="whitespace-nowrap px-6 py-5">

                    <p class="font-semibold text-gray-900">
                        #${escapeHTML(shortId)}
                    </p>

                    <p class="mt-1 text-xs text-gray-400">
                        ${escapeHTML(
                            formatDateTime(
                                booking.createdAt ||
                                booking.bookingDate ||
                                booking.bookedAt
                            )
                        )}
                    </p>

                </td>


                <!-- CUSTOMER -->

                <td class="px-6 py-5">

                    <div class="flex items-center gap-3">

                        <div
                            class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primaryLight/15 font-bold text-primary"
                        >

                            ${
                                customer.image
                                    ? `
                                        <img
                                            src="${escapeHTML(customer.image)}"
                                            alt="User"
                                            class="h-full w-full object-cover"
                                        >
                                      `
                                    : '<svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>'
                            }

                        </div>


                        <div class="min-w-0">

                            <p
                                class="max-w-[180px] truncate font-semibold text-gray-900"
                                title="${escapeHTML(customer.name)}"
                            >
                                ${escapeHTML(customer.name)}
                            </p>


                            <p
                                class="max-w-[180px] truncate text-xs text-gray-400"
                                title="${escapeHTML(customer.email)}"
                            >
                                ${escapeHTML(customer.email)}
                            </p>

                        </div>

                    </div>

                </td>


                <!-- EVENT -->

                <td class="px-6 py-5">

                    <p
                        class="max-w-[220px] truncate font-semibold text-gray-900"
                        title="${escapeHTML(event.name)}"
                    >
                        ${escapeHTML(event.name)}
                    </p>


                    ${
                        event.date
                            ? `
                                <p class="mt-1 text-xs text-gray-400">
                                    ${escapeHTML(
                                        formatDate(event.date)
                                    )}
                                </p>
                              `
                            : ""
                    }

                </td>


                <!-- TICKETS -->

                <td
                    class="whitespace-nowrap px-6 py-5 text-center"
                >

                    <span
                        class="inline-flex min-w-10 items-center justify-center rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-700"
                    >
                        ${escapeHTML(ticketCount)}
                    </span>

                </td>


                <!-- AMOUNT -->

                <td class="whitespace-nowrap px-6 py-5">

                    <p class="font-bold text-gray-900">
                        ${escapeHTML(
                            formatCurrency(amount)
                        )}
                    </p>

                </td>


                <!-- PAYMENT -->

                <td class="whitespace-nowrap px-6 py-5">

                    <span
                        class="inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge.className}"
                    >
                        ${escapeHTML(paymentBadge.text)}
                    </span>

                </td>


                <!-- STATUS -->

                <td class="whitespace-nowrap px-6 py-5">

                    <span
                        class="inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.className}"
                    >
                        ${escapeHTML(statusBadge.text)}
                    </span>

                </td>


                <!-- ACTION -->

                <td
                    class="whitespace-nowrap px-6 py-5 text-right"
                >

                    <button
                        type="button"
                        class="viewBookingBtn rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primaryDark"
                        data-id="${escapeHTML(id)}"
                    >
                        View
                    </button>

                </td>

            `;


            bookingTableBody.appendChild(row);

        }
    );


    attachBookingListeners();


    updatePagination(bookings.length);

};


// ========================================
// Attach View Buttons
// ========================================

const attachBookingListeners = () => {

    const viewButtons =
        bookingTableBody.querySelectorAll(
            ".viewBookingBtn"
        );


    viewButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;


                    const booking =
                        allBookings.find(
                            item =>
                                getId(
                                    item._id ||
                                    item.id
                                ) === id
                        );


                    if (!booking) {

                        alert("Booking not found.");

                        return;

                    }


                    openBookingModal(booking);

                }
            );

        }
    );

};


// ========================================
// Open Booking Modal
// ========================================

const openBookingModal = (booking) => {

    const id =
        getId(
            booking._id ||
            booking.id
        );


    const customer =
        getCustomer(booking);


    const event =
        getEvent(booking);


    const bookingStatus =
        getBookingStatus(booking);


    const paymentStatus =
        getPaymentStatus(booking);


    const statusBadge =
        getStatusBadge(bookingStatus);


    const paymentBadge =
        getPaymentBadge(paymentStatus);


    const scannedStatus =
        getScannedStatus(booking);


    const ticketCount =
        booking.quantity ??
        booking.numberOfTickets ??
        booking.ticketsCount ??
        (
            Array.isArray(booking.tickets)
                ? booking.tickets.length
                : 1
        );


    const amount =
        booking.totalAmount ??
        booking.totalPrice ??
        booking.amount ??
        booking.payment?.amount ??
        0;


    modalBookingId.textContent =
        `#${id || "Booking"}`;


    bookingDetailsContent.innerHTML = `

        <!-- CUSTOMER -->

        <div class="rounded-2xl bg-gray-50 p-5">

            <h3
                class="text-sm font-bold uppercase tracking-wide text-gray-400"
            >
                Customer
            </h3>

            <div class="mt-4">

                <p class="font-bold text-gray-900">
                    ${escapeHTML(customer.name)}
                </p>

                <p class="mt-1 text-sm text-gray-500">
                    ${escapeHTML(customer.email)}
                </p>

            </div>

        </div>


        <!-- EVENT -->

        <div class="rounded-2xl bg-gray-50 p-5">

            <h3
                class="text-sm font-bold uppercase tracking-wide text-gray-400"
            >
                Event
            </h3>

            <p class="mt-4 font-bold text-gray-900">
                ${escapeHTML(event.name)}
            </p>

            ${
                event.date
                    ? `
                        <p class="mt-1 text-sm text-gray-500">
                            Event Date:
                            ${escapeHTML(
                                formatDate(event.date)
                            )}
                        </p>
                      `
                    : ""
            }

        </div>


        <!-- BOOKING INFORMATION -->

        <div class="grid gap-4 sm:grid-cols-2">

            <div class="rounded-2xl border border-gray-100 p-5">

                <p
                    class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                >
                    Tickets
                </p>

                <p
                    class="mt-2 text-xl font-extrabold text-gray-900"
                >
                    ${escapeHTML(ticketCount)}
                </p>

            </div>


            <div class="rounded-2xl border border-gray-100 p-5">

                <p
                    class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                >
                    Amount
                </p>

                <p
                    class="mt-2 text-xl font-extrabold text-gray-900"
                >
                    ${escapeHTML(
                        formatCurrency(amount)
                    )}
                </p>

            </div>

        </div>


        <!-- STATUS -->

        <div class="rounded-2xl border border-gray-100 p-5">

            <div class="flex flex-wrap gap-3">

                <span
                    class="rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.className}"
                >
                    ${escapeHTML(statusBadge.text)}
                </span>


                <span
                    class="rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge.className}"
                >
                    Payment:
                    ${escapeHTML(paymentBadge.text)}
                </span>


                <span
                    class="rounded-full px-3 py-1 text-xs font-semibold ${scannedStatus.className}"
                >
                    ${escapeHTML(scannedStatus.text)}
                </span>

            </div>

        </div>


        <!-- DATES -->

        <div class="rounded-2xl border border-gray-100 p-5">

            <div class="grid gap-4 sm:grid-cols-2">

                <div>

                    <p
                        class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                    >
                        Booked At
                    </p>

                    <p
                        class="mt-2 text-sm font-semibold text-gray-700"
                    >
                        ${escapeHTML(
                            formatDateTime(
                                booking.createdAt ||
                                booking.bookingDate ||
                                booking.bookedAt
                            )
                        )}
                    </p>

                </div>


                <div>

                    <p
                        class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                    >
                        Booking ID
                    </p>

                    <p
                        class="mt-2 break-all text-sm font-semibold text-gray-700"
                    >
                        ${escapeHTML(id || "N/A")}
                    </p>

                </div>

            </div>

        </div>


        ${
            booking.refundStatus
                ? `
                    <div class="rounded-2xl bg-purple-50 p-5">

                        <p
                            class="text-xs font-semibold uppercase tracking-wide text-purple-500"
                        >
                            Refund Status
                        </p>

                        <p
                            class="mt-2 font-bold text-purple-700"
                        >
                            ${escapeHTML(
                                booking.refundStatus
                            )}
                        </p>

                    </div>
                  `
                : ""
        }

    `;


    bookingModal.classList.remove("hidden");

    bookingModal.classList.add("flex");

};


// ========================================
// Close Modal
// ========================================

const closeBookingModal = () => {

    bookingModal.classList.add("hidden");

    bookingModal.classList.remove("flex");

};


// ========================================
// Filter Bookings
// ========================================

const filterBookings = () => {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        normalizeStatus(
            statusFilter.value
        );


    const selectedPayment =
        normalizeStatus(
            paymentFilter.value
        );


    const filtered =
        allBookings.filter(
            booking => {

                const id =
                    getId(
                        booking._id ||
                        booking.id
                    ).toLowerCase();


                const customer =
                    getCustomer(booking);


                const event =
                    getEvent(booking);


                const customerName =
                    String(
                        customer.name || ""
                    ).toLowerCase();


                const customerEmail =
                    String(
                        customer.email || ""
                    ).toLowerCase();


                const eventName =
                    String(
                        event.name || ""
                    ).toLowerCase();


                const status =
                    getBookingStatus(booking);


                const payment =
                    getPaymentStatus(booking);


                const matchesSearch =
                    !search ||
                    id.includes(search) ||
                    customerName.includes(search) ||
                    customerEmail.includes(search) ||
                    eventName.includes(search);


                const matchesStatus =
                    selectedStatus === "all" ||
                    status === selectedStatus;


                const matchesPayment =
                    selectedPayment === "all" ||
                    payment === selectedPayment;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesPayment
                );

            }
        );


    renderBookings(filtered);


    bookingCountText.textContent =
        `${filtered.length} ${
            filtered.length === 1
                ? "booking"
                : "bookings"
        } found`;

};


// ========================================
// Clear Filters
// ========================================

const clearFilters = () => {

    searchInput.value = "";

    statusFilter.value = "all";

    paymentFilter.value = "all";

    filterBookings();

};


// ========================================
// Pagination
// ========================================

const updatePagination = (count) => {

    if (paginationInfo) {

        paginationInfo.textContent =
            `Showing ${count} ${
                count === 1
                    ? "booking"
                    : "bookings"
            }`;

    }


    if (paginationButtons) {

        paginationButtons.innerHTML = "";

    }

};


// ========================================
// Extract Bookings From API Response
// ========================================

const extractBookings = (result) => {

    if (Array.isArray(result)) {

        return result;

    }


    if (Array.isArray(result.data)) {

        return result.data;

    }


    if (
        result.data &&
        Array.isArray(result.data.bookings)
    ) {

        return result.data.bookings;

    }


    if (Array.isArray(result.bookings)) {

        return result.bookings;

    }


    if (
        result.result &&
        Array.isArray(result.result)
    ) {

        return result.result;

    }


    if (
        result.result &&
        Array.isArray(result.result.bookings)
    ) {

        return result.result.bookings;

    }


    return [];

};


// ========================================
// Load Bookings
// ========================================

const loadBookings = async () => {

    try {

        // ========================================
        // Loading State
        // ========================================

        if (loadingState) {
            loadingState.classList.remove("hidden");
        }

        if (errorState) {
            errorState.classList.add("hidden");
        }

        if (bookingsSection) {
            bookingsSection.classList.add("hidden");
        }


        // ========================================
        // Check Authentication Token
        // ========================================

        const currentToken = getToken();

        if (!currentToken) {

            throw new Error(
                "Authentication token not found. Please login again."
            );

        }


        // ========================================
        // Admin / Organizer Booking API
        // ========================================

        const endpoint =
            "/bookings/admin";


        console.log(
            "Loading bookings from:",
            `${API_BASE_URL}${endpoint}`
        );


        // ========================================
        // Send API Request
        // ========================================

        const result =
            await apiRequest(endpoint);


        console.log(
            "Bookings API response:",
            result
        );


        // ========================================
        // Extract Bookings
        // ========================================

        allBookings =
            extractBookings(result);


        console.log(
            "Extracted bookings:",
            allBookings
        );


        // ========================================
        // Update Statistics
        // ========================================

        updateStatistics(
            allBookings
        );


        // ========================================
        // Show Booking Section
        // ========================================

        if (bookingsSection) {

            bookingsSection.classList.remove(
                "hidden"
            );

        }


        // ========================================
        // Check Empty Bookings
        // ========================================

        if (
            !Array.isArray(allBookings) ||
            allBookings.length === 0
        ) {

            renderEmptyState(
                "There are no bookings available."
            );


            if (bookingCountText) {

                bookingCountText.textContent =
                    "0 bookings found";

            }


        } else {

            // ========================================
            // Render Bookings
            // ========================================

            renderBookings(
                allBookings
            );


            if (bookingCountText) {

                bookingCountText.textContent =
                    `${allBookings.length} ${
                        allBookings.length === 1
                            ? "booking"
                            : "bookings"
                    } found`;

            }

        }


        // ========================================
        // Hide Loading State
        // ========================================

        if (loadingState) {

            loadingState.classList.add(
                "hidden"
            );

        }


    } catch (error) {

        // ========================================
        // Console Error
        // ========================================

        console.error(
            "Load bookings error:",
            error
        );


        // ========================================
        // Hide Loading State
        // ========================================

        if (loadingState) {

            loadingState.classList.add(
                "hidden"
            );

        }


        // ========================================
        // Hide Booking Section
        // ========================================

        if (bookingsSection) {

            bookingsSection.classList.add(
                "hidden"
            );

        }


        // ========================================
        // Show Error State
        // ========================================

        if (errorState) {

            errorState.classList.remove(
                "hidden"
            );

        }


        // ========================================
        // Show Error Message
        // ========================================

        if (errorMessage) {

            errorMessage.textContent =
                error.message ||
                "Failed to load bookings.";

        }

    }

};


// ========================================
// Search
// ========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterBookings
    );

}


// ========================================
// Status Filter
// ========================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterBookings
    );

}


// ========================================
// Payment Filter
// ========================================

if (paymentFilter) {

    paymentFilter.addEventListener(
        "change",
        filterBookings
    );

}


// ========================================
// Clear Filters
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
        loadBookings
    );

}


// ========================================
// Close Modal
// ========================================

if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        closeBookingModal
    );

}


if (closeModalFooterBtn) {

    closeModalFooterBtn.addEventListener(
        "click",
        closeBookingModal
    );

}


// ========================================
// Close Modal Outside Click
// ========================================

if (bookingModal) {

    bookingModal.addEventListener(
        "click",
        event => {

            if (
                event.target === bookingModal
            ) {

                closeBookingModal();

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
            bookingModal &&
            !bookingModal.classList.contains("hidden")
        ) {

            closeBookingModal();

        }

    }
);


// ========================================
// Retry
// ========================================

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        loadBookings
    );

}


// ========================================
// Logout
// ========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {

                return;

            }


            localStorage.removeItem("token");

            sessionStorage.removeItem("token");


            window.location.href =
                "./admin-login.html";

        }
    );

}


// ========================================
// Initial Load
// ========================================

loadBookings();