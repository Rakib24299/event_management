// ======================================================
// ORGANIZER PAYMENT INFORMATION
// ======================================================


// ======================================================
// Configuration
// ======================================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// ======================================================
// DOM Elements
// ======================================================

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const emptyState =
    document.getElementById("emptyState");

const paymentSection =
    document.getElementById("paymentSection");

const paymentTableBody =
    document.getElementById("paymentTableBody");

const totalPayments =
    document.getElementById("totalPayments");

const successfulPayments =
    document.getElementById("successfulPayments");

const totalRevenue =
    document.getElementById("totalRevenue");


// ======================================================
// Get Token
// ======================================================

function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken")
    );

}


// ======================================================
// Format Currency
// ======================================================

function formatCurrency(amount) {

    const value =
        Number(amount || 0);

    return `৳${value.toLocaleString(
        "en-BD",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;

}


// ======================================================
// Format Date
// ======================================================

function formatDate(date) {

    if (!date) {

        return "N/A";

    }


    const formattedDate =
        new Date(date);


    if (
        isNaN(
            formattedDate.getTime()
        )
    ) {

        return "N/A";

    }


    return formattedDate.toLocaleDateString(
        "en-BD",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ======================================================
// Payment Status Badge
// ======================================================

function getStatusBadge(status) {

    const normalizedStatus =
        String(status || "")
            .toLowerCase();


    if (normalizedStatus === "paid") {

        return `
            <span
                class="
                    inline-flex
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    bg-green-100
                    text-green-700
                "
            >
                Paid
            </span>
        `;

    }


    if (normalizedStatus === "pending") {

        return `
            <span
                class="
                    inline-flex
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    bg-yellow-100
                    text-yellow-700
                "
            >
                Pending
            </span>
        `;

    }


    if (normalizedStatus === "failed") {

        return `
            <span
                class="
                    inline-flex
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    bg-red-100
                    text-red-700
                "
            >
                Failed
            </span>
        `;

    }


    if (normalizedStatus === "cancelled") {

        return `
            <span
                class="
                    inline-flex
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    bg-gray-100
                    text-gray-700
                "
            >
                Cancelled
            </span>
        `;

    }


    if (normalizedStatus === "refunded") {

        return `
            <span
                class="
                    inline-flex
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    bg-purple-100
                    text-purple-700
                "
            >
                Refunded
            </span>
        `;

    }


    if (
        normalizedStatus ===
        "partially_refunded"
    ) {

        return `
            <span
                class="
                    inline-flex
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    bg-orange-100
                    text-orange-700
                "
            >
                Partially Refunded
            </span>
        `;

    }


    return `
        <span
            class="
                inline-flex
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold
                bg-gray-100
                text-gray-700
            "
        >
            ${status || "Unknown"}
        </span>
    `;

}


// ======================================================
// Get Customer Name
// ======================================================

function getCustomerName(payment) {

    const user =
        payment.user || {};


    return (
        user.name ||
        user.fullName ||
        user.username ||
        "Unknown Customer"
    );

}


// ======================================================
// Get Customer Email
// ======================================================

function getCustomerEmail(payment) {

    const user =
        payment.user || {};


    return (
        user.email ||
        ""
    );

}


// ======================================================
// Get Event Title
// ======================================================

function getEventTitle(payment) {

    const event =
        payment.event || {};


    // Populated Event
    if (
        typeof event === "object" &&
        event.title
    ) {

        return event.title;

    }


    // If event is only ObjectId
    if (
        typeof event === "string"
    ) {

        return "Event";

    }


    return "Unknown Event";

}


// ======================================================
// Get Payment Amount
// ======================================================

function getPaymentAmount(payment) {

    /*
     * Payment model:
     *
     * grossAmount
     * platformFee
     * organizerAmount
     *
     * Organizer payment page should show
     * organizerAmount as the organizer's revenue.
     */

    return Number(
        payment.organizerAmount || 0
    );

}


// ======================================================
// Get Transaction ID
// ======================================================

function getTransactionId(payment) {

    return (
        payment.transactionId ||
        payment._id ||
        "N/A"
    );

}


// ======================================================
// Get Payment Method
// ======================================================

function getPaymentMethod(payment) {

    const method =
        payment.paymentMethod ||
        "N/A";


    if (
        method === "sslcommerz"
    ) {

        return "SSLCommerz";

    }


    if (
        method === "dummy"
    ) {

        return "SSLCommerz";

    }


    return method;

}


// ======================================================
// Render Payment Row
// ======================================================

function renderPaymentRow(payment) {

    if (!payment) {

        return;

    }


    const transactionId =
        getTransactionId(
            payment
        );


    const customerName =
        getCustomerName(
            payment
        );


    const customerEmail =
        getCustomerEmail(
            payment
        );


    const eventTitle =
        getEventTitle(
            payment
        );


    const organizerAmount =
        getPaymentAmount(
            payment
        );


    const paymentMethod =
        getPaymentMethod(
            payment
        );


    const status =
        getStatusBadge(
            payment.status
        );


    const date =
        formatDate(
            payment.paidAt ||
            payment.createdAt
        );


    const paymentId =
        payment._id;


    const row =
        document.createElement(
            "tr"
        );


    row.className =
        "hover:bg-gray-50 transition";


    row.innerHTML = `

        <!-- Transaction -->

        <td class="px-6 py-5">

            <div
                class="
                    max-w-[180px]
                    truncate
                    font-medium
                    text-gray-800
                "
                title="${transactionId}"
            >
                ${transactionId}
            </div>

        </td>


        <!-- Customer -->

        <td class="px-6 py-5">

            <div
                class="
                    font-medium
                    text-gray-800
                "
            >
                ${customerName}
            </div>

            ${
                customerEmail
                    ? `
                        <div
                            class="
                                mt-1
                                text-sm
                                text-gray-500
                            "
                        >
                            ${customerEmail}
                        </div>
                    `
                    : ""
            }

        </td>


        <!-- Event -->

        <td class="px-6 py-5">

            <div
                class="
                    max-w-[220px]
                    truncate
                    font-medium
                    text-gray-800
                "
                title="${eventTitle}"
            >
                ${eventTitle}
            </div>

        </td>


        <!-- Organizer Amount -->

        <td class="px-6 py-5">

            <span
                class="
                    font-semibold
                    text-green-600
                "
            >
                ${formatCurrency(
                    organizerAmount
                )}
            </span>

        </td>


        <!-- Payment Method -->

        <td class="px-6 py-5">

            <span
                class="
                    text-sm
                    text-gray-700
                "
            >
                ${paymentMethod}
            </span>

        </td>


        <!-- Status -->

        <td class="px-6 py-5">

            ${status}

        </td>


        <!-- Date -->

        <td
            class="
                whitespace-nowrap
                px-6
                py-5
                text-sm
                text-gray-600
            "
        >

            ${date}

        </td>


        <!-- View Details -->

        <td class="px-6 py-5">

            ${
                paymentId
                    ? `
                        <a
                            href="./payment-details.html?id=${encodeURIComponent(
                                paymentId
                            )}"
                            class="
                                inline-flex
                                items-center
                                whitespace-nowrap
                                rounded-lg
                                bg-[#e76f51]
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#c9553b]
                            "
                        >
                            View Details
                        </a>
                    `
                    : `
                        <span
                            class="
                                text-xs
                                text-gray-400
                            "
                        >
                            N/A
                        </span>
                    `
            }

        </td>

    `;


    paymentTableBody.appendChild(
        row
    );

}


// ======================================================
// Update Summary
// ======================================================

function updateSummary(payments) {

    const total =
        payments.length;


    const paidPayments =
        payments.filter(
            payment =>
                String(
                    payment.status || ""
                ).toLowerCase() ===
                "paid"
        );


    /*
     * Organizer Revenue
     *
     * Only successful/paid payments
     * are counted as revenue.
     */

    const revenue =
        paidPayments.reduce(
            (
                sum,
                payment
            ) => {

                return (
                    sum +
                    Number(
                        payment.organizerAmount ||
                        0
                    )
                );

            },
            0
        );


    if (totalPayments) {

        totalPayments.textContent =
            total;

    }


    if (successfulPayments) {

        successfulPayments.textContent =
            paidPayments.length;

    }


    if (totalRevenue) {

        totalRevenue.textContent =
            formatCurrency(
                revenue
            );

    }

}


// ======================================================
// Show Error
// ======================================================

function showError(message) {

    if (loading) {

        loading.classList.add(
            "hidden"
        );

    }


    if (paymentSection) {

        paymentSection.classList.add(
            "hidden"
        );

    }


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );

    }


    if (errorMessage) {

        errorMessage.textContent =
            message;

        errorMessage.classList.remove(
            "hidden"
        );

    }

}


// ======================================================
// Fetch Organizer Payments
// ======================================================

async function loadOrganizerPayments() {

    try {

        // ==============================================
        // Reset UI
        // ==============================================

        if (loading) {

            loading.classList.remove(
                "hidden"
            );

        }


        if (errorMessage) {

            errorMessage.classList.add(
                "hidden"
            );

        }


        if (paymentSection) {

            paymentSection.classList.add(
                "hidden"
            );

        }


        if (emptyState) {

            emptyState.classList.add(
                "hidden"
            );

        }


        // ==============================================
        // Get Token
        // ==============================================

        const token =
            getToken();


        if (!token) {

            showError(
                "You are not logged in. Please login as an organizer."
            );

            return;

        }


        // ==============================================
        // API Request
        // ==============================================

        const response =
            await fetch(
                `${API_BASE_URL}/payments/organizer`,
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


        // ==============================================
        // Read Response
        // ==============================================

        const result =
            await response.json();


        // ==============================================
        // Backend Error
        // ==============================================

        if (!response.ok) {

            throw new Error(

                result.message ||

                "Failed to load organizer payments."

            );

        }


        // ==============================================
        // Extract Payments
        // ==============================================

        let payments = [];


        /*
         * Expected:
         *
         * {
         *   success: true,
         *   data: [...]
         * }
         *
         */

        if (
            Array.isArray(
                result.data
            )
        ) {

            payments =
                result.data;

        }


        /*
         * Also handle:
         *
         * {
         *   success: true,
         *   data: {
         *      payments: [...]
         *   }
         * }
         */

        else if (
            result.data &&
            Array.isArray(
                result.data.payments
            )
        ) {

            payments =
                result.data.payments;

        }


        // ==============================================
        // Hide Loading
        // ==============================================

        if (loading) {

            loading.classList.add(
                "hidden"
            );

        }


        // ==============================================
        // Update Summary
        // ==============================================

        updateSummary(
            payments
        );


        // ==============================================
        // Empty State
        // ==============================================

        if (
            payments.length === 0
        ) {

            if (emptyState) {

                emptyState.classList.remove(
                    "hidden"
                );

            }

            return;

        }


        // ==============================================
        // Clear Existing Rows
        // ==============================================

        if (paymentTableBody) {

            paymentTableBody.innerHTML =
                "";

        }


        // ==============================================
        // Render Payment Rows
        // ==============================================

        payments.forEach(
            payment => {

                renderPaymentRow(
                    payment
                );

            }
        );


        // ==============================================
        // Show Payment Section
        // ==============================================

        if (paymentSection) {

            paymentSection.classList.remove(
                "hidden"
            );

        }

    }

    catch (error) {

        console.error(
            "Organizer payment error:",
            error
        );


        showError(

            error.message ||

            "Something went wrong while loading payments."

        );

    }

}


// ======================================================
// Initial Load
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadOrganizerPayments();

    }
);