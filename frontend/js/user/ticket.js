"use strict";

// CONFIG

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// ELEMENTS

const loadingState =
    document.getElementById("loadingState");

const errorState =
    document.getElementById("errorState");

const errorMessage =
    document.getElementById("errorMessage");

const ticketSection =
    document.getElementById("ticketSection");

const downloadTicketBtn =
    document.getElementById("downloadTicketBtn");


// GET BOOKING ID

const params =
    new URLSearchParams(
        window.location.search
    );

const bookingId =
    params.get("bookingId");


// AUTH TOKEN

const token =
    localStorage.getItem("token");


// SHOW ERROR

function showError(message) {

    loadingState.classList.add("hidden");

    ticketSection.classList.add("hidden");

    errorState.classList.remove("hidden");

    errorMessage.textContent =
        message;
}


// FORMAT DATE

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "en-BD",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


// FORMAT TIME

function formatTime(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleTimeString(
        "en-BD",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// FORMAT MONEY

function formatMoney(amount) {

    return `৳${Number(
        amount || 0
    ).toLocaleString("en-BD")}`;
}


// LOAD BOOKING

async function loadTicket() {

    if (!bookingId) {

        showError(
            "Booking ID is missing."
        );

        return;
    }


    if (!token) {

        showError(
            "You are not logged in. Please login first."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/bookings/${encodeURIComponent(
                    bookingId
                )}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load booking."
            );

        }


        const booking =
            result.data;


        // BOOKING STATUS CHECK

        if (
            booking.bookingStatus !==
            "confirmed"
        ) {

            showError(
                "This booking has not been confirmed yet."
            );

            return;
        }


        // EVENT

        const event =
            booking.event || {};


        // USER

        const user =
            booking.user || {};


        // DISPLAY EVENT

        document.getElementById(
            "eventName"
        ).textContent =
            event.name ||
            event.title ||
            "Event";


        document.getElementById(
            "eventDate"
        ).textContent =
            formatDate(
                event.eventDate
            );


        document.getElementById(
            "eventTime"
        ).textContent =
            event.eventTime ||
            formatTime(
                event.eventDate
            );


        document.getElementById(
            "eventVenue"
        ).textContent =
            event.venue ||
            event.location ||
            "Venue information unavailable";


        // CUSTOMER

        document.getElementById(
            "customerName"
        ).textContent =
            user.name ||
            "Customer";


        document.getElementById(
            "customerEmail"
        ).textContent =
            user.email ||
            "-";


        // BOOKING

        document.getElementById(
            "bookingId"
        ).textContent =
            booking._id ||
            bookingId;


        document.getElementById(
            "ticketQuantity"
        ).textContent =
            booking.ticketQuantity ||
            0;


        document.getElementById(
            "paymentAmount"
        ).textContent =
            formatMoney(
                booking.totalAmount
            );


        // SHOW TICKET

        loadingState.classList.add(
            "hidden"
        );

        ticketSection.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Ticket loading error:",
            error
        );

        showError(
            error.message ||
            "Unable to load ticket."
        );

    }

}


// DOWNLOAD PDF

function downloadTicketPDF() {

    const ticket =
        document.getElementById(
            "ticketContent"
        );


    if (!ticket) {

        alert(
            "Ticket content not found."
        );

        return;
    }


    if (
        typeof html2pdf ===
        "undefined"
    ) {

        alert(
            "PDF generator is not available."
        );

        return;
    }


    const bookingText =
        document.getElementById(
            "bookingId"
        ).textContent;


    const filename =
        `EventEase-Ticket-${bookingText}.pdf`;


    const options = {

        margin: 0.4,

        filename,

        image: {
            type: "jpeg",
            quality: 0.98
        },

        html2canvas: {
            scale: 2,
            useCORS: true
        },

        jsPDF: {
            unit: "in",
            format: "a4",
            orientation: "portrait"
        }

    };


    html2pdf()
        .set(options)
        .from(ticket)
        .save();

}


// DOWNLOAD BUTTON

downloadTicketBtn.addEventListener(
    "click",
    downloadTicketPDF
);


// INITIALIZE

loadTicket();