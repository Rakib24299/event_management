// ======================================================
// ADMIN REVENUE HISTORY
// ======================================================

// ======================================================
// Configuration
// ======================================================

const API_BASE_URL = "http://localhost:5000/api/v1";

// ======================================================
// Authentication Check
// ======================================================

const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

if (!token) {
    window.location.href = "./admin-login.html";
}

// ======================================================
// DOM Elements
// ======================================================

const loading = document.getElementById("loading");
const errorRetry = document.getElementById("errorRetry");
const retryButton = document.getElementById("retryButton");
const revenueContent = document.getElementById("revenueContent");
const logoutBtn = document.getElementById("logoutBtn");

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
    const value = Number(amount || 0);
    return `৳${value.toLocaleString("en-BD", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

// ======================================================
// Show Loading State
// ======================================================

function showLoading() {
    if (loading) loading.classList.remove("hidden");
    if (errorRetry) errorRetry.classList.add("hidden");
    if (revenueContent) revenueContent.classList.add("hidden");
}

// ======================================================
// Show Error State
// ======================================================

function showError() {
    if (loading) loading.classList.add("hidden");
    if (errorRetry) errorRetry.classList.remove("hidden");
    if (revenueContent) revenueContent.classList.add("hidden");
}

// ======================================================
// Show Content State
// ======================================================

function showContent() {
    if (loading) loading.classList.add("hidden");
    if (errorRetry) errorRetry.classList.add("hidden");
    if (revenueContent) revenueContent.classList.remove("hidden");
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
        totalPaymentsEl.textContent = summary.totalPayments || 0;
    }

    if (totalRevenueEl) {
        totalRevenueEl.textContent = formatCurrency(summary.totalRevenue);
    }

    if (platformFeeEl) {
        const percentText =
            typeof feePercentage === "number" &&
            !isNaN(feePercentage) &&
            feePercentage > 0
                ? ` <span class="text-base font-medium text-gray-500">(${feePercentage}%)</span>`
                : "";

        platformFeeEl.innerHTML = formatCurrency(summary.platformFee) + percentText;
    }

    if (organizerRevenueEl) {
        organizerRevenueEl.textContent = formatCurrency(summary.organizerRevenue);
    }
}

// ======================================================
// Plugin: Draw Values on Top of Bars
// ======================================================

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

                // Ensure the label stays visible and slightly above the bar
                const yPos = Math.max(14, bar.y - 4);
                ctx.fillText(text, bar.x, yPos);
            });
        });

        ctx.restore();
    }
};

// ======================================================
// Render Revenue Bar Chart
// ======================================================

function renderRevenueBarChart(data) {
    if (!chartCanvas || typeof Chart === "undefined") return;

    if (revenueChart) {
        revenueChart.destroy();
        revenueChart = null;
    }

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

    const ctx = chartCanvas.getContext("2d");

    revenueChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Total Revenue",
                    data: totalRevenueData,
                    backgroundColor: "#457b9d",
                    borderColor: "#35627d",
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
                    backgroundColor: "#e76f51",
                    borderColor: "#cf5e42",
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
                    top: 24
                }
            },
            interaction: {
                mode: "index",
                intersect: false
            },
            plugins: {
                legend: {
                    display: false // Using custom HTML legend above chart
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: { family: "Inter", size: 12, weight: "600" },
                        color: "#4b5563"
                    }
                },
                y: {
                    beginAtZero: true,
                    grace: "15%",
                    grid: {
                        color: "#f3f4f6"
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

// ======================================================
// Fetch Revenue History
// ======================================================

async function fetchRevenueHistory() {
    const currentToken = getToken();

    if (!currentToken) {
        throw new Error("You are not logged in. Please login as an admin.");
    }

    const response = await fetch(`${API_BASE_URL}/admin/revenue-history`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json"
        }
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to load revenue history.");
    }

    return result.data || {};
}

// ======================================================
// Load Revenue History
// ======================================================

async function loadRevenueHistory() {
    showLoading();

    try {
        const data = await fetchRevenueHistory();
        const feePercentage = data.platformFeePercentage;

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

        // Render Bar Graph for Today, 7 Days, 1 Month
        renderRevenueBarChart(data);

        showContent();
    } catch (error) {
        console.error("Revenue history error:", error);
        showError();
    }
}

// ======================================================
// Event Listeners
// ======================================================

if (retryButton) {
    retryButton.addEventListener("click", loadRevenueHistory);
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "./admin-login.html";
    });
}

// ======================================================
// Initial Load
// ======================================================

document.addEventListener("DOMContentLoaded", loadRevenueHistory);
