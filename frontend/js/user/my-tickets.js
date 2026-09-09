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
                        <svg class="h-4 w-4 inline-block text-current align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
                        <svg class="h-4 w-4 inline-block text-current align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
                        <svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
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

        const event =
            getEvent(booking);

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

        const bookingStatus =
            String(
                booking?.bookingStatus ||
                "confirmed"
            ).toLowerCase();

        const user =
            booking?.user || {};

        const payment =
            booking?.payment || {};


        const ticketEl =
            document.createElement("div");

        ticketEl.style.cssText =
            "position:fixed;left:-9999px;top:0;width:800px;font-family:Arial,sans-serif;";

        ticketEl.innerHTML = `

            <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">

                <div style="background:#31572c;padding:40px;text-align:center;color:#ffffff;">

                    <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">

                        <span style="font-size:32px;">
                            <svg class="h-4 w-4 text-emerald-600 inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </span>

                    </div>

                    <p style="font-size:12px;font-weight:bold;letter-spacing:0.2em;color:#bbf7d0;margin:0;">
                        BOOKING CONFIRMED
                    </p>

                    <h1 style="font-size:36px;font-weight:800;margin:8px 0 0;">
                        Event Ticket
                    </h1>

                    <p style="font-size:14px;color:#bbf7d0;margin-top:8px;">
                        Your booking has been successfully confirmed.
                    </p>

                </div>

                <div style="padding:40px;">

                    <div style="border-bottom:1px solid #e5e7eb;padding-bottom:24px;margin-bottom:24px;">

                        <p style="font-size:12px;font-weight:bold;letter-spacing:0.1em;color:#9ca3af;margin:0;">
                            EVENT
                        </p>

                        <h2 style="font-size:28px;font-weight:800;color:#111827;margin:8px 0 0;">
                            ${escapeHTML(title)}
                        </h2>

                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;border-bottom:1px solid #e5e7eb;padding-bottom:24px;margin-bottom:24px;">

                        <div>

                            <p style="font-size:12px;color:#9ca3af;margin:0;">
                                Date
                            </p>

                            <p style="font-size:16px;font-weight:bold;color:#111827;margin:4px 0 0;">
                                ${escapeHTML(formatDate(eventDate))}
                            </p>

                        </div>

                        <div>

                            <p style="font-size:12px;color:#9ca3af;margin:0;">
                                Time
                            </p>

                            <p style="font-size:16px;font-weight:bold;color:#111827;margin:4px 0 0;">
                                ${escapeHTML(formatTime(eventDate))}
                            </p>

                        </div>

                        <div style="grid-column:1 / -1;">

                            <p style="font-size:12px;color:#9ca3af;margin:0;">
                                Venue
                            </p>

                            <p style="font-size:16px;font-weight:bold;color:#111827;margin:4px 0 0;">
                                ${escapeHTML(location)}
                            </p>

                        </div>

                    </div>

                    <div style="border-bottom:1px solid #e5e7eb;padding-bottom:24px;margin-bottom:24px;">

                        <h3 style="font-size:20px;font-weight:bold;color:#111827;margin:0 0 16px;">
                            Customer Information
                        </h3>

                        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

                            <span style="font-size:14px;color:#6b7280;">
                                Name
                            </span>

                            <span style="font-size:14px;font-weight:bold;color:#111827;text-align:right;">
                                ${escapeHTML(user.name || "Customer")}
                            </span>

                        </div>

                        <div style="display:flex;justify-content:space-between;">

                            <span style="font-size:14px;color:#6b7280;">
                                Email
                            </span>

                            <span style="font-size:14px;font-weight:bold;color:#111827;text-align:right;word-break:break-all;">
                                ${escapeHTML(user.email || "-")}
                            </span>

                        </div>

                    </div>

                    <div style="border-bottom:1px solid #e5e7eb;padding-bottom:24px;margin-bottom:24px;">

                        <h3 style="font-size:20px;font-weight:bold;color:#111827;margin:0 0 16px;">
                            Booking Information
                        </h3>

                        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

                            <span style="font-size:14px;color:#6b7280;">
                                Booking ID
                            </span>

                            <span style="font-size:14px;font-weight:bold;color:#111827;text-align:right;word-break:break-all;">
                                ${escapeHTML(bookingId)}
                            </span>

                        </div>

                        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

                            <span style="font-size:14px;color:#6b7280;">
                                Ticket Quantity
                            </span>

                            <span style="font-size:14px;font-weight:bold;color:#111827;">
                                ${quantity}
                            </span>

                        </div>

                        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

                            <span style="font-size:14px;color:#6b7280;">
                                Total Amount
                            </span>

                            <span style="font-size:14px;font-weight:bold;color:#31572c;">
                                ${formatPrice(totalAmount)}
                            </span>

                        </div>

                        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

                            <span style="font-size:14px;color:#6b7280;">
                                Payment Method
                            </span>

                            <span style="font-size:14px;font-weight:bold;color:#111827;text-align:right;">
                                ${escapeHTML(payment.paymentMethod ? payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1) : "Online")}
                            </span>

                        </div>

                        ${payment.transactionId ? `
                        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

                            <span style="font-size:14px;color:#6b7280;">
                                Transaction ID
                            </span>

                            <span style="font-size:14px;font-weight:bold;color:#111827;text-align:right;word-break:break-all;">
                                ${escapeHTML(payment.transactionId)}
                            </span>

                        </div>
                        ` : ""}

                        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">

                            <span style="font-size:14px;color:#6b7280;">
                                Payment Status
                            </span>

                            <span style="font-size:12px;font-weight:bold;background:#dcfce7;color:#166534;padding:4px 12px;border-radius:9999px;">
                                ${escapeHTML((payment.status || "PAID").toUpperCase())}
                            </span>

                        </div>

                        <div style="display:flex;justify-content:space-between;">

                            <span style="font-size:14px;color:#6b7280;">
                                Booking Status
                            </span>

                            <span style="font-size:12px;font-weight:bold;background:#dcfce7;color:#166534;padding:4px 12px;border-radius:9999px;">
                                ${escapeHTML(bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1))}
                            </span>

                        </div>

                    </div>

                    <div style="margin-top:24px;padding:20px;background:#eaf2e8;border-radius:12px;border:1px solid #bbf7d0;">

                        <p style="font-size:14px;line-height:1.6;color:#14532d;margin:0;">
                            Please keep this ticket available when attending the event. Your Booking ID can be used to verify your booking.
                        </p>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            ticketEl
        );


        const canvas =
            await html2canvas(
                ticketEl,
                {
                    scale: 2,
                    useCORS: true,
                    backgroundColor:
                        "#ffffff"
                }
            );


        const imgData =
            canvas.toDataURL(
                "image/png"
            );


        const pdf =
            new jspdf.jsPDF(
                {
                    orientation:
                        "portrait",
                    unit: "px",
                    format: [
                        canvas.width,
                        canvas.height
                    ]
                }
            );


        pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            canvas.width,
            canvas.height
        );


        pdf.save(
            `EventEase-Ticket-${bookingId}.pdf`
        );


        document.body.removeChild(
            ticketEl
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
                `${API_URL}/bookings/my/confirmed`,
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


        const confirmedBookings =
            Array.isArray(bookings)
              ? bookings.filter((booking) => {
                  const status =
                    String(
                      booking?.bookingStatus ||
                        ""
                    ).toLowerCase();

                  return status === "confirmed";
                })
              : [];


        if (
            !Array.isArray(confirmedBookings)
        ) {

            throw new Error(
                "Invalid booking data received from server."
            );
        }


        if (confirmedBookings.length === 0) {

            showEmpty();

            return;
        }


        currentBookings = confirmedBookings;


        ticketsList.innerHTML = "";


        confirmedBookings.forEach(
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
            confirmedBookings
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
