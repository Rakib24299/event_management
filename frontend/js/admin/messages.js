// ========================================
// Admin Messages & 1-on-1 Chat with Organizers
// EventEase Admin Panel
// ========================================

const API_BASE_URL = "http://localhost:5000/api/v1";
const SOCKET_SERVER_URL = "http://localhost:5000";


// ========================================
// DOM Elements
// ========================================

const organizersLoading = document.getElementById("organizersLoading");
const organizersEmpty = document.getElementById("organizersEmpty");
const organizersList = document.getElementById("organizersList");
const searchOrganizerInput = document.getElementById("searchOrganizerInput");

const noChatSelected = document.getElementById("noChatSelected");
const activeChatPanel = document.getElementById("activeChatPanel");

const chatOrganizerAvatar = document.getElementById("chatOrganizerAvatar");
const chatOrganizerName = document.getElementById("chatOrganizerName");
const chatOrganizationName = document.getElementById("chatOrganizationName");

const messagesFeed = document.getElementById("messagesFeed");
const chatMessageForm = document.getElementById("chatMessageForm");
const messageTextInput = document.getElementById("messageTextInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const refreshChatBtn = document.getElementById("refreshChatBtn");

const typingIndicator = document.getElementById("typingIndicator");
const typingUserName = document.getElementById("typingUserName");

const messagesHeaderBadge = document.getElementById("messagesHeaderBadge");
const notificationBadge = document.getElementById("notificationBadge");
const logoutButton = document.getElementById("logoutButton");


// ========================================
// State
// ========================================

let socket = null;
let currentAdmin = null;
let allOrganizers = [];
let selectedOrganizer = null;
let typingTimeout = null;


// ========================================
// Token & Auth Helper
// ========================================

function getToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("adminToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken")
    );
}

const token = getToken();

if (!token) {
    window.location.replace("./admin-login.html");
}


// ========================================
// Escape HTML Helper
// ========================================

function escapeHTML(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// Format Time Helper
// ========================================

function formatMessageTime(dateValue) {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatRelativeTime(dateValue) {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
}


// ========================================
// API Request Helper
// ========================================

async function apiRequest(endpoint, options = {}) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Request failed");
    }
    return data;
}


// ========================================
// Initialize Socket.IO
// ========================================

function initSocket() {
    if (typeof io === "undefined") {
        console.warn("Socket.io client library not found.");
        return;
    }

    socket = io(SOCKET_SERVER_URL, {
        transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
        console.log("🔌 Connected to Chat Socket Server:", socket.id);
        socket.emit("joinAdminRoom");
        if (currentAdmin && currentAdmin._id) {
            socket.emit("joinUserRoom", currentAdmin._id);
        }
    });

    // New incoming message from any organizer
    socket.on("chat:new_message", (message) => {
        handleIncomingMessage(message);
    });

    // Message sent confirmation
    socket.on("chat:message_sent", (message) => {
        handleIncomingMessage(message);
    });

    // Typing indicators
    socket.on("chat:typing", (data) => {
        if (selectedOrganizer && String(data.senderId) === String(selectedOrganizer._id)) {
            if (typingUserName) {
                typingUserName.textContent = selectedOrganizer.name || "Organizer";
            }
            if (typingIndicator) {
                typingIndicator.classList.remove("hidden");
            }
        }
    });

    socket.on("chat:stop_typing", (data) => {
        if (selectedOrganizer && String(data.senderId) === String(selectedOrganizer._id)) {
            if (typingIndicator) {
                typingIndicator.classList.add("hidden");
            }
        }
    });
}


// ========================================
// Handle Real-Time Incoming Message
// ========================================

