/**
 * Organizer Support Chat Script
 * Real-time direct chat between Organizer and Platform Admin
 */

const API_BASE = "http://localhost:5000/api/v1";
const SOCKET_SERVER = "http://localhost:5000";

let socket = null;
let currentAdmin = null;
let currentOrganizer = null;
let messages = [];
let typingTimeout = null;

// DOM Elements
const chatMessagesArea = document.getElementById("chatMessagesArea");
const messagesList = document.getElementById("messagesList");
const messagesLoading = document.getElementById("messagesLoading");
const emptyChatState = document.getElementById("emptyChatState");
const typingIndicator = document.getElementById("typingIndicator");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const adminName = document.getElementById("adminName");
const toastContainer = document.getElementById("toastContainer");

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Auth check
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
        window.location.href = "../auth/login.html";
        return;
    }

    try {
        currentOrganizer = JSON.parse(userStr);
        if (currentOrganizer.role !== "organizer") {
            window.location.href = "../auth/login.html";
            return;
        }
    } catch (e) {
        window.location.href = "../auth/login.html";
        return;
    }

    // 2. Initialize Socket.IO
    initSocket();

    // 3. Load Chat and Admin Info
    await loadAdminAndMessages();

    // 4. Setup Event Listeners
    setupEventListeners();
});

/**
 * Initialize Socket.IO connection
 */
function initSocket() {
    socket = io(SOCKET_SERVER, {
        transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
        console.log("[Socket] Connected to server as Organizer:", socket.id);
        
        // Join rooms /JOIN CHAT
        if (currentOrganizer && currentOrganizer._id) {
            socket.emit("joinOrganizerRoom", currentOrganizer._id);
            socket.emit("joinUserRoom", currentOrganizer._id);
        }
    });

    // Listen for incoming messages
    socket.on("chat:new_message", (message) => {
        console.log("[Socket] Received new message:", message);
        
        // Check if message belongs to this conversation
        const senderId = String(message.sender?._id || message.sender);
        const adminId = String(currentAdmin?._id);
        const myId = String(currentOrganizer?._id);

        const isFromAdmin = (currentAdmin && senderId === adminId);
        const isFromMe = (currentOrganizer && senderId === myId);

        if (isFromAdmin || isFromMe) {
            // Avoid duplicate if we already appended it
            const exists = messages.some(m => String(m._id) === String(message._id));
            if (!exists) {
                messages.push(message);
                renderMessages();
                scrollToBottom();

                // If sent from admin, mark as read immediately since we are on this screen
                if (isFromAdmin) {
                    markMessagesAsRead(currentAdmin._id);
                }
            }
        }
    });

    // Listen for own message sent confirmations
    socket.on("chat:message_sent", (message) => {
        const senderId = String(message.sender?._id || message.sender);
        const myId = String(currentOrganizer?._id);
        if (senderId === myId) {
            const exists = messages.some(m => String(m._id) === String(message._id));
            if (!exists) {
                messages.push(message);
                renderMessages();
                scrollToBottom();
            }
        }
    });

    // Listen for message read receipts
    socket.on("chat:messages_read", (data) => {
        if (currentOrganizer && data.readerId !== currentOrganizer._id) {
            messages.forEach(m => {
                if (m.sender._id === currentOrganizer._id || m.sender === currentOrganizer._id) {
                    m.isRead = true;
                    m.readAt = new Date().toISOString();
                }
            });
            renderMessages();
        }
    });

    // Listen for typing events
    socket.on("chat:typing", (data) => {
        if (currentAdmin && (data.senderId === currentAdmin._id || data.senderRole === "admin")) {
            showTyping(true);
        }
    });

    socket.on("chat:stop_typing", (data) => {
        if (currentAdmin && (data.senderId === currentAdmin._id || data.senderRole === "admin")) {
            showTyping(false);
        }
    });

    socket.on("disconnect", () => {
        console.log("[Socket] Disconnected from chat server");
    });
}

/**
 * Load admin profile & initial messages history
 */
