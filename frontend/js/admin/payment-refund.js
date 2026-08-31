// ======================================================
// ADMIN PAYMENT & REFUND MANAGEMENT
// ======================================================


// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// ======================================================
// DOM ELEMENTS
// ======================================================

const loadingState =
    document.getElementById("loadingState");

const errorState =
    document.getElementById("errorState");

const errorMessage =
    document.getElementById("errorMessage");

const retryButton =
    document.getElementById("retryButton");

const paymentSection =
    document.getElementById("paymentSection");

const paymentTableBody =
    document.getElementById("paymentTableBody");

const emptyState =
    document.getElementById("emptyState");

const paymentCountText =
    document.getElementById("paymentCountText");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const refreshButton =
    document.getElementById("refreshButton");

const backButton =
    document.getElementById("backButton");


// ======================================================
// STATISTICS
// ======================================================

const totalPayments =
    document.getElementById("totalPayments");

const paidPayments =
    document.getElementById("paidPayments");

const pendingPayments =
    document.getElementById("pendingPayments");

const refundedPayments =
    document.getElementById("refundedPayments");


// ======================================================
// MODAL
// ======================================================

const paymentModal =
    document.getElementById("paymentModal");

const modalOverlay =
    document.getElementById("modalOverlay");

const closeModalButton =
    document.getElementById("closeModalButton");

const modalCloseButton =
    document.getElementById("modalCloseButton");

const paymentDetails =
    document.getElementById("paymentDetails");

const modalRefundButton =
    document.getElementById("modalRefundButton");


// ======================================================
// STATE
// ======================================================

let allPayments = [];

let filteredPayments = [];

let selectedPayment = null;


// ======================================================
// TOKEN
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
// API REQUEST
// ======================================================

async function apiRequest(
    endpoint,
    options = {}
) {

    const token =
        getToken();


    if (!token) {

        throw new Error(
            "Authentication token not found. Please login again."
        );

    }


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

                    ...(options.headers || {})

                }
            }
        );


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
// EXTRACT PAYMENTS
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
// FORMAT CURRENCY
// ======================================================

