// ORGANIZER REVENUE SUMMARY & ANALYTICS

const API_BASE_URL = "http://localhost:5000/api/v1";

// DOM Elements
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const errorRetry = document.getElementById("errorRetry");
const retryButton = document.getElementById("retryButton");
const revenueContent = document.getElementById("revenueContent");
const emptyState = document.getElementById("emptyState");

const todayTotalPayments = document.getElementById("todayTotalPayments");
const todayTotalRevenue = document.getElementById("todayTotalRevenue");
const todayPlatformFee = document.getElementById("todayPlatformFee");
const todayPlatformFeePercent = document.getElementById("todayPlatformFeePercent");
const todayOrganizerRevenue = document.getElementById("todayOrganizerRevenue");

const weekTotalPayments = document.getElementById("weekTotalPayments");
const weekTotalRevenue = document.getElementById("weekTotalRevenue");
const weekPlatformFee = document.getElementById("weekPlatformFee");
const weekPlatformFeePercent = document.getElementById("weekPlatformFeePercent");
const weekOrganizerRevenue = document.getElementById("weekOrganizerRevenue");

const monthTotalPayments = document.getElementById("monthTotalPayments");
const monthTotalRevenue = document.getElementById("monthTotalRevenue");
const monthPlatformFee = document.getElementById("monthPlatformFee");
const monthPlatformFeePercent = document.getElementById("monthPlatformFeePercent");
const monthOrganizerRevenue = document.getElementById("monthOrganizerRevenue");

// Chart Canvas
const chartCanvas = document.getElementById("revenueBarChart");
let revenueChart = null;

// Get Token
function getToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken")
    );
}

