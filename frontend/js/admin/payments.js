// ======================================================
// ADMIN PAYMENT MANAGEMENT
// ======================================================


// ======================================================
// CONFIGURATION
// ======================================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// ======================================================
// DOM ELEMENTS
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

const platformRevenue =
    document.getElementById("platformRevenue");


// ======================================================
// GET AUTHENTICATION TOKEN
// ======================================================

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


// ======================================================
// SAFE HTML ESCAPE
// ======================================================

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// ======================================================
// FORMAT CURRENCY
// ======================================================

function formatCurrency(amount) {

    return `৳${Number(amount || 0).toLocaleString(
        "en-BD",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;

}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(date) {

    if (!date) {
        return "N/A";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "N/A";
    }

    return parsedDate.toLocaleDateString(
        "en-BD",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ======================================================
// SAFE TEXT
// ======================================================

function safeText(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "N/A";
    }

    return String(value);

}


// ======================================================
// NORMALIZE PAYMENT STATUS
// ======================================================

function getPaymentStatus(payment) {

    return String(
        payment?.paymentStatus ??
        payment?.status ??
        "pending"
    ).toLowerCase();

}


// ======================================================
// GET CUSTOMER
// ======================================================

function getCustomer(payment) {

    return (
        payment?.user ||
        payment?.customer ||
        {}
    );

}


// ======================================================
// GET ORGANIZER
// ======================================================

function getOrganizer(payment) {

    if (payment?.organizer) {
        return payment.organizer;
    }

    if (
        payment?.booking &&
        payment.booking.organizer
    ) {
        return payment.booking.organizer;
    }

    if (
        payment?.event &&
        payment.event.organizer
    ) {
        return payment.event.organizer;
    }

    return {};

}


// ======================================================
// GET EVENT
// ======================================================

function getEvent(payment) {

    if (payment?.event) {
        return payment.event;
    }

    if (
        payment?.booking &&
        payment.booking.event
    ) {
        return payment.booking.event;
    }

    return {};

}


// ======================================================
// GET CUSTOMER NAME
// ======================================================

function getCustomerName(payment) {

    const user =
        getCustomer(payment);

    return safeText(
        user.name ||
        user.fullName ||
        user.username ||
        user.email
    );

}


// ======================================================
// GET ORGANIZER NAME
// ======================================================

function getOrganizerName(payment) {

    const organizer =
        getOrganizer(payment);

    return safeText(
        organizer.name ||
        organizer.fullName ||
        organizer.username ||
        organizer.organizationName ||
        organizer.email
    );

}


// ======================================================
// GET EVENT TITLE
// ======================================================

function getEventTitle(payment) {

    const event =
        getEvent(payment);

    return safeText(
        event.title ||
        event.name
    );

}


// ======================================================
// GET PAYMENT METHOD
// ======================================================

function getPaymentMethod(payment) {

    return safeText(
        payment.paymentMethod ||
        payment.method
    );

}


// ======================================================
// GET PAYMENT AMOUNT
// ======================================================

function getGrossAmount(payment) {

    return Number(
        payment.grossAmount ??
        payment.amount ??
        payment.totalAmount ??
        0
    );

}


// ======================================================
// GET PLATFORM FEE
// ======================================================

function getPlatformFee(payment) {

    return Number(
        payment.platformFee ??
        payment.platformRevenue ??
        0
    );

}


// ======================================================
// GET ORGANIZER AMOUNT
// ======================================================

function getOrganizerAmount(payment) {

    if (
        payment.organizerAmount !== undefined &&
        payment.organizerAmount !== null
    ) {
        return Number(
            payment.organizerAmount
        );
    }

    const gross =
        getGrossAmount(payment);

    const fee =
        getPlatformFee(payment);

    return Math.max(
        0,
        gross - fee
    );

}


// ======================================================
// GET TRANSACTION ID
// ======================================================

function getTransactionId(payment) {

    return safeText(
        payment.transactionId ||
        payment.transactionID ||
        payment.tranId ||
        payment._id
    );

}


// ======================================================
// STATUS BADGE
// ======================================================

function getStatusBadge(status) {

    const normalizedStatus =
        String(
            status || "pending"
        ).toLowerCase();


    const statusMap = {

        paid: {
            text: "Paid",
            className:
                "bg-green-100 text-green-700"
        },

        pending: {
            text: "Pending",
            className:
                "bg-yellow-100 text-yellow-700"
        },

        processing: {
            text: "Processing",
            className:
                "bg-blue-100 text-blue-700"
        },

        failed: {
            text: "Failed",
            className:
                "bg-red-100 text-red-700"
        },

        cancelled: {
            text: "Cancelled",
            className:
                "bg-gray-100 text-gray-700"
        },

        refunded: {
            text: "Refunded",
            className:
                "bg-purple-100 text-purple-700"
        },

        partially_refunded: {
            text: "Partially Refunded",
            className:
                "bg-orange-100 text-orange-700"
        }

    };


    const item =
        statusMap[normalizedStatus] || {

            text:
                safeText(status),

            className:
                "bg-gray-100 text-gray-700"

        };


    return `
        <span
            class="
                inline-flex
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold
                ${item.className}
            "
        >
            ${escapeHtml(item.text)}
        </span>
    `;

}


// ======================================================
// EXTRACT PAYMENT ARRAY
// ======================================================

function extractPayments(result) {

    if (Array.isArray(result)) {
        return result;
    }

    if (
        result &&
        Array.isArray(result.data)
    ) {
        return result.data;
    }

    if (
        result &&
        result.data &&
        Array.isArray(result.data.payments)
    ) {
        return result.data.payments;
    }

    if (
        result &&
        Array.isArray(result.payments)
    ) {
        return result.payments;
    }

    return [];

}


// ======================================================
// RENDER PAYMENT ROW
// ======================================================

function renderPaymentRow(payment) {

    const row =
        document.createElement("tr");

    row.className =
        "hover:bg-gray-50 transition";


    const transactionId =
        getTransactionId(payment);

    const customerName =
        getCustomerName(payment);

    const organizerName =
        getOrganizerName(payment);

    const eventTitle =
        getEventTitle(payment);

    const customer =
        getCustomer(payment);

    const organizer =
        getOrganizer(payment);

    const grossAmount =
        getGrossAmount(payment);

    const platformFee =
        getPlatformFee(payment);

    const organizerAmount =
        getOrganizerAmount(payment);

    const paymentMethod =
        getPaymentMethod(payment);

    const status =
        getPaymentStatus(payment);

    const date =
        payment.paidAt ||
        payment.paymentDate ||
        payment.createdAt;

    const paymentId =
        payment._id;


    row.innerHTML = `

        <!-- Transaction -->

        <td class="px-6 py-5">

            <div
                class="max-w-[180px] break-all font-medium text-gray-800"
            >
                ${escapeHtml(transactionId)}
            </div>

        </td>


        <!-- Customer -->

        <td class="px-6 py-5">

            <div class="font-medium text-gray-800">
                ${escapeHtml(customerName)}
            </div>

            <div class="mt-1 text-sm text-gray-500">
                ${escapeHtml(
                    safeText(customer.email)
                )}
            </div>

        </td>


        <!-- Organizer -->

        <td class="px-6 py-5">

            <div class="font-medium text-gray-800">
                ${escapeHtml(organizerName)}
            </div>

            <div class="mt-1 text-sm text-gray-500">
                ${escapeHtml(
                    safeText(organizer.email)
                )}
            </div>

        </td>


        <!-- Event -->

        <td class="px-6 py-5">

            <div
                class="max-w-[220px] font-medium text-gray-800"
            >
                ${escapeHtml(eventTitle)}
            </div>

        </td>


        <!-- Gross Amount -->

        <td class="px-6 py-5">

            <span class="font-semibold text-gray-800">
                ${formatCurrency(grossAmount)}
            </span>

        </td>


        <!-- Platform Fee -->

        <td class="px-6 py-5">

            <span class="font-semibold text-blue-600">
                ${formatCurrency(platformFee)}
            </span>

        </td>


        <!-- Organizer Amount -->

        <td class="px-6 py-5">

            <span class="font-semibold text-green-600">
                ${formatCurrency(organizerAmount)}
            </span>

        </td>


        <!-- Payment Method -->

        <td class="px-6 py-5">

            <span class="capitalize text-gray-700">
                ${escapeHtml(paymentMethod)}
            </span>

        </td>


        <!-- Status -->

        <td class="px-6 py-5">

            ${getStatusBadge(status)}

        </td>


        <!-- Date -->

        <td
            class="
                px-6
                py-5
                whitespace-nowrap
                text-sm
                text-gray-600
            "
        >
            ${formatDate(date)}
        </td>


        <!-- Action -->

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
                        <span class="text-sm text-gray-400">
                            N/A
                        </span>
                    `
            }

        </td>

    `;


    paymentTableBody.appendChild(row);

}