async function handleIncomingMessage(message) {
    const senderId = message.sender?._id || message.sender;
    const receiverId = message.receiver?._id || message.receiver;

    // 1. If chat with this organizer is actively open -> append to feed
    if (
        selectedOrganizer &&
        (String(selectedOrganizer._id) === String(senderId) ||
         String(selectedOrganizer._id) === String(receiverId))
    ) {
        appendMessageToFeed(message);
        scrollToBottom();

        // If message was from organizer to admin, mark as read immediately
        if (String(selectedOrganizer._id) === String(senderId)) {
            try {
                await apiRequest(`/chat/read/${selectedOrganizer._id}`, { method: "PATCH" });
            } catch (err) {
                console.error("Failed to mark as read:", err);
            }
        }
    }

    // 2. Update organizer entry in the list
    const orgIdToUpdate = String(senderId) === String(currentAdmin?._id) ? String(receiverId) : String(senderId);
    const orgIndex = allOrganizers.findIndex((org) => String(org._id) === orgIdToUpdate);

    if (orgIndex !== -1) {
        allOrganizers[orgIndex].latestMessage = {
            text: message.text,
            createdAt: message.createdAt,
            senderId: senderId,
            isRead: message.isRead,
        };
        allOrganizers[orgIndex].lastInteraction = new Date(message.createdAt);

        // Increment unread count if received from organizer and not active
        if (
            String(senderId) !== String(currentAdmin?._id) &&
            (!selectedOrganizer || String(selectedOrganizer._id) !== String(senderId))
        ) {
            allOrganizers[orgIndex].unreadCount = (allOrganizers[orgIndex].unreadCount || 0) + 1;
        }

        // Re-sort organizers by latest interaction
        allOrganizers.sort((a, b) => new Date(b.lastInteraction) - new Date(a.lastInteraction));
        renderOrganizersList();
    } else {
        // Reload list to fetch newly registered organizer if not present
        loadOrganizersList();
    }

    updateHeaderUnreadCount();
}


// ========================================
// Fetch Admin Profile
// ========================================

async function loadAdminProfile() {
    try {
        const res = await apiRequest("/users/me");
        currentAdmin = res.data;
        if (socket && socket.connected && currentAdmin?._id) {
            socket.emit("joinUserRoom", currentAdmin._id);
        }
    } catch (err) {
        console.error("Failed to load admin profile:", err);
    }
}


// ========================================
// Load Organizers Conversations List
// ========================================

async function loadOrganizersList() {
    organizersLoading.classList.remove("hidden");
    organizersEmpty.classList.add("hidden");

    try {
        const res = await apiRequest("/chat/admin/conversations");
        allOrganizers = res.data || [];

        organizersLoading.classList.add("hidden");

        if (allOrganizers.length === 0) {
            organizersEmpty.classList.remove("hidden");
            return;
        }

        renderOrganizersList();
    } catch (err) {
        console.error("Failed to load organizers chat list:", err);
        organizersLoading.classList.add("hidden");
        organizersEmpty.classList.remove("hidden");
    }
}


// ========================================
// Render Organizers Sidebar List
// ========================================