function formatCurrency(amount) {

    const value =
        Number(amount) || 0;

    return `৳${value.toLocaleString(
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
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// ======================================================
// CAPITALIZE
// ======================================================

function capitalize(text) {

    if (!text) {

        return "";

    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


// ======================================================
// GET PAYMENT STATUS
// ======================================================

function getPaymentStatus(payment) {

    return String(
        payment?.paymentStatus ??
        payment?.status ??
        "pending"
    ).toLowerCase();

}


// ======================================================
// GET USER
// ======================================================

function getUser(payment) {

    return (
        payment?.user ||
        payment?.customer ||
        {}
    );

}


// ======================================================
// GET USER NAME
// ======================================================

function getUserName(payment) {

    const user =
        getUser(payment);


    return (
        user.name ||
        user.fullName ||
        user.username ||
        user.email ||
        "Unknown User"
    );

}


// ======================================================
// GET USER EMAIL
// ======================================================

function getUserEmail(payment) {

    const user =
        getUser(payment);


    return user.email || "";

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
// GET EVENT NAME
// ======================================================

function getEventName(payment) {

    const event =
        getEvent(payment);


    return (
        event.title ||
        event.name ||
        "Unknown Event"
    );

}


// ======================================================
// GET PAYMENT AMOUNT
// ======================================================

function getPaymentAmount(payment) {

    return Number(
        payment?.amount ??
        payment?.grossAmount ??
        payment?.totalAmount ??
        0
    );

}


// ======================================================
// GET REFUND AMOUNT
// ======================================================

function getRefundAmount(payment) {

    return Number(
        payment?.refundAmount ??
        payment?.refundedAmount ??
        0
    );

}


// ======================================================
// GET TRANSACTION ID
// ======================================================

function getTransactionId(payment) {

    return (
        payment?.transactionId ||
        payment?.transactionID ||
        payment?.tranId ||
        payment?._id ||
        "N/A"
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


    const config = {

        pending: {
            className:
                "bg-yellow-100 text-yellow-700",
            icon:
                "fa-clock"
        },

        processing: {
            className:
                "bg-blue-100 text-blue-700",
            icon:
                "fa-spinner"
        },

        paid: {
            className:
                "bg-green-100 text-green-700",
            icon:
                "fa-circle-check"
        },

        failed: {
            className:
                "bg-red-100 text-red-700",
            icon:
                "fa-circle-xmark"
        },

        cancelled: {
            className:
                "bg-gray-100 text-gray-700",
            icon:
                "fa-ban"
        },

        refunded: {
            className:
                "bg-purple-100 text-purple-700",
            icon:
                "fa-money-bill-transfer"
        },

        partially_refunded: {
            className:
                "bg-orange-100 text-orange-700",
            icon:
                "fa-money-bill-transfer"
        }

    };


    const current =
        config[normalizedStatus] ||
        config.pending;


    return `

        <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${current.className}"
        >

            <i
                class="fa-solid ${current.icon}"
            ></i>

            ${escapeHtml(
                capitalize(
                    normalizedStatus.replace(
                        /_/g,
                        " "
                    )
                )
            )}

        </span>

    `;

}


// ======================================================
// UPDATE STATISTICS
// ======================================================

function updateStatistics(
    payments
) {

    const total =
        payments.length;


    const paid =
        payments.filter(
            payment =>
                getPaymentStatus(payment) ===
                "paid"
        ).length;


    const pending =
        payments.filter(
            payment => {

                const status =
                    getPaymentStatus(
                        payment
                    );

                return (
                    status === "pending" ||
                    status === "processing"
                );

            }
        ).length;


    const refunded =
        payments.filter(
            payment => {

                const status =
                    getPaymentStatus(
                        payment
                    );

                return (
                    status === "refunded" ||
                    status === "partially_refunded"
                );

            }
        ).length;


    totalPayments.textContent =
        total;

    paidPayments.textContent =
        paid;

    pendingPayments.textContent =
        pending;

    refundedPayments.textContent =
        refunded;

}


// ======================================================
// RENDER PAYMENTS
// ======================================================

function renderPayments(
    payments
) {

    paymentTableBody.innerHTML =
        "";


    if (
        !Array.isArray(payments) ||
        payments.length === 0
    ) {

        emptyState.classList.remove(
            "hidden"
        );

        paymentCountText.textContent =
            "0 payments found";

        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    paymentCountText.textContent =
        `${payments.length} ${
            payments.length === 1
                ? "payment"
                : "payments"
        } found`;


    payments.forEach(
        payment => {

            const row =
                document.createElement(
                    "tr"
                );


            row.className =
                "hover:bg-gray-50 transition";


            const userName =
                getUserName(
                    payment
                );


            const userEmail =
                getUserEmail(
                    payment
                );


            const eventName =
                getEventName(
                    payment
                );


            const paymentMethod =
                payment.paymentMethod ||
                payment.method ||
                "N/A";


            const paymentStatus =
                getPaymentStatus(
                    payment
                );


            const amount =
                getPaymentAmount(
                    payment
                );


            const refundAmount =
                getRefundAmount(
                    payment
                );


            const paymentDate =
                payment.paymentDate ||
                payment.paidAt ||
                payment.createdAt;


            const paymentId =
                payment._id;


            const canRefund =
                paymentStatus === "paid";


            row.innerHTML = `

                <!-- User -->

                <td class="px-5 py-4">

                    <div>

                        <p
                            class="font-medium text-gray-900"
                        >
                            ${escapeHtml(
                                userName
                            )}
                        </p>

                        <p
                            class="mt-0.5 text-xs text-gray-500"
                        >
                            ${escapeHtml(
                                userEmail
                            )}
                        </p>

                    </div>

                </td>


                <!-- Event -->

                <td class="px-5 py-4">

                    <p
                        class="max-w-xs truncate text-sm font-medium text-gray-800"
                        title="${escapeHtml(
                            eventName
                        )}"
                    >
                        ${escapeHtml(
                            eventName
                        )}
                    </p>

                    <p
                        class="mt-1 text-xs text-gray-500"
                    >
                        ${formatDate(
                            paymentDate
                        )}
                    </p>

                </td>


                <!-- Amount -->

                <td class="px-5 py-4">

                    <span
                        class="font-semibold text-gray-900"
                    >
                        ${formatCurrency(
                            amount
                        )}
                    </span>

                </td>


                <!-- Method -->

                <td class="px-5 py-4">

                    <span
                        class="text-sm text-gray-700"
                    >
                        ${escapeHtml(
                            capitalize(
                                String(
                                    paymentMethod
                                )
                            )
                        )}
                    </span>

                </td>


                <!-- Status -->

                <td class="px-5 py-4">

                    ${getStatusBadge(
                        paymentStatus
                    )}

                </td>


                <!-- Refund -->

                <td class="px-5 py-4">

                    ${
                        refundAmount > 0

                            ? `
                                <span
                                    class="font-semibold text-purple-600"
                                >
                                    ${formatCurrency(
                                        refundAmount
                                    )}
                                </span>
                            `

                            : `
                                <span
                                    class="text-sm text-gray-400"
                                >
                                    No refund
                                </span>
                            `
                    }

                </td>


                <!-- Action -->

                <td class="px-5 py-4 text-right">

                    <div
                        class="flex items-center justify-end gap-2"
                    >

                        <button
                            type="button"
                            class="view-payment-btn rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                            data-id="${escapeHtml(
                                paymentId
                            )}"
                        >

                            <i
                                class="fa-solid fa-eye mr-1"
                            ></i>

                            View

                        </button>


                        ${
                            canRefund

                                ? `
                                    <button
                                        type="button"
                                        class="refund-payment-btn rounded-lg bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700"
                                        data-id="${escapeHtml(
                                            paymentId
                                        )}"
                                    >

                                        <i
                                            class="fa-solid fa-money-bill-transfer mr-1"
                                        ></i>

                                        Refund

                                    </button>
                                `

                                : ""
                        }

                    </div>

                </td>

            `;


            paymentTableBody.appendChild(
                row
            );

        }
    );

}


// ======================================================
// FILTER PAYMENTS
// ======================================================

function applyFilters() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    filteredPayments =
        allPayments.filter(
            payment => {

                const userName =
                    getUserName(
                        payment
                    )
                    .toLowerCase();


                const userEmail =
                    getUserEmail(
                        payment
                    )
                    .toLowerCase();


                const eventName =
                    getEventName(
                        payment
                    )
                    .toLowerCase();


                const transactionId =
                    String(
                        getTransactionId(
                            payment
                        )
                    )
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    userName.includes(search) ||
                    userEmail.includes(search) ||
                    eventName.includes(search) ||
                    transactionId.includes(search);


                const status =
                    getPaymentStatus(
                        payment
                    );


                const matchesStatus =
                    selectedStatus === "all" ||
                    status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderPayments(
        filteredPayments
    );

}


// ======================================================
// LOAD PAYMENTS
// ======================================================

async function loadPayments() {

    try {

        loadingState.classList.remove(
            "hidden"
        );

        errorState.classList.add(
            "hidden"
        );

        paymentSection.classList.add(
            "hidden"
        );


        const result =
            await apiRequest(
                "/payments/admin"
            );


        allPayments =
            extractPayments(
                result
            );


        updateStatistics(
            allPayments
        );


        filteredPayments =
            [...allPayments];


        renderPayments(
            filteredPayments
        );


        paymentSection.classList.remove(
            "hidden"
        );

    }

    catch (error) {

        console.error(
            "Load payments error:",
            error
        );


        errorMessage.textContent =
            error.message ||
            "Failed to load payments.";


        errorState.classList.remove(
            "hidden"
        );

    }

    finally {

        loadingState.classList.add(
            "hidden"
        );

    }

}


// ======================================================
// OPEN PAYMENT DETAILS
// ======================================================

async function openPaymentDetails(
    paymentId
) {

    try {

        paymentDetails.innerHTML = `

            <div class="py-10 text-center">

                <i
                    class="fa-solid fa-spinner fa-spin text-xl text-blue-600"
                ></i>

                <p
                    class="mt-3 text-sm text-gray-500"
                >
                    Loading payment details...
                </p>

            </div>

        `;


        paymentModal.classList.remove(
            "hidden"
        );


        const result =
            await apiRequest(
                `/payments/admin/${encodeURIComponent(
                    paymentId
                )}`
            );


        const payment =
            result?.data?.payment ||
            result?.data ||
            result?.payment ||
            result;


        selectedPayment =
            payment;


        renderPaymentDetails(
            payment
        );

    }

    catch (error) {

        console.error(
            "Payment details error:",
            error
        );


        paymentDetails.innerHTML = `

            <div
                class="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700"
            >

                ${escapeHtml(
                    error.message ||
                    "Failed to load payment details."
                )}

            </div>

        `;

    }

}


// ======================================================
// RENDER PAYMENT DETAILS
// ======================================================

function renderPaymentDetails(
    payment
) {

    const userName =
        getUserName(
            payment
        );


    const userEmail =
        getUserEmail(
            payment
        );


    const eventName =
        getEventName(
            payment
        );


    const booking =
        payment?.booking ||
        {};


    const ticketQuantity =
        booking.ticketQuantity ??
        booking.quantity ??
        payment.ticketQuantity ??
        payment.quantity ??
        0;


    const refundAmount =
        getRefundAmount(
            payment
        );


    const paymentStatus =
        getPaymentStatus(
            payment
        );


    const canRefund =
        paymentStatus === "paid";


    const transactionId =
        getTransactionId(
            payment
        );


    const paymentDate =
        payment.paymentDate ||
        payment.paidAt ||
        payment.createdAt;


    const paymentMethod =
        payment.paymentMethod ||
        payment.method ||
        "N/A";


    paymentDetails.innerHTML = `

        <div
            class="grid grid-cols-1 gap-5 md:grid-cols-2"
        >


            <!-- Customer -->

            <div
                class="rounded-xl bg-gray-50 p-4"
            >

                <p
                    class="text-xs font-semibold uppercase text-gray-500"
                >
                    Customer
                </p>

                <p
                    class="mt-1 font-semibold text-gray-900"
                >
                    ${escapeHtml(
                        userName
                    )}
                </p>

                <p
                    class="text-sm text-gray-500"
                >
                    ${escapeHtml(
                        userEmail
                    )}
                </p>

            </div>


            <!-- Event -->

            <div
                class="rounded-xl bg-gray-50 p-4"
            >

                <p
                    class="text-xs font-semibold uppercase text-gray-500"
                >
                    Event
                </p>

                <p
                    class="mt-1 font-semibold text-gray-900"
                >
                    ${escapeHtml(
                        eventName
                    )}
                </p>

            </div>


            <!-- Amount -->

            <div
                class="rounded-xl bg-gray-50 p-4"
            >

                <p
                    class="text-xs font-semibold uppercase text-gray-500"
                >
                    Payment Amount
                </p>

                <p
                    class="mt-1 text-xl font-bold text-gray-900"
                >
                    ${formatCurrency(
                        getPaymentAmount(
                            payment
                        )
                    )}
                </p>

            </div>


            <!-- Ticket Quantity -->

            <div
                class="rounded-xl bg-gray-50 p-4"
            >

                <p
                    class="text-xs font-semibold uppercase text-gray-500"
                >
                    Tickets
                </p>

                <p
                    class="mt-1 text-xl font-bold text-gray-900"
                >
                    ${escapeHtml(
                        ticketQuantity
                    )}
                </p>

            </div>


            <!-- Payment Method -->

            <div
                class="rounded-xl bg-gray-50 p-4"
            >

                <p
                    class="text-xs font-semibold uppercase text-gray-500"
                >
                    Payment Method
                </p>

                <p
                    class="mt-1 font-semibold text-gray-900"
                >
                    ${escapeHtml(
                        capitalize(
                            String(
                                paymentMethod
                            )
                        )
                    )}
                </p>

            </div>


            <!-- Status -->

            <div
                class="rounded-xl bg-gray-50 p-4"
            >

                <p
                    class="mb-2 text-xs font-semibold uppercase text-gray-500"
                >
                    Payment Status
                </p>

                ${getStatusBadge(
                    paymentStatus
                )}

            </div>


            <!-- Transaction -->

            <div
                class="rounded-xl bg-gray-50 p-4 md:col-span-2"
            >

                <p
                    class="text-xs font-semibold uppercase text-gray-500"
                >
                    Transaction ID
                </p>

                <p
                    class="mt-1 break-all font-mono text-sm text-gray-900"
                >
                    ${escapeHtml(
                        transactionId
                    )}
                </p>

            </div>


            <!-- Payment Date -->

            <div
                class="rounded-xl bg-gray-50 p-4"
            >

                <p
                    class="text-xs font-semibold uppercase text-gray-500"
                >
                    Payment Date
                </p>

                <p
                    class="mt-1 font-semibold text-gray-900"
                >
                    ${formatDate(
                        paymentDate
                    )}
                </p>

            </div>


            <!-- Refund -->

            <div
                class="rounded-xl bg-gray-50 p-4"
            >

                <p
                    class="text-xs font-semibold uppercase text-gray-500"
                >
                    Refund Amount
                </p>

                <p
                    class="mt-1 font-semibold text-purple-600"
                >
                    ${formatCurrency(
                        refundAmount
                    )}
                </p>

            </div>


        </div>

    `;


    if (canRefund) {

        modalRefundButton.classList.remove(
            "hidden"
        );

        modalRefundButton.disabled =
            false;

    }

    else {

        modalRefundButton.classList.add(
            "hidden"
        );

    }

}


// ======================================================
// PROCESS REFUND
// ======================================================

async function processRefund(
    paymentId
) {

    if (!paymentId) {

        return;

    }


    const confirmed =
        window.confirm(
            "Are you sure you want to process this refund?"
        );


    if (!confirmed) {

        return;

    }


    const tableButton =
        document.querySelector(
            `.refund-payment-btn[data-id="${CSS.escape(
                String(paymentId)
            )}"]`
        );


    try {

        if (tableButton) {

            tableButton.disabled =
                true;

            tableButton.innerHTML = `

                <i
                    class="fa-solid fa-spinner fa-spin mr-1"
                ></i>

                Processing...

            `;

        }


        modalRefundButton.disabled =
            true;


        modalRefundButton.innerHTML = `

            <i
                class="fa-solid fa-spinner fa-spin mr-2"
            ></i>

            Processing...

        `;


        const result =
            await apiRequest(
                `/payments/admin/${encodeURIComponent(
                    paymentId
                )}/refund`,
                {
                    method: "PATCH"
                }
            );


        alert(
            result?.message ||
            "Refund processed successfully."
        );


        closeModal();


        await loadPayments();


    }

    catch (error) {

        console.error(
            "Refund error:",
            error
        );


        alert(
            error.message ||
            "Failed to process refund."
        );

    }

    finally {

        modalRefundButton.disabled =
            false;

        modalRefundButton.innerHTML = `

            <i
                class="fa-solid fa-money-bill-transfer mr-2"
            ></i>

            Process Refund

        `;

        if (tableButton) {

            tableButton.disabled =
                false;

            tableButton.innerHTML = `

                <i
                    class="fa-solid fa-money-bill-transfer mr-1"
                ></i>

                Refund

            `;

        }

    }

}