// ======================================================
// UPDATE SUMMARY
// ======================================================

function updateSummary(payments) {

    const total =
        payments.length;


    const paidPayments =
        payments.filter(
            payment =>
                getPaymentStatus(payment) ===
                "paid"
        );


    const revenue =
        paidPayments.reduce(
            (sum, payment) => {

                return (
                    sum +
                    getGrossAmount(payment)
                );

            },
            0
        );


    const platformFees =
        paidPayments.reduce(
            (sum, payment) => {

                return (
                    sum +
                    getPlatformFee(payment)
                );

            },
            0
        );


    totalPayments.textContent =
        total;

    successfulPayments.textContent =
        paidPayments.length;

    totalRevenue.textContent =
        formatCurrency(revenue);

    platformRevenue.textContent =
        formatCurrency(platformFees);

}


// ======================================================
// SHOW ERROR
// ======================================================

function showError(message) {

    loading.classList.add(
        "hidden"
    );

    paymentSection.classList.add(
        "hidden"
    );

    emptyState.classList.add(
        "hidden"
    );


    errorMessage.textContent =
        message;

    errorMessage.classList.remove(
        "hidden"
    );

}


// ======================================================
// API RESPONSE ERROR HANDLING
// ======================================================

async function parseResponse(response) {

    const text =
        await response.text();

    let result = null;

    try {

        result =
            text
                ? JSON.parse(text)
                : null;

    } catch {

        result = null;

    }


    if (!response.ok) {

        throw new Error(

            result?.message ||
            result?.error ||
            `Request failed with status ${response.status}`

        );

    }


    return result;

}


