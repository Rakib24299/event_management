// ========================================
// EventEase My Tickets
// ========================================

const API_URL = "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const ticketsLoading =
    document.getElementById("ticketsLoading");

const ticketsError =
    document.getElementById("ticketsError");

const ticketsErrorMessage =
    document.getElementById("ticketsErrorMessage");

const ticketsEmpty =
    document.getElementById("ticketsEmpty");

const ticketsContent =
    document.getElementById("ticketsContent");

const ticketsList =
    document.getElementById("ticketsList");

const retryTicketsButton =
    document.getElementById("retryTicketsButton");


// ========================================
// Token
// ========================================

const token =
    localStorage.getItem("token");


// ========================================
// State
// ========================================

let currentBookings = [];


// ========================================
// Format Price
// ========================================

function formatPrice(price) {

    const amount =
        Number(price || 0);

    return `৳${amount.toLocaleString()}`;
}


// ========================================
// Format Date
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "--";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


// ========================================
// Format Time
// ========================================

function formatTime(dateValue) {

    if (!dateValue) {
        return "--";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


// ========================================
// Escape HTML
// ========================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// Show Loading
// ========================================

function showLoading() {

    ticketsLoading.classList.remove("hidden");

    ticketsError.classList.add("hidden");

    ticketsEmpty.classList.add("hidden");

    ticketsContent.classList.add("hidden");
}


// ========================================
// Show Error
// ========================================

function showError(message) {

    ticketsLoading.classList.add("hidden");

    ticketsContent.classList.add("hidden");

    ticketsEmpty.classList.add("hidden");

    ticketsErrorMessage.textContent =
        message ||
        "Unable to load your tickets.";

    ticketsError.classList.remove("hidden");
}


// ========================================
// Show Empty
// ========================================

function showEmpty() {

    ticketsLoading.classList.add("hidden");

    ticketsError.classList.add("hidden");

    ticketsContent.classList.add("hidden");

    ticketsEmpty.classList.remove("hidden");
}


// ========================================
// Show Tickets
// ========================================

function showTickets() {

    ticketsLoading.classList.add("hidden");

    ticketsError.classList.add("hidden");

    ticketsEmpty.classList.add("hidden");

    ticketsContent.classList.remove("hidden");
}


// ========================================
// Get Booking ID
// ========================================

function getBookingId(booking) {

    return (
        booking?._id ||
        booking?.id ||
        ""
    );
}


// ========================================
// Get Event
// ========================================

function getEvent(booking) {

    return booking?.event || {};
}


// ========================================
// Get Event Image
// ========================================

function getEventImage(event) {

    return (
        event?.bannerImage?.url ||
        event?.image ||
        "https://via.placeholder.com/600x350?text=EventEase"
    );
}


// ========================================
// Get Quantity
// ========================================

function getQuantity(booking) {

    return Number(
        booking?.ticketQuantity ??
        booking?.quantity ??
        booking?.tickets ??
        1
    );
}


// ========================================
// Get Total Amount
// ========================================

function getTotalAmount(booking) {

    return Number(
        booking?.totalAmount ??
        booking?.amount ??
        0
    );
}


// ========================================
// Create Ticket Card
// ========================================

function createTicketCard(booking, index) {

    const event =
        getEvent(booking);

    const bookingId =
        getBookingId(booking);

    const quantity =
        getQuantity(booking);

    const totalAmount =
        getTotalAmount(booking);

    const eventDate =
        event?.eventDate ||
        event?.date ||
        booking?.eventDate;

    const location =
        event?.venue?.venueName ||
        event?.location ||
        event?.venue ||
        "Location not available";

    const title =
        event?.title ||
        "Event";

    const image =
        getEventImage(event);

    const bookingStatus =
        String(
            booking?.bookingStatus ||
            "confirmed"
        ).toLowerCase();


    const ticketElement =
        document.createElement("article");


    ticketElement.className =
        "ticket-card overflow-hidden rounded-3xl bg-white shadow-soft";


    ticketElement.dataset.bookingId =
        bookingId;


    ticketElement.innerHTML = `

        <!-- Ticket Image -->

        <div class="relative h-48 overflow-hidden sm:h-56">

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(title)}"
                class="h-full w-full object-cover"
            >

            <div
                class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
            ></div>


            <!-- Status -->

            <div
                class="absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold ${
                    bookingStatus === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                }"
            >
                ${escapeHTML(
                    bookingStatus.charAt(0).toUpperCase() +
                    bookingStatus.slice(1)
                )}
            </div>


            <!-- Event Title -->

            <div class="absolute bottom-4 left-5 right-5">

                <p class="text-xs font-medium text-white/80">
                    Event Ticket
                </p>

                <h2 class="mt-1 text-xl font-bold text-white">
                    ${escapeHTML(title)}
                </h2>

            </div>

        </div>


        <!-- Ticket Body -->

        <div class="p-5 sm:p-6">


            <!-- Event Information -->

            <div class="space-y-4">


                <!-- Date -->

                <div class="flex items-start gap-3">

                    <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primaryLight"
                    >
                        📅
                    </div>

                    <div>

                        <p class="text-xs text-gray-400">
                            Date
                        </p>

                        <p class="mt-1 text-sm font-semibold text-gray-900">
                            ${escapeHTML(formatDate(eventDate))}
                        </p>

                        <p class="mt-0.5 text-xs text-gray-500">
                            ${escapeHTML(formatTime(eventDate))}
                        </p>

                    </div>

                </div>


                <!-- Location -->

                <div class="flex items-start gap-3">

                    <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primaryLight"
                    >
                        📍
                    </div>

                    <div>

                        <p class="text-xs text-gray-400">
                            Location
                        </p>

                        <p class="mt-1 text-sm font-semibold text-gray-900">
                            ${escapeHTML(location)}
                        </p>

                    </div>

                </div>


                <!-- Booking -->

                <div class="flex items-start gap-3">

                    <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primaryLight"
                    >
                        🎫
                    </div>

                    <div>

                        <p class="text-xs text-gray-400">
                            Booking ID
                        </p>

                        <p class="mt-1 break-all text-sm font-semibold text-gray-900">
                            ${escapeHTML(bookingId || "--")}
                        </p>

                    </div>

                </div>


            </div>


            <!-- Divider -->

            <div class="my-5 border-t border-dashed border-gray-200"></div>


            <!-- Ticket Summary -->

            <div class="grid grid-cols-2 gap-4">

                <div
                    class="rounded-2xl bg-gray-50 p-4"
                >

                    <p class="text-xs text-gray-400">
                        Tickets
                    </p>

                    <p class="mt-1 text-lg font-bold text-gray-900">
                        ${quantity}
                    </p>

                </div>


                <div
                    class="rounded-2xl bg-gray-50 p-4"
                >

                    <p class="text-xs text-gray-400">
                        Total Paid
                    </p>

                    <p class="mt-1 text-lg font-bold text-primary">
                        ${formatPrice(totalAmount)}
                    </p>

                </div>

            </div>


            <!-- Actions -->

            <div class="mt-5 grid gap-3 sm:grid-cols-2">


                <!-- View Ticket -->

                <button
                    type="button"
                    class="view-ticket-button rounded-xl border border-primary px-4 py-3 text-sm font-bold text-primary transition hover:bg-primaryLight"
                    data-booking-id="${escapeHTML(bookingId)}"
                >
                    View Ticket
                </button>


                <!-- Download -->

                <button
                    type="button"
                    class="download-ticket-button rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primaryDark focus:outline-none focus:ring-4 focus:ring-primary/20"
                    data-index="${index}"
                >
                    Download PDF
                </button>

            </div>


        </div>

    `;


    return ticketElement;
}


// ========================================
// Render Tickets
// ========================================

function renderTickets(bookings) {

    ticketsList.innerHTML = "";


    bookings.forEach(
        (booking, index) => {

            const card =
                createTicketCard(
                    booking,
                    index
                );

            ticketsList.appendChild(card);

        }
    );


    showTickets();
}


// ========================================
// Attach Ticket Events
// ========================================

function attachTicketEvents(
    bookings
) {

    document
        .querySelectorAll(
            ".download-ticket-button"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    async () => {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        const booking =
                            bookings[index];


                        if (!booking) {

                            alert(
                                "Ticket information was not found."
                            );

                            return;
                        }


                        await downloadTicketPDF(
                            booking,
                            button
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".view-ticket-button"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const bookingId =
                            button.dataset.bookingId;


                        const booking =
                            bookings.find(
                                (item) =>
                                    getBookingId(item) ===
                                    bookingId
                            );


                        if (!booking) {

                            alert(
                                "Ticket information was not found."
                            );

                            return;
                        }


                        viewTicket(
                            booking
                        );

                    }
                );

            }
        );

}


// ========================================
// Download Ticket PDF
// ========================================

async function downloadTicketPDF(
    booking,
    downloadButton
) {

    const bookingId =
        getBookingId(booking);


    if (!bookingId) {

        alert(
            "Booking ID not found. Unable to download ticket."
        );

        return;

    }


    const originalText =
        downloadButton?.textContent;


    if (downloadButton) {

        downloadButton.disabled = true;

        downloadButton.textContent =
            "Generating PDF...";

    }


    try {

        const response =
            await fetch(
                `${API_URL}/bookings/${encodeURIComponent(
                    bookingId
                )}/ticket/pdf`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (
            !response.ok
        ) {

            let errorMessage =
                "Unable to generate ticket PDF.";


            try {

                const result =
                    await response.json();

                errorMessage =
                    result.message ||
                    errorMessage;

            } catch (error) {

            }


            throw new Error(
                errorMessage
            );

        }


        const blob =
            await response.blob();


        const url =
            window.URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;

        link.download =
            `EventEase-Ticket-${bookingId}.pdf`;


        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
            url
        );


    } catch (error) {

        console.error(
            "PDF Generation Error:",
            error
        );


        alert(
            error.message ||
            "Unable to generate ticket PDF. Please try again."
        );


    } finally {

        if (downloadButton) {

            downloadButton.disabled = false;

            downloadButton.textContent =
                originalText ||
                "Download PDF";

        }

    }

}


// ========================================
// View Ticket
// ========================================

function viewTicket(booking) {

    const bookingId =
        getBookingId(booking);


    sessionStorage.setItem(
        "selectedTicket",
        JSON.stringify(booking)
    );


    window.location.href =
        `./booking-details.html?id=${encodeURIComponent(
            bookingId
        )}`;

}


// ========================================
// Load My Tickets
// ========================================

async function loadMyTickets() {

    if (!token) {

        showError(
            "Your login session has expired. Please login again."
        );

        return;
    }


    showLoading();


    try {

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


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load tickets."
            );
        }


        const bookings =
            result.data?.bookings ||
            result.data ||
            [];


        if (
            !Array.isArray(bookings)
        ) {

            throw new Error(
                "Invalid booking data received from server."
            );
        }


        if (bookings.length === 0) {

            showEmpty();

            return;
        }


        currentBookings = bookings;


        ticketsList.innerHTML = "";


        bookings.forEach(
            (booking, index) => {

                const card =
                    createTicketCard(
                        booking,
                        index
                    );

                ticketsList.appendChild(
                    card
                );

            }
        );


        showTickets();


        attachTicketEvents(
            bookings
        );


    } catch (error) {

        console.error(
            "My Tickets Error:",
            error
        );


        showError(
            error.message ||
            "Unable to load your tickets."
        );
    }
}


// ========================================
// Retry
// ========================================

retryTicketsButton.addEventListener(
    "click",
    () => {

        loadMyTickets();

    }
);


// ========================================
// Start
// ========================================

loadMyTickets();
