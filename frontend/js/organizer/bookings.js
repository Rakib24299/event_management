// ========================================
// EventEase Organizer Bookings
// ========================================

const API_URL =
    "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const errorMessage =
    document.getElementById("errorMessage");

const successMessage =
    document.getElementById("successMessage");

const loadingState =
    document.getElementById("loadingState");

const emptyState =
    document.getElementById("emptyState");

const bookingSection =
    document.getElementById("bookingSection");

const bookingTableBody =
    document.getElementById("bookingTableBody");

const searchInput =
    document.getElementById("searchInput");

const eventFilter =
    document.getElementById("eventFilter");

const statusFilter =
    document.getElementById("statusFilter");

const totalBookings =
    document.getElementById("totalBookings");

const confirmedBookings =
    document.getElementById("confirmedBookings");

const pendingBookings =
    document.getElementById("pendingBookings");

const cancelledBookings =
    document.getElementById("cancelledBookings");

const bookingModal =
    document.getElementById("bookingModal");

const bookingDetails =
    document.getElementById("bookingDetails");

const modalBookingId =
    document.getElementById("modalBookingId");

const closeModalButton =
    document.getElementById("closeModalButton");

const closeModalFooterButton =
    document.getElementById(
        "closeModalFooterButton"
    );


// ========================================
// Global Data
// ========================================

let allBookings = [];


// ========================================
// Get Token
// ========================================

function getToken() {

    return localStorage.getItem("token");

}


// ========================================
// Show Error
// ========================================

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.remove(
        "hidden"
    );

}


// ========================================
// Hide Error
// ========================================

function hideError() {

    errorMessage.textContent = "";

    errorMessage.classList.add(
        "hidden"
    );

}


// ========================================
// Show Success
// ========================================

function showSuccess(message) {

    successMessage.textContent =
        message;

    successMessage.classList.remove(
        "hidden"
    );

    setTimeout(() => {

        successMessage.classList.add(
            "hidden"
        );

    }, 3000);

}


// ========================================
// Format Date
// ========================================

function formatDate(date) {

    if (!date) {

        return "N/A";

    }

    const formattedDate =
        new Date(date);

    if (
        Number.isNaN(
            formattedDate.getTime()
        )
    ) {

        return "N/A";

    }

    return formattedDate.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );

}


// ========================================
// Format Currency
// ========================================

function formatCurrency(amount) {

    const value =
        Number(amount || 0);

    return `${value.toLocaleString(
        "en-BD"
    )} BDT`;

}


// ========================================
// Escape HTML
// ========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ========================================
// Get Status Badge
// ========================================

function getStatusBadge(status) {

    const normalizedStatus =
        String(
            status || ""
        ).toLowerCase();


    if (
        normalizedStatus ===
        "confirmed"
    ) {

        return `
            <span
                class="inline-flex
                       px-3 py-1
                       rounded-full
                       text-xs font-semibold
                       bg-green-100
                       text-green-700"
            >
                Confirmed
            </span>
        `;

    }


    if (
        normalizedStatus ===
        "pending"
    ) {

        return `
            <span
                class="inline-flex
                       px-3 py-1
                       rounded-full
                       text-xs font-semibold
                       bg-yellow-100
                       text-yellow-700"
            >
                Pending
            </span>
        `;

    }


    if (
        normalizedStatus ===
        "cancelled"
    ) {

        return `
            <span
                class="inline-flex
                       px-3 py-1
                       rounded-full
                       text-xs font-semibold
                       bg-red-100
                       text-red-700"
            >
                Cancelled
            </span>
        `;

    }


    if (
        normalizedStatus ===
        "completed"
    ) {

        return `
            <span
                class="inline-flex
                       px-3 py-1
                       rounded-full
                       text-xs font-semibold
                       bg-blue-100
                       text-blue-700"
            >
                Completed
            </span>
        `;

    }


    return `
        <span
            class="inline-flex
                   px-3 py-1
                   rounded-full
                   text-xs font-semibold
                   bg-gray-100
                   text-gray-700"
        >
            ${escapeHTML(status || "Unknown")}
        </span>
    `;

}


// ========================================
// Load Organizer Bookings
// ========================================