// ======================================================
// LOAD ADMIN PAYMENTS
// ======================================================

async function loadAdminPayments() {

    try {

        loading.classList.remove(
            "hidden"
        );

        errorMessage.classList.add(
            "hidden"
        );

        paymentSection.classList.add(
            "hidden"
        );

        emptyState.classList.add(
            "hidden"
        );


        const token =
            getToken();


        if (!token) {

            throw new Error(
                "You are not logged in. Please login as an admin."
            );

        }


        const response =
            await fetch(
                `${API_BASE_URL}/payments/admin`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const result =
            await parseResponse(
                response
            );


        const payments =
            extractPayments(
                result
            );


        updateSummary(
            payments
        );


        loading.classList.add(
            "hidden"
        );


        if (
            payments.length === 0
        ) {

            emptyState.classList.remove(
                "hidden"
            );

            return;

        }


        paymentTableBody.innerHTML =
            "";


        payments.forEach(
            payment => {

                renderPaymentRow(
                    payment
                );

            }
        );


        paymentSection.classList.remove(
            "hidden"
        );

    }

    catch (error) {

        console.error(
            "Admin payment error:",
            error
        );

        showError(

            error.message ||
            "Something went wrong while loading payments."

        );

    }

    finally {

        loading.classList.add(
            "hidden"
        );

    }

}


// ======================================================
// INITIAL LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAdminPayments();

    }
);