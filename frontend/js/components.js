// ========================================
// Load HTML Components
// ========================================

async function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${filePath}`);
        }

        const html = await response.text();
        element.innerHTML = html;

        if (elementId === "user-header") {
            updateNotificationBadge();
            attachLogoutListener();
        }

        window.dispatchEvent(
            new CustomEvent("componentLoaded", {
                detail: {
                    elementId: elementId,
                    filePath: filePath
                }
            })
        );
    } catch (error) {
        console.error("Component loading error:", error);
    }
}

// ========================================
// Update Notification Badge
// ========================================

async function updateNotificationBadge() {
    const badges = document.querySelectorAll("#notificationBadge, .notification-badge");
    if (!badges || badges.length === 0) return;

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken");

    if (!token) {
        badges.forEach(badge => {
            badge.style.display = "none";
            badge.classList.add("hidden");
            badge.classList.remove("flex");
            badge.textContent = "0";
        });
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/v1/notifications/unread-count", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();

        if (response.ok && result.data !== undefined) {
            const count = typeof result.data === "object" ? (result.data.unreadCount || 0) : Number(result.data || 0);

            badges.forEach(badge => {
                if (count > 0) {
                    badge.textContent = count > 99 ? "99+" : String(count);
                    badge.className = "absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-md ring-2 ring-white z-10 pointer-events-none";
                    badge.style.display = "flex";
                    badge.classList.remove("hidden");
                    badge.classList.add("flex");
                } else {
                    badge.textContent = "0";
                    badge.style.display = "none";
                    badge.classList.add("hidden");
                    badge.classList.remove("flex");
                }
            });
        } else {
            badges.forEach(badge => {
                badge.style.display = "none";
                badge.classList.add("hidden");
                badge.classList.remove("flex");
                badge.textContent = "0";
            });
        }
    } catch (error) {
        console.debug("Notification badge update notice:", error.message);
    }
}

// ========================================
// Attach Logout Listener
// ========================================

function attachLogoutListener() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        window.location.replace("./user-login.html");
    });
}

// ========================================
// Auto-Run and Polling for Notification Badge
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    updateNotificationBadge();
    attachLogoutListener();
});

window.addEventListener("componentLoaded", () => {
    updateNotificationBadge();
});

window.addEventListener("focus", () => {
    updateNotificationBadge();
});

// Run immediately
updateNotificationBadge();

// Run after short delays to catch async rendered headers
setTimeout(updateNotificationBadge, 300);
setTimeout(updateNotificationBadge, 1000);

// Periodically update every 10 seconds
setInterval(updateNotificationBadge, 10000);

// Global export
window.updateNotificationBadge = updateNotificationBadge;
