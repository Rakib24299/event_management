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

        // Auto update badge and attach logout whenever header is loaded
        updateNotificationBadge();
        attachLogoutListener();

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
// Ensure Badge Element Exists In Notification Links
// ========================================

function ensureNotificationBadgesExist() {
    const notifLinks = document.querySelectorAll(
        'a[href*="notifications.html"], a[href*="notification-management.html"], a[title*="Notifications"], a[aria-label*="Notifications"]'
    );

    notifLinks.forEach(link => {
        let badge = link.querySelector("#notificationBadge, .notification-badge");
        if (!badge) {
            badge = document.createElement("span");
            badge.id = "notificationBadge";
            badge.className = "absolute -right-1 -top-1 hidden h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white z-10 pointer-events-none";
            badge.textContent = "0";
            if (getComputedStyle(link).position === "static") {
                link.style.position = "relative";
            }
            link.appendChild(badge);
        }
    });
}

// ========================================
// Update Notification Badge
// ========================================

async function updateNotificationBadge() {
    ensureNotificationBadgesExist();

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
                    badge.className = "absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-md ring-2 ring-white z-10 pointer-events-none";
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
// Ensure Badge Element Exists In Chat Links
// ========================================

function ensureChatBadgesExist() {
    const chatLinks = document.querySelectorAll(
        'a[href*="chat.html"], a[href*="messages.html"], a[title*="Support Chat"], a[title*="Messages"], a[title*="Chat"]'
    );

    chatLinks.forEach(link => {
        let badge = link.querySelector("#chatBadge, #messagesHeaderBadge, #unreadChatBadge, .chat-badge");
        if (!badge) {
            badge = document.createElement("span");
            badge.id = "chatBadge";
            badge.className = "absolute -right-1.5 -top-1.5 hidden h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-md ring-2 ring-white z-10 pointer-events-none";
            badge.textContent = "0";
            if (getComputedStyle(link).position === "static") {
                link.style.position = "relative";
            }
            link.appendChild(badge);
        }
    });
}

// ========================================
// Update Chat Badge
// ========================================

async function updateChatBadge() {
    ensureChatBadgesExist();

    const badges = document.querySelectorAll("#chatBadge, #messagesHeaderBadge, #unreadChatBadge, .chat-badge");
    if (!badges || badges.length === 0) return;

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("adminToken") ||
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
        const response = await fetch("http://localhost:5000/api/v1/chat/unread-count", {
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
                    badge.className = "absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-md ring-2 ring-white z-10 pointer-events-none";
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
        console.debug("Chat badge update notice:", error.message);
    }
}

// ========================================
// Attach Logout Listener
// ========================================

function attachLogoutListener() {
    const logoutBtns = document.querySelectorAll("#logoutBtn, .logout-btn");
    logoutBtns.forEach(btn => {
        btn.onclick = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            window.location.replace("./user-login.html");
        };
    });
}

// ========================================
// Auto-Run and Polling for Notification & Chat Badges
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    ensureNotificationBadgesExist();
    ensureChatBadgesExist();
    updateNotificationBadge();
    updateChatBadge();
    attachLogoutListener();
});

window.addEventListener("componentLoaded", () => {
    ensureNotificationBadgesExist();
    ensureChatBadgesExist();
    updateNotificationBadge();
    updateChatBadge();
    attachLogoutListener();
});

window.addEventListener("focus", () => {
    updateNotificationBadge();
    updateChatBadge();
});

// Run immediately and after small delays for async components
ensureNotificationBadgesExist();
ensureChatBadgesExist();
updateNotificationBadge();
updateChatBadge();
setTimeout(() => { updateNotificationBadge(); updateChatBadge(); }, 300);
setTimeout(() => { updateNotificationBadge(); updateChatBadge(); }, 800);
setTimeout(() => { updateNotificationBadge(); updateChatBadge(); }, 1500);

// Periodically update every 4 seconds
setInterval(() => {
    updateNotificationBadge();
    updateChatBadge();
}, 4000);

// Global export
window.updateNotificationBadge = updateNotificationBadge;
window.updateChatBadge = updateChatBadge;

