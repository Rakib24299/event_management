// ======================================================
// ADMIN REVENUE HISTORY
// ======================================================


// ======================================================
// Configuration
// ======================================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// ======================================================
// Authentication Check
// ======================================================

const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");


if (!token) {

    window.location.href =
        "./admin-login.html";

}


// ======================================================
// DOM Elements
// ======================================================

const loading =
    document.getElementById("loading");

const errorRetry =
    document.getElementById("errorRetry");

const retryButton =
    document.getElementById("retryButton");

const revenueContent =
    document.getElementById("revenueContent");

const logoutBtn =
    document.getElementById("logoutBtn");

const todayTotalPayments =
    document.getElementById("todayTotalPayments");

const todayTotalRevenue =
    document.getElementById("todayTotalRevenue");

const todayPlatformFee =
    document.getElementById("todayPlatformFee");

const todayPlatformFeePercent =
    document.getElementById("todayPlatformFeePercent");

const todayOrganizerRevenue =
    document.getElementById("todayOrganizerRevenue");

const weekTotalPayments =
    document.getElementById("weekTotalPayments");

const weekTotalRevenue =
    document.getElementById("weekTotalRevenue");

const weekPlatformFee =
    document.getElementById("weekPlatformFee");

const weekPlatformFeePercent =
    document.getElementById("weekPlatformFeePercent");

const weekOrganizerRevenue =
    document.getElementById("weekOrganizerRevenue");

const monthTotalPayments =
    document.getElementById("monthTotalPayments");

const monthTotalRevenue =
    document.getElementById("monthTotalRevenue");

const monthPlatformFee =
    document.getElementById("monthPlatformFee");

const monthPlatformFeePercent =
    document.getElementById("monthPlatformFeePercent");

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
// Show Loading State
// ======================================================

function showLoading() {

    if (loading) {
        loading.classList.remove("hidden");
    }

    if (errorRetry) {
        errorRetry.classList.add("hidden");
    }

    if (revenueContent) {
        revenueContent.classList.add("hidden");
    }

}


// ======================================================
// Show Error State
// ======================================================

function showError() {

    if (loading) {
        loading.classList.add("hidden");
    }

    if (errorRetry) {
        errorRetry.classList.remove("hidden");
    }

    if (revenueContent) {
        revenueContent.classList.add("hidden");
    }

}


// ======================================================
// Show Content State
// ======================================================

function showContent() {

    if (loading) {
        loading.classList.add("hidden");
    }

    if (errorRetry) {
        errorRetry.classList.add("hidden");
    }

    if (revenueContent) {
        revenueContent.classList.remove("hidden");
    }

}


// ======================================================
// Render Summary Card
// ======================================================

function renderSummaryCard(
    totalPaymentsEl,
    totalRevenueEl,
    platformFeeEl,
    platformFeePercentEl,
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
            typeof feePercentage === "number" &&
            !isNaN(feePercentage) &&
            feePercentage > 0
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
// Fetch Revenue History
// ======================================================

async function fetchRevenueHistory() {

    const currentToken =
        getToken();

    if (!currentToken) {
        throw new Error(
            "You are not logged in. Please login as an admin."
        );
    }

    const response =
        await fetch(
            `${API_BASE_URL}/admin/revenue-history`,
            {
                method: "GET",
                headers: {
                    Authorization:
                        `Bearer ${currentToken}`,
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
            "Failed to load revenue history."
        );
    }

    return result.data || {};

}


// ======================================================
// Load Revenue History
// ======================================================

async function loadRevenueHistory() {

    showLoading();

    try {

        const data =
            await fetchRevenueHistory();

        const feePercentage =
            data.platformFeePercentage;

        renderSummaryCard(
            todayTotalPayments,
            todayTotalRevenue,
            todayPlatformFee,
            todayPlatformFeePercent,
            todayOrganizerRevenue,
            data.today || {},
            feePercentage
        );

        renderSummaryCard(
            weekTotalPayments,
            weekTotalRevenue,
            weekPlatformFee,
            weekPlatformFeePercent,
            weekOrganizerRevenue,
            data.last7Days || {},
            feePercentage
        );

        renderSummaryCard(
            monthTotalPayments,
            monthTotalRevenue,
            monthPlatformFee,
            monthPlatformFeePercent,
            monthOrganizerRevenue,
            data.last1Month || {},
            feePercentage
        );

        showContent();

    } catch (error) {

        console.error(
            "Revenue history error:",
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
        loadRevenueHistory
    );
}


if (logoutBtn) {
    logoutBtn.addEventListener(
        "click",
        () => {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            window.location.href =
                "./admin-login.html";
        }
    );
}


// ======================================================
// Initial Load
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    loadRevenueHistory
);