// Format Currency
function formatCurrency(amount) {
    const value = Number(amount || 0);
    return `৳${value.toLocaleString("en-BD", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

// Get Payment Date
function getPaymentDate(payment) {
    if (!payment) return null;
    const dateStr = payment.paidAt || payment.createdAt;
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date;
}

// Get Local Date Start Timestamp
function getLocalDateStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

// Date Range Helpers
function getTodayRange() {
    const now = new Date();
    const start = getLocalDateStart(now);
    const end = getLocalDateStart(new Date(now.getTime() + 24 * 60 * 60 * 1000));
    return { start, end };
}

function getLast7DaysRange() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const start = getLocalDateStart(sevenDaysAgo);
    const end = getLocalDateStart(new Date(now.getTime() + 24 * 60 * 60 * 1000));
    return { start, end };
}

function getLastMonthRange() {
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const start = getLocalDateStart(oneMonthAgo);
    const end = getLocalDateStart(new Date(now.getTime() + 24 * 60 * 60 * 1000));
    return { start, end };
}

// Check If Payment Is In Date Range
function isInRange(payment, start, end) {
    const paymentDate = getPaymentDate(payment);
    if (!paymentDate) return false;
    const paymentTime = getLocalDateStart(paymentDate);
    return paymentTime >= start && paymentTime < end;
}

// Filter Paid Payments
function getPaidPayments(payments) {
    return payments.filter(payment => {
        const status = String(payment.status || "").toLowerCase();
        return status === "paid";
    });
}

// Calculate Period Summary
function calculatePeriodSummary(payments, start, end) {
    const periodPayments = payments.filter(p => isInRange(p, start, end));

    const totalPayments = periodPayments.length;
    const totalRevenue = periodPayments.reduce((sum, p) => sum + Number(p.grossAmount || 0), 0);
    const platformFee = periodPayments.reduce((sum, p) => sum + Number(p.platformFee || 0), 0);
    const organizerRevenue = periodPayments.reduce((sum, p) => sum + Number(p.organizerAmount || 0), 0);

    return {
        totalPayments,
        totalRevenue,
        platformFee,
        organizerRevenue
    };
}

// Calculate Platform Fee Percentage
function calculatePlatformFeePercentage(payments, backendPercentage) {
    if (typeof backendPercentage === "number" && !isNaN(backendPercentage) && backendPercentage > 0) {
        return Math.round(backendPercentage * 100) / 100;
    }

    const paidPayments = getPaidPayments(payments);
    const paymentWithAmount = paidPayments.find(p => Number(p.grossAmount || 0) > 0);
    if (!paymentWithAmount) return null;

    const grossAmount = Number(paymentWithAmount.grossAmount || 0);
    const platformFee = Number(paymentWithAmount.platformFee || 0);
    if (grossAmount <= 0) return null;

    return Math.round((platformFee / grossAmount) * 10000) / 100;
}

// Show Loading State
function showLoading() {
    if (loading) loading.classList.remove("hidden");
    if (errorMessage) errorMessage.classList.add("hidden");
    if (errorRetry) errorRetry.classList.add("hidden");
    if (revenueContent) revenueContent.classList.add("hidden");
    if (emptyState) emptyState.classList.add("hidden");
}

// Show Error State
function showError() {
    if (loading) loading.classList.add("hidden");
    if (errorMessage) errorMessage.classList.add("hidden");
    if (errorRetry) errorRetry.classList.remove("hidden");
    if (revenueContent) revenueContent.classList.add("hidden");
    if (emptyState) emptyState.classList.add("hidden");
}

// Show Content State
function showContent() {
    if (loading) loading.classList.add("hidden");
    if (errorMessage) errorMessage.classList.add("hidden");
    if (errorRetry) errorRetry.classList.add("hidden");
    if (revenueContent) revenueContent.classList.remove("hidden");
    if (emptyState) emptyState.classList.add("hidden");
}

// Show Empty State
function showEmpty() {
    if (loading) loading.classList.add("hidden");
    if (errorMessage) errorMessage.classList.add("hidden");
    if (errorRetry) errorRetry.classList.add("hidden");
    if (revenueContent) revenueContent.classList.add("hidden");
    if (emptyState) emptyState.classList.remove("hidden");
}

// Render Summary Card
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
        totalPaymentsEl.textContent = summary.totalPayments || 0;
    }

    if (totalRevenueEl) {
        totalRevenueEl.textContent = formatCurrency(summary.totalRevenue);
    }

    if (platformFeeEl) {
        platformFeeEl.textContent = formatCurrency(summary.platformFee);
    }

    if (platformFeePercentEl) {
        const percentText =
            typeof feePercentage === "number" && !isNaN(feePercentage) && feePercentage > 0
                ? `(${feePercentage}%)`
                : "";
        platformFeePercentEl.textContent = percentText;
    }

    if (organizerRevenueEl) {
        organizerRevenueEl.textContent = formatCurrency(summary.organizerRevenue);
    }
}

// Plugin: Draw Values on Top of Bars
const barTopLabelsPlugin = {
    id: "barTopLabels",
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            if (meta.hidden) return;

            meta.data.forEach((bar, index) => {
                const rawVal = dataset.data[index];
                if (rawVal === undefined || rawVal === null) return;

                const numVal = Number(rawVal);
                let text = "";

                if (numVal === 0) {
                    text = "৳0";
                } else if (numVal >= 1000000) {
                    text = `৳${(numVal / 1000000).toFixed(1)}M`;
                } else if (numVal >= 100000) {
                    text = `৳${(numVal / 1000).toFixed(0)}k`;
                } else {
                    text = `৳${numVal.toLocaleString("en-BD")}`;
                }

                ctx.font = "bold 11px Inter, system-ui, -apple-system, sans-serif";
                ctx.fillStyle = "#374151";

                const yPos = Math.max(14, bar.y - 4);
                ctx.fillText(text, bar.x, yPos);
            });
        });

        ctx.restore();
    }
};

// Render Revenue Bar Chart
function renderRevenueBarChart(data) {
    if (!chartCanvas || typeof Chart === "undefined") return;

    if (revenueChart) {
        revenueChart.destroy();
        revenueChart = null;
    }
// last 1,7,30 days
    const labels = ["Today", "Last 7 Days", "Last 1 Month"];
    const totalRevenueData = [
        data.today?.totalRevenue || 0,
        data.last7Days?.totalRevenue || 0,
        data.last1Month?.totalRevenue || 0
    ];
    const organizerRevenueData = [
        data.today?.organizerRevenue || 0,
        data.last7Days?.organizerRevenue || 0,
        data.last1Month?.organizerRevenue || 0
    ];
    const platformFeeData = [
        data.today?.platformFee || 0,
        data.last7Days?.platformFee || 0,
        data.last1Month?.platformFee || 0
    ];

    // BAR SHOW
    const ctx = chartCanvas.getContext("2d");

    revenueChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Total Revenue",
                    data: totalRevenueData,
                    backgroundColor: "#e76f51",
                    borderColor: "#c9553b",
                    borderWidth: 1,
                    borderRadius: 8,
                    borderSkipped: false,
                    maxBarThickness: 48
                },
                {
                    label: "Organizer Revenue",
                    data: organizerRevenueData,
                    backgroundColor: "#2a9d8f",
                    borderColor: "#21867a",
                    borderWidth: 1,
                    borderRadius: 8,
                    borderSkipped: false,
                    maxBarThickness: 48
                },
                {
                    label: "Platform Fee",
                    data: platformFeeData,
                    backgroundColor: "#f4a261",
                    borderColor: "#e76f51",
                    borderWidth: 1,
                    borderRadius: 8,
                    borderSkipped: false,
                    maxBarThickness: 48
                }
            ]
        },
        plugins: [barTopLabelsPlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 25,
                    left: 8,
                    right: 8,
                    bottom: 8
                }
            },
            interaction: {
                mode: "index",
                intersect: false
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { family: "Inter", size: 12, weight: "bold" },
                        color: "#4b5563"
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "#f3f4f6",
                        borderDash: [4, 4]
                    },
                    ticks: {
                        font: { family: "Inter", size: 11 },
                        color: "#9ca3af",
                        callback: function (value) {
                            if (value >= 1000000) {
                                return `৳${(value / 1000000).toFixed(1)}M`;
                            }
                            if (value >= 1000) {
                                return `৳${(value / 1000).toFixed(0)}k`;
                            }
                            return `৳${value}`;
                        }
                    }
                }
            }
        }
    });
}

// Fetch Platform Fee Percentage
async function fetchPlatformFeePercentage() {
    const token = getToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/payments/config/platform-fee`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) return null;
        const result = await response.json();
        if (result.success && typeof result.data?.platformFeePercentage === "number") {
            return result.data.platformFeePercentage;
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Fetch Organizer Payments
async function fetchOrganizerPayments() {
    const token = getToken();
    if (!token) {
        throw new Error("You are not logged in. Please login as an organizer.");
    }

    const response = await fetch(`${API_BASE_URL}/payments/organizer/all`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to load payments.");
    }

    return result.data || [];
}

// Load Revenue Summary
async function loadRevenueSummary() {
    showLoading();

    try {
        const [payments, feePercentage] = await Promise.all([
            fetchOrganizerPayments(),
            fetchPlatformFeePercentage()
        ]);

        const paidPayments = getPaidPayments(payments);

        const todayRange = getTodayRange();
        const weekRange = getLast7DaysRange();
        const monthRange = getLastMonthRange();

        const today = calculatePeriodSummary(paidPayments, todayRange.start, todayRange.end);
        const last7Days = calculatePeriodSummary(paidPayments, weekRange.start, weekRange.end);
        const last1Month = calculatePeriodSummary(paidPayments, monthRange.start, monthRange.end);

        const computedFeePercentage = calculatePlatformFeePercentage(paidPayments, feePercentage);

        renderSummaryCard(
            todayTotalPayments,
            todayTotalRevenue,
            todayPlatformFee,
            todayPlatformFeePercent,
            todayOrganizerRevenue,
            today,
            computedFeePercentage
        );

        renderSummaryCard(
            weekTotalPayments,
            weekTotalRevenue,
            weekPlatformFee,
            weekPlatformFeePercent,
            weekOrganizerRevenue,
            last7Days,
            computedFeePercentage
        );

        renderSummaryCard(
            monthTotalPayments,
            monthTotalRevenue,
            monthPlatformFee,
            monthPlatformFeePercent,
            monthOrganizerRevenue,
            last1Month,
            computedFeePercentage
        );

        // Render Bar Graph
        renderRevenueBarChart({ today, last7Days, last1Month });

        showContent();
    } catch (error) {
        console.error("Revenue summary error:", error);
        showError();
    }
}

// Event Listeners
if (retryButton) {
    retryButton.addEventListener("click", loadRevenueSummary);
}

// Initial Load
document.addEventListener("DOMContentLoaded", loadRevenueSummary);