function renderOrganizersList(filterQuery = "") {
    if (!organizersList) return;

    const query = filterQuery.trim().toLowerCase();
    const filtered = allOrganizers.filter((org) => {
        if (!query) return true;
        const name = (org.name || "").toLowerCase();
        const orgName = (org.organizationName || "").toLowerCase();
        const email = (org.email || "").toLowerCase();
        return name.includes(query) || orgName.includes(query) || email.includes(query);
    });

    if (filtered.length === 0) {
        organizersList.innerHTML = `
            <div class="p-6 text-center text-xs text-gray-400">
                No matching organizers found.
            </div>
        `;
        return;
    }

    organizersList.innerHTML = filtered
        .map((org) => {
            const isSelected = selectedOrganizer && String(selectedOrganizer._id) === String(org._id);
            const avatar =
                org.organizationLogo?.url ||
                org.profileImage?.url ||
                "https://via.placeholder.com/100?text=Org";

            const unreadCount = org.unreadCount || 0;
            const lastMsgText = org.latestMessage ? org.latestMessage.text : "No messages yet";
            const lastMsgTime = org.latestMessage ? formatRelativeTime(org.latestMessage.createdAt) : "";

            return `
                <div
                    class="organizer-item flex items-center gap-3.5 p-4 cursor-pointer transition select-none ${
                        isSelected
                            ? "bg-primary/10 border-l-4 border-primary font-medium"
                            : "hover:bg-gray-100/70 border-l-4 border-transparent"
                    }"
                    data-org-id="${org._id}"
                >
                    <div class="relative shrink-0">
                        <img
                            src="${escapeHTML(avatar)}"
                            alt="${escapeHTML(org.name)}"
                            class="h-12 w-12 rounded-2xl object-cover border border-gray-200 bg-white"
                            onerror="this.src='https://via.placeholder.com/100?text=Org'"
                        >
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-1">
                            <h4 class="text-sm font-bold text-gray-900 truncate">
                                ${escapeHTML(org.name || "Organizer")}
                            </h4>
                            <span class="text-[11px] text-gray-400 shrink-0 font-normal">
                                ${escapeHTML(lastMsgTime)}
                            </span>
                        </div>

                        <p class="text-xs text-gray-500 truncate">
                            ${escapeHTML(org.organizationName || org.email || "Organization")}
                        </p>

                        <div class="mt-1 flex items-center justify-between gap-2">
                            <p class="text-xs text-gray-500 truncate max-w-[180px] ${unreadCount > 0 ? 'font-semibold text-gray-900' : ''}">
                                ${escapeHTML(lastMsgText)}
                            </p>

                            ${
                                unreadCount > 0
                                    ? `
                                        <span class="shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                            ${unreadCount}
                                        </span>
                                      `
                                    : ""
                            }
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");

    // Attach click listeners to all organizer items
    document.querySelectorAll(".organizer-item").forEach((item) => {
        item.addEventListener("click", () => {
            const orgId = item.dataset.orgId;
            const org = allOrganizers.find((o) => String(o._id) === String(orgId));
            if (org) {
                selectOrganizer(org);
            }
        });
    });
}


// ========================================
// Select Organizer & Load Conversation
// ========================================

async function selectOrganizer(org) {
    selectedOrganizer = org;

    // Reset unread count locally
    org.unreadCount = 0;
    renderOrganizersList(searchOrganizerInput ? searchOrganizerInput.value : "");

    // Update active chat header
    if (chatOrganizerAvatar) {
        chatOrganizerAvatar.src =
            org.organizationLogo?.url ||
            org.profileImage?.url ||
            "https://via.placeholder.com/100?text=Org";
    }
    if (chatOrganizerName) {
        chatOrganizerName.textContent = org.name || "Organizer";
    }
    if (chatOrganizationName) {
        chatOrganizationName.textContent = org.organizationName
            ? `${org.organizationName} • ${org.email || ''}`
            : org.email || "Event Organizer";
    }

    // Toggle panels
    noChatSelected.classList.add("hidden");
    activeChatPanel.classList.remove("hidden");

    // Load messages
    messagesFeed.innerHTML = `
        <div class="flex h-full items-center justify-center p-8">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
        </div>
    `;

    try {
        const res = await apiRequest(`/chat/conversation/${org._id}`);
        const messages = res.data || [];
        renderMessagesFeed(messages);
        scrollToBottom();
        messageTextInput.focus();
    } catch (err) {
        console.error("Failed to load conversation:", err);
        messagesFeed.innerHTML = `
            <div class="p-8 text-center text-sm text-red-500">
                Failed to load conversation history.
            </div>
        `;
    }

    updateHeaderUnreadCount();
}


// ========================================
// Render Messages in Chat Feed
// ========================================

function renderMessagesFeed(messages) {
    if (!messagesFeed) return;

    if (!messages || messages.length === 0) {
        messagesFeed.innerHTML = `
            <div class="flex h-full flex-col items-center justify-center p-8 text-center text-gray-400">
                <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <p class="text-sm font-semibold text-gray-600">No messages yet</p>
                <p class="mt-1 text-xs text-gray-400">Send a greeting message to start the conversation.</p>
            </div>
        `;
        return;
    }

    let html = "";
    let lastDateStr = "";

    messages.forEach((msg) => {
        const msgDate = new Date(msg.createdAt || Date.now());
        const dateStr = msgDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

        // Date separator
        if (dateStr !== lastDateStr) {
            html += `
                <div class="flex items-center justify-center my-4">
                    <span class="bg-gray-200/70 text-gray-500 text-[11px] font-medium px-3 py-1 rounded-full shadow-xs">
                        ${dateStr}
                    </span>
                </div>
            `;
            lastDateStr = dateStr;
        }

        html += createMessageBubbleHTML(msg);
    });

    messagesFeed.innerHTML = html;
}


// ========================================
// Create Message Bubble HTML
// ========================================

function createMessageBubbleHTML(message) {
    const senderId = message.sender?._id || message.sender;
    const isAdmin = String(senderId) === String(currentAdmin?._id);
    const msgDate = new Date(message.createdAt || Date.now());
    const timeFormatted = msgDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const msgId = message._id ? String(message._id) : "";

    if (isAdmin) {
        // Admin bubble (Right)
        return `
            <div data-msg-id="${escapeHTML(msgId)}" class="flex flex-col items-end group">
                <div class="max-w-[78%] sm:max-w-[65%] rounded-2xl rounded-tr-sm bg-primary text-white p-3.5 shadow-sm">
                    <p class="text-sm leading-relaxed whitespace-pre-wrap break-words">${escapeHTML(message.text)}</p>
                </div>
                <div class="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400 pr-1">
                    <span>${escapeHTML(timeFormatted)}</span>
                </div>
            </div>
        `;
    } else {
        // Organizer bubble (Left)
        const orgAvatar =
            selectedOrganizer?.organizationLogo?.url ||
            selectedOrganizer?.profileImage?.url ||
            "https://via.placeholder.com/100?text=Org";

        return `
            <div data-msg-id="${escapeHTML(msgId)}" class="flex flex-col items-start group">
                <div class="flex items-start gap-2.5 max-w-[85%] sm:max-w-[70%]">
                    <img
                        src="${escapeHTML(orgAvatar)}"
                        alt="Org"
                        class="w-8 h-8 rounded-xl object-cover border border-gray-100 bg-white shrink-0 mt-0.5 shadow-xs"
                        onerror="this.src='https://via.placeholder.com/100?text=Org'"
                    >
                    <div>
                        <div class="rounded-2xl rounded-tl-sm bg-white text-gray-800 p-3.5 border border-gray-100 shadow-sm">
                            <p class="text-sm leading-relaxed whitespace-pre-wrap break-words">${escapeHTML(message.text)}</p>
                        </div>
                        <div class="mt-1 text-[11px] text-gray-400 pl-1">
                            <span>${escapeHTML(timeFormatted)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}


// ========================================
// Append Single Message to Feed
// ========================================

function appendMessageToFeed(message) {
    if (!messagesFeed) return;

    // Deduplication check: if this message is already rendered in feed, skip
    if (message._id && messagesFeed.querySelector(`[data-msg-id="${String(message._id)}"]`)) {
        return;
    }

    // Remove empty state if present
    const emptyStateEl = messagesFeed.querySelector(".flex-col.items-center");
    if (emptyStateEl) {
        messagesFeed.innerHTML = "";
    }

    const bubbleHTML = createMessageBubbleHTML(message);
    messagesFeed.insertAdjacentHTML("beforeend", bubbleHTML);
}


// ========================================
// Scroll to Bottom Helper
// ========================================

function scrollToBottom() {
    if (messagesFeed) {
        messagesFeed.scrollTop = messagesFeed.scrollHeight;
    }
}


// ========================================
// Send Message
// ========================================

async function handleSendMessage(e) {
    if (e) e.preventDefault();

    if (!selectedOrganizer) {
        alert("Please select an organizer first.");
        return;
    }

    const text = messageTextInput.value.trim();
    if (!text) return;

    messageTextInput.value = "";
    sendMessageBtn.disabled = true;

    // Emit stop typing
    if (socket) {
        socket.emit("chat:stop_typing", {
            senderId: currentAdmin?._id,
            receiverId: selectedOrganizer._id,
            isToAdmin: false,
        });
    }

    try {
        const res = await apiRequest("/chat/send", {
            method: "POST",
            body: JSON.stringify({
                receiverId: selectedOrganizer._id,
                text: text,
            }),
        });

        // The socket event will append the message to the feed
    } catch (err) {
        console.error("Failed to send message:", err);
        alert(err.message || "Failed to send message.");
    } finally {
        sendMessageBtn.disabled = false;
        messageTextInput.focus();
    }
}


// ========================================
// Update Header Unread Badge
// ========================================

async function updateHeaderUnreadCount() {
    try {
        const res = await apiRequest("/chat/unread-count");
        const count = res.data?.unreadCount || 0;

        if (messagesHeaderBadge) {
            messagesHeaderBadge.textContent = count;
            if (count > 0) {
                messagesHeaderBadge.classList.remove("hidden");
            } else {
                messagesHeaderBadge.classList.add("hidden");
            }
        }
    } catch (err) {
        console.error("Failed to update unread badge:", err);
    }
}


// ========================================
// Event Listeners
// ========================================

if (chatMessageForm) {
    chatMessageForm.addEventListener("submit", handleSendMessage);
}

if (messageTextInput) {
    messageTextInput.addEventListener("input", () => {
        if (!selectedOrganizer || !socket) return;

        socket.emit("chat:typing", {
            senderId: currentAdmin?._id,
            senderName: currentAdmin?.name || "Admin",
            receiverId: selectedOrganizer._id,
            isToAdmin: false,
        });

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit("chat:stop_typing", {
                senderId: currentAdmin?._id,
                receiverId: selectedOrganizer._id,
                isToAdmin: false,
            });
        }, 2000);
    });
}

if (searchOrganizerInput) {
    searchOrganizerInput.addEventListener("input", (e) => {
        renderOrganizersList(e.target.value);
    });
}

if (refreshChatBtn) {
    refreshChatBtn.addEventListener("click", () => {
        if (selectedOrganizer) {
            selectOrganizer(selectedOrganizer);
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace("./admin-login.html");
    });
}


// ========================================
// Initialize Page
// ========================================

async function init() {
    await loadAdminProfile();
    initSocket();
    await loadOrganizersList();
    await updateHeaderUnreadCount();
}

init();