// ======================================================
// CLOSE MODAL
// ======================================================

function closeModal() {

    paymentModal.classList.add(
        "hidden"
    );


    selectedPayment =
        null;


    paymentDetails.innerHTML =
        "";


    modalRefundButton.classList.add(
        "hidden"
    );

}


// ======================================================
// EVENT LISTENERS
// ======================================================


// Search

searchInput.addEventListener(
    "input",
    applyFilters
);


// Status Filter

statusFilter.addEventListener(
    "change",
    applyFilters
);


// Refresh

refreshButton.addEventListener(
    "click",
    loadPayments
);


// Retry

retryButton.addEventListener(
    "click",
    loadPayments
);


// Back

backButton.addEventListener(
    "click",
    () => {

        window.history.back();

    }
);


// Close modal

closeModalButton.addEventListener(
    "click",
    closeModal
);


modalCloseButton.addEventListener(
    "click",
    closeModal
);


modalOverlay.addEventListener(
    "click",
    closeModal
);


// Escape key

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !paymentModal.classList.contains(
                "hidden"
            )
        ) {

            closeModal();

        }

    }
);


// Modal refund

modalRefundButton.addEventListener(
    "click",
    () => {

        if (
            selectedPayment &&
            selectedPayment._id
        ) {

            processRefund(
                selectedPayment._id
            );

        }

    }
);


// Table actions

paymentTableBody.addEventListener(
    "click",
    event => {

        const viewButton =
            event.target.closest(
                ".view-payment-btn"
            );


        const refundButton =
            event.target.closest(
                ".refund-payment-btn"
            );


        // View

        if (viewButton) {

            const paymentId =
                viewButton.dataset.id;


            if (paymentId) {

                openPaymentDetails(
                    paymentId
                );

            }

            return;

        }


        // Refund

        if (refundButton) {

            const paymentId =
                refundButton.dataset.id;


            if (paymentId) {

                processRefund(
                    paymentId
                );

            }

        }

    }
);


// ======================================================
// INITIAL LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPayments();

    }
);