// ======================================================
// ORGANIZER REVENUE SUMMARY
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

const errorRetry =
    document.getElementById("errorRetry");

const retryButton =
    document.getElementById("retryButton");

const revenueContent =
    document.getElementById("revenueContent");

const emptyState =
    document.getElementById("emptyState");

const todayTotalPayments =
    document.getElementById("todayTotalPayments");

const todayTotalRevenue =
    document.getElementById("todayTotalRevenue");

const todayPlatformFee =
    document.getElementById("todayPlatformFee");

const todayOrganizerRevenue =
    document.getElementById("todayOrganizerRevenue");

const weekTotalPayments =
    document.getElementById("weekTotalPayments");

const weekTotalRevenue =
    document.getElementById("weekTotalRevenue");

const weekPlatformFee =
    document.getElementById("weekPlatformFee");

const weekOrganizerRevenue =
    document.getElementById("weekOrganizerRevenue");

const monthTotalPayments =
    document.getElementById("monthTotalPayments");

const monthTotalRevenue =
    document.getElementById("monthTotalRevenue");

const monthPlatformFee =
    document.getElementById("monthPlatformFee");

const monthOrganizerRevenue =
    document.getElementById("monthOrganizerRevenue");


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
// Get Payment Date
// ======================================================

function getPaymentDate(payment) {

    if (!payment) {

        return null;

    }


    const dateStr =
        payment.paidAt ||
        payment.createdAt;


    if (!dateStr) {

        return null;

    }


    const date =
        new Date(dateStr);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


// ======================================================
// Get Local Date Start Timestamp
// ======================================================

function getLocalDateStart(date) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ).getTime();

}


// ======================================================
// Date Range Helpers
// ======================================================

function getTodayRange() {

    const now =
        new Date();

    const start =
        getLocalDateStart(now);

    const end =
        getLocalDateStart(
            new Date(
                now.getTime() +
                24 * 60 * 60 * 1000
            )
        );

    return { start, end };

}


function getLast7DaysRange() {

    const now =
        new Date();

    const sevenDaysAgo =
        new Date(
            now.getTime() -
            7 * 24 * 60 * 60 * 1000
        );

    const start =
        getLocalDateStart(
            sevenDaysAgo
        );

    const end =
        getLocalDateStart(
            new Date(
                now.getTime() +
                24 * 60 * 60 * 1000
            )
        );

    return { start, end };

}


function getLastMonthRange() {

    const now =
        new Date();

    const oneMonthAgo =
        new Date(now);

    oneMonthAgo.setMonth(
        oneMonthAgo.getMonth() - 1
    );

    const start =
        getLocalDateStart(
            oneMonthAgo
        );

    const end =
        getLocalDateStart(
            new Date(
                now.getTime() +
                24 * 60 * 60 * 1000
            )
        );

    return { start, end };

}


// ======================================================
// Check If Payment Is In Date Range
// ======================================================

function isInRange(
    payment,
    start,
    end
) {

    const paymentDate =
        getPaymentDate(payment);


    if (!paymentDate) {

        return false;

    }


    const paymentTime =
        getLocalDateStart(
            paymentDate
        );


    return (
        paymentTime >= start &&
        paymentTime < end
    );

}


// ======================================================
// Filter Paid Payments
// ======================================================

function getPaidPayments(
    payments
) {

    return payments.filter(
        payment => {

            const status =
                String(
                    payment.status ||
                    ""
                ).toLowerCase();

            return status === "paid";

        }
    );

}


// ======================================================
// Calculate Period Summary
// ======================================================

function calculatePeriodSummary(
    payments,
    start,
    end
) {

    const periodPayments =
        payments.filter(
            p =>
                isInRange(
                    p,
                    start,
                    end
                )
        );


    const totalPayments =
        periodPayments.length;

    const totalRevenue =
        periodPayments.reduce(
            (
                sum,
                p
            ) =>
                sum +
                Number(
                    p.grossAmount ||
                    0
                ),
            0
        );

    const platformFee =
        periodPayments.reduce(
            (
                sum,
                p
            ) =>
                sum +
                Number(
                    p.platformFee ||
                    0
                ),
            0
        );

    const organizerRevenue =
        periodPayments.reduce(
            (
                sum,
                p
            ) =>
                sum +
                Number(
                    p.organizerAmount ||
                    0
                ),
            0
        );

    return {
        totalPayments,
        totalRevenue,
        platformFee,
        organizerRevenue
    };

}


// ======================================================
// Calculate Platform Fee Percentage
// ======================================================

function calculatePlatformFeePercentage(
    payments,
    backendPercentage
) {

    if (
        typeof backendPercentage ===
            "number" &&
        !isNaN(
            backendPercentage
        ) &&
        backendPercentage > 0
    ) {

        return Math.round(
            backendPercentage *
            100
        ) / 100;

    }


    const paidPayments =
        getPaidPayments(
            payments
        );

    const paymentWithAmount =
        paidPayments.find(
            p =>
                Number(
                    p.grossAmount ||
                    0
                ) > 0
        );


    if (!paymentWithAmount) {

        return null;

    }


    const grossAmount =
        Number(
            paymentWithAmount.grossAmount ||
            0
        );

    const platformFee =
        Number(
            paymentWithAmount.platformFee ||
            0
        );


    if (grossAmount <= 0) {

        return null;

    }


    return Math.round(
        (platformFee / grossAmount) *
        10000
    ) / 100;

}


// ======================================================
// Show Loading State
// ======================================================

function showLoading() {

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


    if (errorRetry) {

        errorRetry.classList.add(
            "hidden"
        );

    }


    if (revenueContent) {

        revenueContent.classList.add(
            "hidden"
        );

    }


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );

    }

}


