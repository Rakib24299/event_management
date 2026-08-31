// ========================================
// EventEase Organizer Attendance
// ========================================


// ========================================
// Configuration
// ========================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// ========================================
// DOM Elements
// ========================================

const eventInfo =
    document.getElementById(
        "eventInfo"
    );

const confirmedCount =
    document.getElementById(
        "confirmedCount"
    );

const attendedCount =
    document.getElementById(
        "attendedCount"
    );

const remainingCount =
    document.getElementById(
        "remainingCount"
    );

const scannerStatus =
    document.getElementById(
        "scannerStatus"
    );

const scanResult =
    document.getElementById(
        "scanResult"
    );

const loadingState =
    document.getElementById(
        "loadingState"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const attendanceTableWrapper =
    document.getElementById(
        "attendanceTableWrapper"
    );

const attendanceTableBody =
    document.getElementById(
        "attendanceTableBody"
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


const token = getToken();


// ========================================
// Authentication
// ========================================

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
// Load Event Bookings
// ========================================

const loadAttendance = async () => {

    try {

        loadingState.classList.remove(
            "hidden"
        );

        emptyState.classList.add(
            "hidden"
        );

        attendanceTableWrapper.classList.add(
            "hidden"
        );


        const result =
            await apiRequest(
                `/bookings/event/${eventId}`
            );


        const bookings =
            result.data || [];


        renderAttendance(
            bookings
        );


    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );


        loadingState.classList.add(
            "hidden"
        );


        attendanceTableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="px-6 py-10 text-center"
                >

                    <p
                        class="font-semibold text-red-500"
                    >
                        Failed to load attendance.
                    </p>

                    <p
                        class="mt-2 text-sm text-gray-500"
                    >
                        ${error.message}
                    </p>

                </td>

            </tr>

        `;


        attendanceTableWrapper.classList.remove(
            "hidden"
        );

    }

};


// ========================================
// Render Attendance
// ========================================

const renderAttendance = (
    bookings
) => {

    loadingState.classList.add(
        "hidden"
    );


    // ====================================
    // Event Information
    // ====================================

    if (
        bookings.length > 0 &&
        bookings[0].event
    ) {

        const event =
            bookings[0].event;


        eventInfo.textContent =
            `${event.title || "Event"} • ${
                formatDate(
                    event.eventDate
                )
            }`;

    }


    // ====================================
    // Confirmed Bookings
    // ====================================

    const confirmedBookings =
        bookings.filter(
            (booking) =>
                booking.bookingStatus ===
                "confirmed"
        );


    const attendedBookings =
        confirmedBookings.filter(
            (booking) =>
                booking.isScanned === true
        );


    const remaining =
        confirmedBookings.length -
        attendedBookings.length;


    confirmedCount.textContent =
        confirmedBookings.length;


    attendedCount.textContent =
        attendedBookings.length;


    remainingCount.textContent =
        remaining;


    // ====================================
    // Empty
    // ====================================

    if (
        confirmedBookings.length === 0
    ) {

        attendanceTableWrapper.classList.add(
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

    attendanceTableWrapper.classList.remove(
        "hidden"
    );


    attendanceTableBody.innerHTML = "";


    // ====================================
    // Render Rows
    // ====================================

    confirmedBookings.forEach(
        (booking) => {

            const customer =
                booking.user || {};


            const isScanned =
                booking.isScanned === true;


            const row =
                document.createElement(
                    "tr"
                );


            row.className =
                "transition hover:bg-gray-50";


            row.innerHTML = `

                <!-- Customer -->

                <td class="px-6 py-5">

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


                <!-- Booking Status -->

                <td class="px-6 py-5">

                    <span
                        class="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                    >

                        Confirmed

                    </span>

                </td>


                <!-- Attendance -->

                <td class="px-6 py-5">

                    ${
                        isScanned

                            ? `

                                <span
                                    class="inline-flex rounded-full bg-primaryLight px-3 py-1 text-xs font-semibold text-white"
                                >
                                    ✓ Attended
                                </span>

                            `

                            : `

                                <span
                                    class="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                                >
                                    Not Attended
                                </span>

                            `
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


            attendanceTableBody.appendChild(
                row
            );

        }
    );

};


// ========================================
// Handle QR Scan
// ========================================

const handleQRCode = async (
    decodedText
) => {

    try {

        scannerStatus.textContent =
            "QR detected. Verifying ticket...";


        scannerStatus.className =
            "mt-5 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-700";


        let qrData;


        try {

            qrData =
                JSON.parse(
                    decodedText
                );

        } catch {

            throw new Error(
                "Invalid QR code format."
            );

        }


        if (
            !qrData.bookingId
        ) {

            throw new Error(
                "Booking ID not found in QR code."
            );

        }


        const bookingId =
            qrData.bookingId;


        // ====================================
        // Scan API
        // ====================================

        const result =
            await apiRequest(
                `/bookings/${bookingId}/scan`,
                {
                    method: "PATCH",
                }
            );


        const booking =
            result.data;


        // ====================================
        // Success
        // ====================================

        scannerStatus.textContent =
            "Attendance verified successfully.";

        scannerStatus.className =
            "mt-5 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700";


        const customer =
            booking?.user || {};


        scanResult.innerHTML = `

            <div
                class="rounded-3xl bg-green-50 p-6"
            >

                <div
                    class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl"
                >
                    ✓
                </div>


                <h3
                    class="mt-4 text-center text-lg font-bold text-green-800"
                >
                    Attendance Verified
                </h3>


                <div
                    class="mt-5 space-y-3"
                >

                    <div
                        class="rounded-xl bg-white p-4"
                    >

                        <p
                            class="text-xs text-gray-500"
                        >
                            Customer
                        </p>

                        <p
                            class="mt-1 font-semibold text-gray-900"
                        >

                            ${
                                customer.name ||
                                "Customer"
                            }

                        </p>

                    </div>


                    <div
                        class="rounded-xl bg-white p-4"
                    >

                        <p
                            class="text-xs text-gray-500"
                        >
                            Email
                        </p>

                        <p
                            class="mt-1 font-semibold text-gray-900"
                        >

                            ${
                                customer.email ||
                                "-"
                            }

                        </p>

                    </div>


                    <div
                        class="rounded-xl bg-white p-4"
                    >

                        <p
                            class="text-xs text-gray-500"
                        >
                            Tickets
                        </p>

                        <p
                            class="mt-1 font-semibold text-gray-900"
                        >

                            ${
                                booking?.ticketQuantity ||
                                0
                            }

                        </p>

                    </div>

                </div>

            </div>

        `;


        await loadAttendance();


    } catch (error) {

        console.error(
            "QR scan error:",
            error
        );


        scannerStatus.textContent =
            error.message ||
            "Failed to verify QR code.";

        scannerStatus.className =
            "mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700";


        scanResult.innerHTML = `

            <div
                class="rounded-3xl bg-red-50 p-6 text-center"
            >

                <div
                    class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl"
                >
                    ✕
                </div>


                <h3
                    class="mt-4 font-bold text-red-800"
                >
                    Invalid Ticket
                </h3>


                <p
                    class="mt-2 text-sm text-red-600"
                >

                    ${error.message}

                </p>

            </div>

        `;

    }

};


// ========================================
// Start QR Scanner
// ========================================

const startScanner = () => {

    const scanner =
        new Html5Qrcode(
            "qr-reader"
        );


    scanner.start(

        {
            facingMode: "environment",
        },

        {
            fps: 10,

            qrbox: {
                width: 250,
                height: 250,
            },

        },

        (decodedText) => {

            handleQRCode(
                decodedText
            );

        },

        () => {

            // Ignore continuous scan errors

        }

    )
    .then(() => {

        scannerStatus.textContent =
            "Camera is active. Point it at a customer QR ticket.";

    })
    .catch((error) => {

        console.error(
            "Scanner start error:",
            error
        );


        scannerStatus.textContent =
            "Unable to access camera. Please allow camera permission.";

        scannerStatus.className =
            "mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700";

    });

};


// ========================================
// Initialize
// ========================================

const initializePage = async () => {

    await loadAttendance();

    startScanner();

};


initializePage();