async function loadOrganizerBookings() {

    hideError();

    loadingState.classList.remove(
        "hidden"
    );

    emptyState.classList.add(
        "hidden"
    );

    bookingSection.classList.add(
        "hidden"
    );


    const token =
        getToken();


    // ====================================
    // Token Check
    // ====================================

    if (!token) {

        loadingState.classList.add(
            "hidden"
        );

        showError(
            "You are not logged in. Please login first."
        );

        return;

    }


    try {

        // =================================
        // API Request
        // =================================

        const response =
            await fetch(
                `${API_URL}/bookings/organizer`,
                {
                    method: "GET",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`,

                    },

                }
            );


        // =================================
        // Response
        // =================================

        const result =
            await response.json();


        console.log(
            "Organizer Bookings Response:",
            result
        );


        // =================================
        // Unauthorized
        // =================================

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            throw new Error(
                "Your session has expired. Please login again."
            );

        }


        // =================================
        // API Error
        // =================================

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load bookings."
            );

        }


        // =================================
        // Save Data
        // =================================

        allBookings =
            Array.isArray(result.data)
                ? result.data
                : [];


        // =================================
        // Render
        // =================================

        populateEventFilter(
            allBookings
        );

        updateSummary(
            allBookings
        );

        renderBookings(
            allBookings
        );


    } catch (error) {

        console.error(
            "Load Organizer Bookings Error:",
            error
        );

        showError(
            error.message ||
            "Something went wrong while loading bookings."
        );

    } finally {

        loadingState.classList.add(
            "hidden"
        );

    }

}


// ========================================
// Populate Event Filter
// ========================================

function populateEventFilter(
    bookings
) {

    const events = new Map();


    bookings.forEach(
        (booking) => {

            const event =
                booking.event;


            if (
                event &&
                event._id
            ) {

                events.set(
                    event._id,
                    event.title ||
                    "Untitled Event"
                );

            }

        }
    );


    eventFilter.innerHTML = `
        <option value="">
            All Events
        </option>
    `;


    events.forEach(
        (title, id) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = id;

            option.textContent =
                title;

            eventFilter.appendChild(
                option
            );

        }
    );

}


// ========================================
// Update Summary
// ========================================

function updateSummary(
    bookings
) {

    totalBookings.textContent =
        bookings.length;


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

}


// ========================================
// Filter Bookings
// ========================================

function filterBookings() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedEvent =
        eventFilter.value;


    const selectedStatus =
        statusFilter.value;


    const filteredBookings =
        allBookings.filter(
            (booking) => {

                const user =
                    booking.user || {};

                const event =
                    booking.event || {};


                const customerName =
                    String(
                        user.name || ""
                    ).toLowerCase();


                const customerEmail =
                    String(
                        user.email || ""
                    ).toLowerCase();


                const bookingId =
                    String(
                        booking._id || ""
                    ).toLowerCase();


                const eventTitle =
                    String(
                        event.title || ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    customerName.includes(
                        search
                    ) ||
                    customerEmail.includes(
                        search
                    ) ||
                    bookingId.includes(
                        search
                    ) ||
                    eventTitle.includes(
                        search
                    );


                const matchesEvent =
                    !selectedEvent ||
                    event._id ===
                        selectedEvent;


                const matchesStatus =
                    !selectedStatus ||
                    booking.bookingStatus ===
                        selectedStatus;


                return (
                    matchesSearch &&
                    matchesEvent &&
                    matchesStatus
                );

            }
        );


    renderBookings(
        filteredBookings
    );

}


// ========================================
// Render Bookings
// ========================================

function renderBookings(
    bookings
) {

    bookingTableBody.innerHTML =
        "";


    if (
        !bookings ||
        bookings.length === 0
    ) {

        bookingSection.classList.add(
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

    bookingSection.classList.remove(
        "hidden"
    );


    bookings.forEach(
        (booking) => {

            const user =
                booking.user || {};

            const event =
                booking.event || {};


            const row =
                document.createElement(
                    "tr"
                );


            row.className =
                "hover:bg-gray-50";


            row.innerHTML = `

                <!-- Customer -->

                <td
                    class="px-6 py-4"
                >

                    <div>

                        <p
                            class="font-medium
                                   text-gray-800"
                        >
                            ${escapeHTML(
                                user.name ||
                                "Unknown User"
                            )}
                        </p>

                        <p
                            class="text-sm
                                   text-gray-500"
                        >
                            ${escapeHTML(
                                user.email ||
                                "N/A"
                            )}
                        </p>

                    </div>

                </td>


                <!-- Event -->

                <td
                    class="px-6 py-4"
                >

                    <p
                        class="font-medium
                               text-gray-800"
                    >
                        ${escapeHTML(
                            event.title ||
                            "Unknown Event"
                        )}
                    </p>

                    <p
                        class="text-sm
                               text-gray-500"
                    >
                        ${formatDate(
                            event.eventDate
                        )}
                    </p>

                </td>


                <!-- Tickets -->

                <td
                    class="px-6 py-4"
                >

                    <span
                        class="font-medium"
                    >
                        ${Number(
                            booking.ticketQuantity ||
                            0
                        )}
                    </span>

                </td>


                <!-- Amount -->

                <td
                    class="px-6 py-4"
                >

                    <span
                        class="font-medium"
                    >
                        ${formatCurrency(
                            booking.totalAmount
                        )}
                    </span>

                </td>


                <!-- Status -->

                <td
                    class="px-6 py-4"
                >

                    ${getStatusBadge(
                        booking.bookingStatus
                    )}

                </td>


                <!-- Booking Date -->

                <td
                    class="px-6 py-4
                           text-sm text-gray-600"
                >

                    ${formatDate(
                        booking.createdAt
                    )}

                </td>


                <!-- Action -->

                <td
                    class="px-6 py-4
                           text-right"
                >

                    <button
                        type="button"
                        class="view-booking-button
                               px-4 py-2
                               rounded-lg
                               text-white
                               text-sm
                               font-medium
                               hover:opacity-90
                               transition"
                        style="background-color:#fc9e4f;"
                        data-booking-id="${escapeHTML(
                            booking._id
                        )}"
                    >
                        View
                    </button>

                </td>

            `;


            bookingTableBody.appendChild(
                row
            );

        }
    );

}


// ========================================
// Open Booking Details
// ========================================

function openBookingDetails(
    bookingId
) {

    const booking =
        allBookings.find(
            (item) =>
                item._id ===
                bookingId
        );


    if (!booking) {

        showError(
            "Booking details could not be found."
        );

        return;

    }


    const user =
        booking.user || {};

    const event =
        booking.event || {};

    const payment =
        booking.payment || {};


    modalBookingId.textContent =
        `Booking ID: ${booking._id}`;


    bookingDetails.innerHTML = `

        <!-- Customer -->

        <div>

            <h3
                class="text-sm font-semibold
                       text-gray-500 uppercase
                       mb-3"
            >
                Customer Information
            </h3>

            <div
                class="bg-gray-50
                       rounded-lg p-4"
            >

                <p>
                    <strong>Name:</strong>
                    ${escapeHTML(
                        user.name ||
                        "N/A"
                    )}
                </p>

                <p class="mt-2">
                    <strong>Email:</strong>
                    ${escapeHTML(
                        user.email ||
                        "N/A"
                    )}
                </p>

            </div>

        </div>


        <!-- Event -->

        <div>

            <h3
                class="text-sm font-semibold
                       text-gray-500 uppercase
                       mb-3"
            >
                Event Information
            </h3>

            <div
                class="bg-gray-50
                       rounded-lg p-4"
            >

                <p>
                    <strong>Event:</strong>
                    ${escapeHTML(
                        event.title ||
                        "N/A"
                    )}
                </p>

                <p class="mt-2">
                    <strong>Date:</strong>
                    ${formatDate(
                        event.eventDate
                    )}
                </p>

                <p class="mt-2">
                    <strong>Time:</strong>
                    ${escapeHTML(
                        event.startTime ||
                        "N/A"
                    )}
                    -
                    ${escapeHTML(
                        event.endTime ||
                        "N/A"
                    )}
                </p>

            </div>

        </div>


        <!-- Booking -->

        <div>

            <h3
                class="text-sm font-semibold
                       text-gray-500 uppercase
                       mb-3"
            >
                Booking Information
            </h3>

            <div
                class="bg-gray-50
                       rounded-lg p-4"
            >

                <p>
                    <strong>Tickets:</strong>
                    ${Number(
                        booking.ticketQuantity ||
                        0
                    )}
                </p>

                <p class="mt-2">
                    <strong>Total Amount:</strong>
                    ${formatCurrency(
                        booking.totalAmount
                    )}
                </p>

                <p class="mt-2">
                    <strong>Status:</strong>
                    ${getStatusBadge(
                        booking.bookingStatus
                    )}
                </p>

                <p class="mt-2">
                    <strong>Booking Date:</strong>
                    ${formatDate(
                        booking.createdAt
                    )}
                </p>

            </div>

        </div>


        <!-- Payment -->

        <div>

            <h3
                class="text-sm font-semibold
                       text-gray-500 uppercase
                       mb-3"
            >
                Payment Information
            </h3>

            <div
                class="bg-gray-50
                       rounded-lg p-4"
            >

                <p>
                    <strong>Payment Status:</strong>
                    ${escapeHTML(
                        booking.paymentStatus ||
                        "N/A"
                    )}
                </p>

                <p class="mt-2">
                    <strong>Payment ID:</strong>
                    ${escapeHTML(
                        payment._id ||
                        "N/A"
                    )}
                </p>

            </div>

        </div>

    `;


    bookingModal.classList.remove(
        "hidden"
    );

}


// ========================================
// Close Booking Modal
// ========================================

function closeBookingModal() {

    bookingModal.classList.add(
        "hidden"
    );

}


// ========================================
// View Booking Button
// ========================================

bookingTableBody.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                ".view-booking-button"
            );


        if (!button) {

            return;

        }


        const bookingId =
            button.dataset.bookingId;


        openBookingDetails(
            bookingId
        );

    }
);


// ========================================
// Search Event
// ========================================

searchInput.addEventListener(
    "input",
    filterBookings
);


// ========================================
// Event Filter
// ========================================

eventFilter.addEventListener(
    "change",
    filterBookings
);


// ========================================
// Status Filter
// ========================================

statusFilter.addEventListener(
    "change",
    filterBookings
);


// ========================================
// Close Modal
// ========================================

closeModalButton.addEventListener(
    "click",
    closeBookingModal
);


closeModalFooterButton.addEventListener(
    "click",
    closeBookingModal
);


// ========================================
// Close Modal Outside
// ========================================

bookingModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            bookingModal
        ) {

            closeBookingModal();

        }

    }
);


// ========================================
// Initial Load
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadOrganizerBookings();

    }
);