// ======================================================
// Show Error State
// ======================================================

function showError() {

    if (loading) {

        loading.classList.add(
            "hidden"
        );

    }


    if (errorMessage) {

        errorMessage.classList.add(
            "hidden"
        );

    }


    if (errorRetry) {

        errorRetry.classList.remove(
            "hidden"
        );

    }


    if (revenueContent) {

        revenueContent.classList.add(
            "hidden"
        );

    }


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );

    }

}


// ======================================================
// Show Content State
// ======================================================

function showContent() {

    if (loading) {

        loading.classList.add(
            "hidden"
        );

    }


    if (errorMessage) {

        errorMessage.classList.add(
            "hidden"
        );

    }


    if (errorRetry) {

        errorRetry.classList.add(
            "hidden"
        );

    }


    if (revenueContent) {

        revenueContent.classList.remove(
            "hidden"
        );

    }


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );

    }

}


// ======================================================
// Show Empty State
// ======================================================

function showEmpty() {

    if (loading) {

        loading.classList.add(
            "hidden"
        );

    }


    if (errorMessage) {

        errorMessage.classList.add(
            "hidden"
        );

    }


    if (errorRetry) {

        errorRetry.classList.add(
            "hidden"
        );

    }


    if (revenueContent) {

        revenueContent.classList.add(
            "hidden"
        );

    }


    if (emptyState) {

        emptyState.classList.remove(
            "hidden"
        );

    }

}


// ======================================================
// Render Summary Card
// ======================================================

function renderSummaryCard(
    totalPaymentsEl,
    totalRevenueEl,
    platformFeeEl,
    organizerRevenueEl,
    summary,
    feePercentage
) {

    if (totalPaymentsEl) {

        totalPaymentsEl.textContent =
            summary.totalPayments;

    }


    if (totalRevenueEl) {

        totalRevenueEl.textContent =
            formatCurrency(
                summary.totalRevenue
            );

    }


    if (platformFeeEl) {

        const percentText =
            typeof feePercentage ===
                "number" &&
            !isNaN(
                feePercentage
            )
                ? ` <span class="text-base font-medium text-gray-500">(${feePercentage}%)</span>`
                : "";

        platformFeeEl.innerHTML =
            formatCurrency(
                summary.platformFee
            ) +
            percentText;

    }


    if (organizerRevenueEl) {

        organizerRevenueEl.textContent =
            formatCurrency(
                summary.organizerRevenue
            );

    }

}


// ======================================================
// Fetch Platform Fee Percentage
// ======================================================

async function fetchPlatformFeePercentage() {

    const token =
        getToken();


    if (!token) {

        return null;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/payments/config/platform-fee`,
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


        if (!response.ok) {

            return null;

        }


        const result =
            await response.json();


        if (
            result.success &&
            typeof result.data
                ?.platformFeePercentage ===
                "number"
        ) {

            return result.data
                .platformFeePercentage;

        }


        return null;

    }
    catch (error) {

        return null;

    }

}


// ======================================================
// Fetch Organizer Payments
// ======================================================

async function fetchOrganizerPayments() {

    const token =
        getToken();


    if (!token) {

        throw new Error(
            "You are not logged in. Please login as an organizer."
        );

    }


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


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "Failed to load organizer payments."
        );

    }


    let payments = [];


    if (
        Array.isArray(
            result.data
        )
    ) {

        payments =
            result.data;

    }
    else if (
        result.data &&
        Array.isArray(
            result.data.payments
        )
    ) {

        payments =
            result.data.payments;

    }


    return payments;

}


// ======================================================
// Load Revenue Summary
// ======================================================

async function loadRevenueSummary() {

    showLoading();


    try {

        const [
            payments,
            platformFeePercentage
        ] =
            await Promise.all([
                fetchOrganizerPayments(),
                fetchPlatformFeePercentage()
            ]);


        const paidPayments =
            getPaidPayments(
                payments
            );


        const todayRange =
            getTodayRange();

        const weekRange =
            getLast7DaysRange();

        const monthRange =
            getLastMonthRange();


        const todaySummary =
            calculatePeriodSummary(
                paidPayments,
                todayRange.start,
                todayRange.end
            );

        const weekSummary =
            calculatePeriodSummary(
                paidPayments,
                weekRange.start,
                weekRange.end
            );

        const monthSummary =
            calculatePeriodSummary(
                paidPayments,
                monthRange.start,
                monthRange.end
            );


        const hasAnyData =
            todaySummary.totalPayments >
            0 ||
            weekSummary.totalPayments >
            0 ||
            monthSummary.totalPayments >
            0;


        if (!hasAnyData) {

            showEmpty();

            return;

        }


        const feePercentage =
            calculatePlatformFeePercentage(
                paidPayments,
                platformFeePercentage
            );


        renderSummaryCard(
            todayTotalPayments,
            todayTotalRevenue,
            todayPlatformFee,
            todayOrganizerRevenue,
            todaySummary,
            feePercentage
        );

        renderSummaryCard(
            weekTotalPayments,
            weekTotalRevenue,
            weekPlatformFee,
            weekOrganizerRevenue,
            weekSummary,
            feePercentage
        );

        renderSummaryCard(
            monthTotalPayments,
            monthTotalRevenue,
            monthPlatformFee,
            monthOrganizerRevenue,
            monthSummary,
            feePercentage
        );


        showContent();

    }
    catch (error) {

        console.error(
            "Revenue summary error:",
            error
        );

        showError();

    }

}


// ======================================================
// Event Listeners
// ======================================================

if (retryButton) {

    retryButton.addEventListener(
        "click",
        () => {

            loadRevenueSummary();

        }
    );

}


// ======================================================
// Initial Load
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadRevenueSummary();

    }
);