async function loadAdminAndMessages() {
    try {
        messagesLoading.classList.remove("hidden");
        emptyChatState.classList.add("hidden");

        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/chat/organizer/admin`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        messagesLoading.classList.add("hidden");

        if (data.success && data.data) {
            currentAdmin = data.data.admin;
            messages = data.data.messages || [];

            if (adminName && currentAdmin) {
                adminName.textContent = currentAdmin.name ? `${currentAdmin.name} (Admin)` : "Platform Admin Support";
            }

            renderMessages();
            scrollToBottom();

            // Mark unread messages as read
            if (currentAdmin && currentAdmin._id) {
                markMessagesAsRead(currentAdmin._id);
            }
        } else {
            showToast(data.message || "Failed to load admin chat", "error");
        }
    } catch (error) {
        console.error("Error loading chat:", error);
        messagesLoading.classList.add("hidden");
        showToast("Error connecting to support service", "error");
    }
}

/**
 * Render all messages
 */
function renderMessages() {
    if (!messages || messages.length === 0) {
        emptyChatState.classList.remove("hidden");
        messagesList.innerHTML = "";
        return;
    }

    emptyChatState.classList.add("hidden");

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

        const isMine = (currentOrganizer && (msg.sender._id === currentOrganizer._id || msg.sender === currentOrganizer._id));
        const timeStr = msgDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

        if (isMine) {
            // Organizer message (sent - Right)
            html += `
                <div class="flex flex-col items-end group">
                    <div class="max-w-[78%] sm:max-w-[65%] rounded-2xl rounded-tr-sm bg-primary text-white p-3.5 shadow-sm">
                        <p class="text-sm leading-relaxed whitespace-pre-wrap break-words">${escapeHTML(msg.text)}</p>
                    </div>
                    <div class="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400 pr-1">
                        <span>${timeStr}</span>
                        ${msg.isRead 
                            ? `<svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7m-14 4l4 4L19 7"/></svg>` 
                            : `<svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
                        }
                    </div>
                </div>
            `;
        } else {
            // Admin message (received - Left)
            html += `
                <div class="flex flex-col items-start group">
                    <div class="flex items-start gap-2.5 max-w-[85%] sm:max-w-[70%]">
                        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                            A
                        </div>
                        <div>
                            <div class="rounded-2xl rounded-tl-sm bg-white text-gray-800 p-3.5 border border-gray-100 shadow-sm">
                                <p class="text-sm leading-relaxed whitespace-pre-wrap break-words">${escapeHTML(msg.text)}</p>
                            </div>
                            <div class="mt-1 text-[11px] text-gray-400 pl-1">
                                <span>${timeStr}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    messagesList.innerHTML = html;
}

/**
 * Scroll message feed to bottom
 */
function scrollToBottom() {
    setTimeout(() => {
        chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
    }, 50);
}

/**
 * Setup input & send handlers
 */
function setupEventListeners() {
    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (!text || !currentAdmin) return;

        messageInput.value = "";
        sendBtn.disabled = true;

        // Emit stop typing
        if (socket) {
            socket.emit("chat:stop_typing", {
                receiverId: currentAdmin._id,
                senderId: currentOrganizer._id,
            });
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/chat/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    receiverId: currentAdmin._id,
                    text: text,
                }),
            });

            const data = await res.json();
            if (data.success && data.data) {
                // If socket didn't already push it
                const exists = messages.some(m => String(m._id) === String(data.data._id));
                if (!exists) {
                    messages.push(data.data);
                    renderMessages();
                    scrollToBottom();
                }
            } else {
                showToast(data.message || "Failed to send message", "error");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            showToast("Failed to send message. Please check connection.", "error");
        } finally {
            sendBtn.disabled = false;
            messageInput.focus();
        }
    });

    // Typing emission 
    //TYPING ORGANIZER
    //TYPING INDICATOR ORGA
    messageInput.addEventListener("input", () => {
        if (!socket || !currentAdmin) return;

        socket.emit("chat:typing", {
            receiverId: currentAdmin._id,
            senderId: currentOrganizer._id,
            senderName: currentOrganizer.name || "Organizer",
            senderRole: "organizer",
        });

        // TYPING LIMIT
        //TYPING OFF
        
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit("chat:stop_typing", {
                receiverId: currentAdmin._id,
                senderId: currentOrganizer._id,
            });
        }, 2000);
    });
}

/**
 * Mark messages from admin as read
 */
async function markMessagesAsRead(adminId) {
    if (!adminId) return;
    try {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE}/chat/read/${adminId}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (e) {
        console.error("Error marking messages as read:", e);
    }
}

/**
 * Show/hide typing indicator
 */
function showTyping(show) {
    if (show) {
        typingIndicator.classList.remove("hidden");
    } else {
        typingIndicator.classList.add("hidden");
    }
    scrollToBottom();
}

/**
 * Helper to escape HTML characters
 */
function escapeHTML(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = "info") {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    const bg = type === "error" ? "bg-red-500" : type === "success" ? "bg-emerald-500" : "bg-gray-800";
    toast.className = `${bg} text-white px-4 py-3 rounded-2xl shadow-lg text-sm font-medium flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0`;
    toast.innerHTML = `<span>${message}</span>`;

    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove("translate-y-2", "opacity-0");
    }, 10);

    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-2");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
