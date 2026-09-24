// EventEase AI Chatbot
// Modern Floating Gemini AI Assistant

(function () {
    "use strict";

    // Configuration

    const API_URL = "http://localhost:5000/api/v1/ai/chat";

    // State

    let isOpen = false;
    let isSending = false;
    let lastUserMessage = null;

    // SVG Icons

    const BOT_AVATAR_SVG = `
        <svg class="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 2v3" stroke-linecap="round"/>
            <circle cx="12" cy="2" r="1.2" fill="currentColor"/>
            <rect x="3" y="5" width="18" height="13" rx="4.5" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="1.8"/>
            <path d="M2 9.5v4M22 9.5v4" stroke-linecap="round"/>
            <circle cx="8" cy="11.5" r="1.4" fill="currentColor"/>
            <circle cx="16" cy="11.5" r="1.4" fill="currentColor"/>
            <path d="M9.5 14.8c.8.7 1.6 1 2.5 1s1.7-.3 2.5-1" stroke="currentColor" stroke-linecap="round" stroke-width="1.6"/>
        </svg>
    `;

    const BOT_HEADER_SVG = `
        <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 2v3" stroke-linecap="round"/>
            <circle cx="12" cy="2" r="1.2" fill="#a7f3d0"/>
            <rect x="3" y="5" width="18" height="13" rx="4.5" fill="rgba(255,255,255,0.18)" stroke="currentColor" stroke-width="1.8"/>
            <path d="M2 9.5v4M22 9.5v4" stroke-linecap="round"/>
            <circle cx="8" cy="11.5" r="1.5" fill="#a7f3d0"/>
            <circle cx="16" cy="11.5" r="1.5" fill="#a7f3d0"/>
            <path d="M9.5 14.8c.8.7 1.6 1 2.5 1s1.7-.3 2.5-1" stroke="#a7f3d0" stroke-linecap="round" stroke-width="1.6"/>
        </svg>
    `;

    const BOT_FLOATING_BUTTON_SVG = `
        <svg class="h-7 w-7 text-white drop-shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <!-- Antenna -->
            <path d="M12 2v3" stroke-linecap="round"/>
            <circle cx="12" cy="2" r="1.5" fill="#a7f3d0" stroke="#31572c" stroke-width="0.8"/>
            <!-- Head Body -->
            <rect x="3" y="5" width="18" height="13" rx="4.5" fill="rgba(255,255,255,0.15)" stroke="currentColor" stroke-width="1.8"/>
            <!-- Ears / Headsets -->
            <path d="M1.8 9.5v4c0 .6.5 1.1 1.2 1.1" stroke-linecap="round"/>
            <path d="M22.2 9.5v4c0 .6-.5 1.1-1.2 1.1" stroke-linecap="round"/>
            <!-- Expressive Eyes -->
            <circle cx="8" cy="11.5" r="1.6" fill="#a7f3d0"/>
            <circle cx="16" cy="11.5" r="1.6" fill="#a7f3d0"/>
            <!-- Cute Smile -->
            <path d="M9.3 14.8c.8.8 1.7 1.1 2.7 1.1s1.9-.3 2.7-1.1" stroke="#a7f3d0" stroke-width="1.8" stroke-linecap="round"/>
            <!-- Sparkle top right -->
            <path d="M19 1.5l.3.8.8.3-.8.3-.3.8-.3-.8-.8-.3.8-.3z" fill="#fef08a" stroke="none"/>
        </svg>
    `;

    // Get Authentication Token

    function getAuthToken() {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("authToken") ||
            sessionStorage.getItem("token") ||
            sessionStorage.getItem("accessToken") ||
            sessionStorage.getItem("authToken")
        );
    }

    // Escape HTML

    function escapeHTML(value) {
        const div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    // Format AI Markdown

    function formatAIMarkdown(text) {
        if (!text) return "";
        let html = escapeHTML(text);

        // Bold **text**
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');

        // Italic *text*
        html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>');

        // Parse line by line for bullet points and lists
        const lines = html.split("\n");
        let formatted = [];
        let inList = false;
        let listType = "ul";

        lines.forEach((line) => {
            const trimmed = line.trim();

            if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
                if (!inList) {
                    formatted.push('<ul class="list-disc list-inside space-y-1 my-1.5 text-gray-700 text-[13px]">');
                    inList = true;
                    listType = "ul";
                }
                formatted.push(`<li class="leading-relaxed">${trimmed.substring(2)}</li>`);
            } else if (/^\d+\.\s/.test(trimmed)) {
                if (!inList) {
                    formatted.push('<ol class="list-decimal list-inside space-y-1 my-1.5 text-gray-700 text-[13px]">');
                    inList = true;
                    listType = "ol";
                }
                formatted.push(`<li class="leading-relaxed">${trimmed.replace(/^\d+\.\s/, "")}</li>`);
            } else {
                if (inList) {
                    formatted.push(listType === "ul" ? "</ul>" : "</ol>");
                    inList = false;
                }
                if (trimmed) {
                    formatted.push(`<p class="my-1 leading-relaxed text-[13px]">${line}</p>`);
                } else {
                    formatted.push('<div class="h-1.5"></div>');
                }
            }
        });

        if (inList) {
            formatted.push(listType === "ul" ? "</ul>" : "</ol>");
        }

        return formatted.join("");
    }

    function sanitizeErrorMessage(message) {
        if (typeof message !== "string") {
            return "Sorry, something went wrong while processing your request. Please try again.";
        }

        const trimmed = message.trim();
        if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
            try {
                JSON.parse(trimmed);
                return "Sorry, something went wrong while processing your request. Please try again.";
            } catch {
                // Not valid JSON, allow it
            }
        }

        return message;
    }

    // Scroll Messages

    function scrollToBottom() {
        const messages = document.getElementById("aiMessages");
        if (!messages) return;

        setTimeout(() => {
            messages.scrollTop = messages.scrollHeight;
        }, 50);
    }

    // Add User Message

    function addUserMessage(message) {
        const messages = document.getElementById("aiMessages");
        if (!messages) return;

        const messageElement = document.createElement("div");
        messageElement.className = "mb-3 flex justify-end animate-fadeIn";

        messageElement.innerHTML = `
            <div class="max-w-[85%] rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#244522] to-[#31572c] px-4 py-2.5 text-[13px] leading-relaxed text-white shadow-sm">
                ${escapeHTML(message)}
            </div>
        `;

        messages.appendChild(messageElement);
        scrollToBottom();
    }

    // Add AI Message

    function addAIMessage(message) {
        const messages = document.getElementById("aiMessages");
        if (!messages) return;

        const messageElement = document.createElement("div");
        messageElement.className = "mb-3 flex items-start gap-2.5 animate-fadeIn";

        messageElement.innerHTML = `
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#eaf2e8] to-[#d8ebd5] text-primary shadow-xs border border-[#31572c]/15">
                ${BOT_AVATAR_SVG}
            </div>

            <div class="max-w-[85%] rounded-2xl rounded-tl-xs bg-white border border-gray-100 px-4 py-3 shadow-xs text-gray-800">
                ${formatAIMarkdown(message)}
            </div>
        `;

        messages.appendChild(messageElement);
        scrollToBottom();
    }

    function addAIErrorMessage(message, retryMessage, retryCallback) {
        const messages = document.getElementById("aiMessages");
        if (!messages) return;

        const messageElement = document.createElement("div");
        messageElement.className = "mb-3 flex items-start gap-2.5 animate-fadeIn";

        let buttonHTML = "";
        if (retryMessage && retryCallback) {
            buttonHTML = `
                <button
                    type="button"
                    class="ai-retry-button mt-2 rounded-xl border border-primary/30 bg-primaryLight/50 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
                >
                    ${escapeHTML(retryMessage)}
                </button>
            `;
        }

        messageElement.innerHTML = `
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 shadow-xs border border-red-100">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>

            <div class="max-w-[85%] rounded-2xl rounded-tl-xs bg-white border border-red-100 px-4 py-3 shadow-xs">
                <p class="whitespace-pre-line text-[13px] leading-relaxed text-red-700">
                    ${escapeHTML(message)}
                </p>
                ${buttonHTML}
            </div>
        `;

        messages.appendChild(messageElement);
        scrollToBottom();

        if (buttonHTML && retryCallback) {
            const button = messageElement.querySelector(".ai-retry-button");
            if (button) {
                button.addEventListener("click", retryCallback);
            }
        }
    }

    // Loading Message

    function addLoadingMessage() {
        const messages = document.getElementById("aiMessages");
        if (!messages) return;

        const loading = document.createElement("div");
        loading.id = "aiLoadingMessage";
        loading.className = "mb-3 flex items-start gap-2.5 animate-fadeIn";

        loading.innerHTML = `
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#eaf2e8] to-[#d8ebd5] text-primary shadow-xs border border-[#31572c]/15">
                ${BOT_AVATAR_SVG}
            </div>

            <div class="rounded-2xl rounded-tl-xs bg-white border border-gray-100 px-4 py-3 shadow-xs">
                <div class="flex items-center gap-1.5 py-0.5">
                    <span class="h-2 w-2 rounded-full bg-[#31572c] animate-bounce" style="animation-duration: 0.8s;"></span>
                    <span class="h-2 w-2 rounded-full bg-[#31572c] animate-bounce" style="animation-duration: 0.8s; animation-delay: 0.15s;"></span>
                    <span class="h-2 w-2 rounded-full bg-[#31572c] animate-bounce" style="animation-duration: 0.8s; animation-delay: 0.3s;"></span>
                </div>
            </div>
        `;

        messages.appendChild(loading);
        scrollToBottom();
    }

    // Remove Loading

    function removeLoadingMessage() {
        const loading = document.getElementById("aiLoadingMessage");
        if (loading) {
            loading.remove();
        }
    }

    // Send Message

    async function sendMessage(message) {
        if (isSending || !message || !message.trim()) {
            return;
        }

        const token = getAuthToken();
        isSending = true;
        lastUserMessage = message.trim();

        const input = document.getElementById("aiMessageInput");
        const sendButton = document.getElementById("aiSendButton");

        if (input) {
            input.value = "";
        }

        if (sendButton) {
            sendButton.disabled = true;
        }

        addUserMessage(message.trim());
        addLoadingMessage();

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    message: message.trim()
                })
            });

            let result;
            try {
                result = await response.json();
            } catch {
                removeLoadingMessage();
                addAIMessage("Server returned an unexpected response. Please try again.");
                return;
            }

            removeLoadingMessage();

            if (!response.ok) {
                const status = response.status;
                let errorMessage = sanitizeErrorMessage(result?.message) || "Failed to get AI response.";

                if (status === 401) {
                    errorMessage = "Your session has expired. Please login again.";
                } else if (status === 403) {
                    errorMessage = sanitizeErrorMessage(result?.message) || "Access denied.";
                } else if (status === 429) {
                    errorMessage = "The AI service is temporarily unavailable because the request limit has been reached. Please try again later.";
                } else if (status === 503) {
                    errorMessage = "Sorry, the AI service is temporarily busy right now. Please try again in a moment.";
                } else if (status >= 500) {
                    errorMessage = sanitizeErrorMessage(result?.message) || "Sorry, something went wrong while processing your request. Please try again.";
                }

                if (status === 503) {
                    addAIErrorMessage(errorMessage, "Try Again", () => sendMessage(lastUserMessage));
                } else {
                    addAIMessage(errorMessage);
                }
                return;
            }

            const reply = result?.data?.reply;
            if (!reply) {
                addAIMessage("AI returned an empty response. Please try again.");
                return;
            }

            addAIMessage(reply);

        } catch (error) {
            removeLoadingMessage();
            let errorMessage = "Sorry, I couldn't process your request right now. Please try again.";
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                errorMessage = "Unable to connect to the AI service. Please check your connection and try again.";
            }
            addAIMessage(errorMessage);
        } finally {
            isSending = false;
            if (sendButton) {
                sendButton.disabled = false;
            }
            if (input) {
                input.focus();
            }
        }
    }

    // OPEN CHAT

    function openChat() {
        const windowElement = document.getElementById("aiChatWindow");
        const botButton = document.getElementById("aiBotButton");
        if (!windowElement) return;

        windowElement.classList.remove("hidden");
        if (botButton) {
            botButton.classList.add("scale-95", "opacity-90");
        }
//  AI button (on ,off) 

        isOpen = true;

        const input = document.getElementById("aiMessageInput");
        if (input) {
            setTimeout(() => {
                input.focus();
            }, 100);
        }
    }

    // Close Chat

    function closeChat() {
        const windowElement = document.getElementById("aiChatWindow");
        const botButton = document.getElementById("aiBotButton");
        if (!windowElement) return;

        windowElement.classList.add("hidden");
        if (botButton) {
            botButton.classList.remove("scale-95", "opacity-90");
        }
        isOpen = false;
    }

    // Clear Chat

    function clearChat() {
        const messages = document.getElementById("aiMessages");
        if (!messages) return;

        messages.innerHTML = `
            <!-- Welcome Message -->
            <div class="mb-3 flex items-start gap-2.5 animate-fadeIn">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#eaf2e8] to-[#d8ebd5] text-primary shadow-xs border border-[#31572c]/15">
                   ${BOT_AVATAR_SVG}
                </div>

                <div class="max-w-[85%] rounded-2xl rounded-tl-xs bg-white border border-gray-100 px-4 py-3 shadow-xs text-gray-800">
                    <p class="text-[13px] leading-relaxed text-gray-700">
                        Hello! 👋 I'm <strong>EventEase AI Assistant</strong>. How can I help you find or manage events today?
                    </p>
                </div>
            </div>

            <!-- Suggested Questions -->
            <div id="aiSuggestions" class="ml-10 space-y-2 pt-1">
                <button
                    type="button"
                    class="ai-suggestion group flex w-full items-center gap-2.5 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-gray-700 shadow-xs transition duration-200 hover:border-primary hover:bg-primaryLight/40 hover:text-primary"
                >
                    <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[11px] group-hover:bg-primary/10">🎵</span>
                    <span class="flex-1">Show me upcoming music events</span>
                    <svg class="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>

                <button
                    type="button"
                    class="ai-suggestion group flex w-full items-center gap-2.5 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-gray-700 shadow-xs transition duration-200 hover:border-primary hover:bg-primaryLight/40 hover:text-primary"
                >
                    <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[11px] group-hover:bg-primary/10">🎟️</span>
                    <span class="flex-1">How can I book an event?</span>
                    <svg class="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>

                <button
                    type="button"
                    class="ai-suggestion group flex w-full items-center gap-2.5 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-gray-700 shadow-xs transition duration-200 hover:border-primary hover:bg-primaryLight/40 hover:text-primary"
                >
                    <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[11px] group-hover:bg-primary/10">🔥</span>
                    <span class="flex-1">What are the trending events?</span>
                    <svg class="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        `;

        bindSuggestionButtons();
    }

    function bindSuggestionButtons() {
        document.querySelectorAll(".ai-suggestion").forEach((button) => {
            button.addEventListener("click", function () {
                const text = this.querySelector("span.flex-1")
                    ? this.querySelector("span.flex-1").textContent.trim()
                    : this.textContent.trim();
                sendMessage(text);
            });
        });
    }

    // Initialize Chatbot Events

    function initializeChatbot() {
        const botButton = document.getElementById("aiBotButton");
        const closeButton = document.getElementById("aiCloseButton");
        const minimizeButton = document.getElementById("aiMinimizeButton");
        const clearButton = document.getElementById("aiClearButton");
        const form = document.getElementById("aiChatForm");

        if (botButton) {
            botButton.addEventListener("click", () => {
                if (isOpen) {
                    closeChat();
                } else {
                    openChat();
                }
            });
        }

        if (closeButton) {
            closeButton.addEventListener("click", closeChat);
        }

        if (minimizeButton) {
            minimizeButton.addEventListener("click", closeChat);
        }

        if (clearButton) {
            clearButton.addEventListener("click", clearChat);
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                const input = document.getElementById("aiMessageInput");
                if (!input) return;
                sendMessage(input.value);
            });
        }

        bindSuggestionButtons();
    }

    // Create Chatbot HTML

    function createChatbot() {
        if (document.getElementById("eventease-ai-chatbot")) {
            return;
        }

        const chatbotContainer = document.createElement("div");
        chatbotContainer.id = "eventease-ai-chatbot";

        chatbotContainer.innerHTML = `

            <!-- AI CHAT WINDOW/ CHAT BOx -->

            <div
                id="aiChatWindow"
                class="fixed bottom-24 right-5 z-[10000] hidden
                       w-[calc(100vw-2.5rem)] max-w-[400px]
                       overflow-hidden rounded-[28px] bg-white
                       shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]
                       border border-gray-100 ring-1 ring-black/5
                       transition-all duration-300 sm:right-6"
            >

                <!-- HEADER -->

                <div
                    class="relative overflow-hidden bg-gradient-to-r from-[#203c1e] via-[#31572c] to-[#3d6b38]
                           px-5 py-4 text-white shadow-md"
                >
                    <!-- Background ambient glow -->
                    <div class="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl"></div>

                    <div class="relative flex items-center justify-between">

                        <div class="flex items-center gap-3">

                            <!-- Bot Avatar -->
                            <div class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
                                ${BOT_HEADER_SVG}
                                <!-- Pulse Dot -->
                                <span class="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-[#31572c]"></span>
                                </span>
                            </div>

                            <!-- Title & Subtitle -->
                            <div>
                                <div class="flex items-center gap-2">
                                    <h3 class="text-sm font-bold tracking-tight text-white">EventEase AI</h3>
                                    <span class="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-400/30">
                                        Online
                                    </span>
                                </div>
                                <p class="text-[11px] text-white/80 mt-0.5">Your Smart Event Assistant</p>
                            </div>

                        </div>

                        <!-- Header Controls -->
                        <div class="flex items-center gap-1">

                            <!-- Clear Chat -->
                            <button
                                id="aiClearButton"
                                type="button"
                                class="flex h-8 w-8 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/20 hover:text-white"
                                title="Clear conversation"
                            >
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>

                            <!-- Minimize -->
                            <button
                                id="aiMinimizeButton"
                                type="button"
                                class="flex h-8 w-8 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/20 hover:text-white"
                                title="Minimize"
                            >
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
                                </svg>
                            </button>

                            <!-- Close -->
                            <button
                                id="aiCloseButton"
                                type="button"
                                class="flex h-8 w-8 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/20 hover:text-white"
                                title="Close"
                            >
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                        </div>

                    </div>

                </div>

                <!-- CHAT MESSAGES -->

                <div
                    id="aiMessages"
                    class="h-[380px] overflow-y-auto bg-gradient-to-b from-[#f8faf8] via-gray-50 to-gray-50 p-4"
                >

                    <!-- Welcome Message -->
                    <div class="mb-3 flex items-start gap-2.5 animate-fadeIn">

                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#eaf2e8] to-[#d8ebd5] text-primary shadow-xs border border-[#31572c]/15">
                            ${BOT_AVATAR_SVG}
                        </div>

                        <div class="max-w-[85%] rounded-2xl rounded-tl-xs bg-white border border-gray-100 px-4 py-3 shadow-xs text-gray-800">
                            <p class="text-[13px] leading-relaxed text-gray-700">
                                Hello! 👋 I'm <strong>EventEase AI Assistant</strong>. How can I help you find or manage events today?
                            </p>
                        </div>

                    </div>

                    <!-- Suggested Questions -->

                    <div id="aiSuggestions" class="ml-10 space-y-2 pt-1">

                        <button
                            type="button"
                            class="ai-suggestion group flex w-full items-center gap-2.5 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-gray-700 shadow-xs transition duration-200 hover:border-primary hover:bg-primaryLight/40 hover:text-primary"
                        >
                            <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[11px] group-hover:bg-primary/10">🎵</span>
                            <span class="flex-1">Show me upcoming music events</span>
                            <svg class="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>

                        <button
                            type="button"
                            class="ai-suggestion group flex w-full items-center gap-2.5 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-gray-700 shadow-xs transition duration-200 hover:border-primary hover:bg-primaryLight/40 hover:text-primary"
                        >
                            <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[11px] group-hover:bg-primary/10">🎟️</span>
                            <span class="flex-1">How can I book an event?</span>
                            <svg class="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>

                        <button
                            type="button"
                            class="ai-suggestion group flex w-full items-center gap-2.5 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-gray-700 shadow-xs transition duration-200 hover:border-primary hover:bg-primaryLight/40 hover:text-primary"
                        >
                            <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[11px] group-hover:bg-primary/10">🔥</span>
                            <span class="flex-1">What are the trending events?</span>
                            <svg class="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>

                    </div>

                </div>

                <!-- INPUT AREA/INPUT BOX -->

                <div class="border-t border-gray-100 bg-white p-3.5">

                    <form id="aiChatForm" class="flex items-center gap-2">

                        <input
                            id="aiMessageInput"
                            type="text"
                            autocomplete="off"
                            placeholder="Ask anything about events..."
                            class="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-50/90 px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none transition duration-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                        />

                         <!-- SEND BUTTON-->   

                        <button
                            id="aiSendButton"
                            type="submit"
                            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#244522] to-[#31572c] text-white shadow-md shadow-primary/20 transition duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                            title="Send message"
                        >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>

                    </form>

                    <div class="mt-2.5 flex items-center justify-between px-1 text-[10px] text-gray-400">
                        <span> Event Assistant</span>
                        <span class="font-semibold text-primary">Gemini</span>
                    </div>

                </div>

            </div>

            <!-- FLOATING BOT BUTTON/AI BUTTON -->

            <button
                id="aiBotButton"
                type="button"
                class="group fixed bottom-6 right-5 z-[9999]
                       flex h-14 w-14 items-center justify-center
                       rounded-full bg-gradient-to-tr from-[#244522] via-[#31572c] to-[#42773b]
                       text-white shadow-[0_10px_25px_-4px_rgba(49,87,44,0.5)]
                       ring-2 ring-white/95 transition-all duration-300
                       hover:scale-110 hover:shadow-[0_15px_30px_-4px_rgba(49,87,44,0.65)]
                       active:scale-95 sm:right-6 cursor-pointer"
                title="Open EventEase AI Assistant"
                aria-label="Open EventEase AI Assistant"
            >
                <span class="relative flex items-center justify-center">
                    ${BOT_FLOATING_BUTTON_SVG}

                    <!-- Online Pulse Indicator/DOT INDICATOR -->

                    <span class="absolute -top-1 -right-1 flex h-3 w-3">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-white"></span>
                    </span>
                </span>

                <!-- Hover Tooltip -->

                <span class="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-gray-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-sm">
                    Ask AI Assistant
                </span>
            </button>
        `;

        document.body.appendChild(chatbotContainer);
        initializeChatbot();
    }

    // Start

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createChatbot);
    } else {
        createChatbot();
    }

    console.log("EventEase AI Chatbot initialized");
})();
