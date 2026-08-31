// ========================================
// EventEase AI Chatbot
// Floating Gemini AI Assistant
// ========================================

(function () {

    "use strict";


    // ========================================
    // Configuration
    // ========================================

    const API_URL =
        "http://localhost:5000/api/v1/ai/chat";


    // ========================================
    // State
    // ========================================

    let isOpen = false;
    let isSending = false;
    let lastUserMessage = null;


    // ========================================
    // Get Authentication Token
    // ========================================

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


    // ========================================
    // Escape HTML
    // ========================================

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent = value;

        return div.innerHTML;

    }


    function sanitizeErrorMessage(message) {

        if (typeof message !== "string") {

            return "Sorry, something went wrong while processing your request. Please try again.";

        }


        const trimmed =
            message.trim();


        if (
            (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
            (trimmed.startsWith("[") && trimmed.endsWith("]"))
        ) {

            try {

                JSON.parse(trimmed);

                return "Sorry, something went wrong while processing your request. Please try again.";

            } catch {

                // Not valid JSON, allow it

            }

        }


        return message;

    }


    // ========================================
    // Scroll Messages
    // ========================================

    function scrollToBottom() {

        const messages =
            document.getElementById(
                "aiMessages"
            );

        if (!messages) return;


        setTimeout(() => {

            messages.scrollTop =
                messages.scrollHeight;

        }, 50);

    }


    // ========================================
    // Add User Message
    // ========================================

    function addUserMessage(message) {

        const messages =
            document.getElementById(
                "aiMessages"
            );

        if (!messages) return;


        const messageElement =
            document.createElement("div");


        messageElement.className =
            "mb-4 flex justify-end";


        messageElement.innerHTML = `

            <div
                class="max-w-[82%] rounded-2xl
                       rounded-tr-md px-4 py-3
                       text-sm leading-6 text-white"
                style="background-color:#a8dadc;"
            >
                ${escapeHTML(message)}
            </div>

        `;


        messages.appendChild(
            messageElement
        );


        scrollToBottom();

    }


    // ========================================
    // Add AI Message
    // ========================================

    function addAIMessage(message) {

        const messages =
            document.getElementById(
                "aiMessages"
            );

        if (!messages) return;


        const messageElement =
            document.createElement("div");


        messageElement.className =
            "mb-4 flex items-start gap-2";


        messageElement.innerHTML = `

            <div
                class="flex h-8 w-8 shrink-0
                       items-center justify-center
                       rounded-xl bg-white
                       text-lg shadow-sm"
            >
                🤖
            </div>


            <div
                class="max-w-[82%] rounded-2xl
                       rounded-tl-md bg-white
                       px-4 py-3 shadow-sm"
            >

                <p
                    class="whitespace-pre-line
                           text-sm leading-6
                           text-gray-700"
                >
                    ${escapeHTML(message)}
                </p>

            </div>

        `;


        messages.appendChild(
            messageElement
        );


        scrollToBottom();

    }


    function addAIErrorMessage(message, retryMessage, retryCallback) {

        const messages =
            document.getElementById(
                "aiMessages"
            );

        if (!messages) return;


        const messageElement =
            document.createElement("div");


        messageElement.className =
            "mb-4 flex items-start gap-2";


        let buttonHTML = "";

        if (retryMessage && retryCallback) {

            buttonHTML = `

                <button
                    type="button"
                    class="ai-retry-button mt-2
                           rounded-lg border
                           border-gray-200 bg-white
                           px-3 py-1.5 text-xs
                           text-gray-600 transition
                           hover:border-[#a8dadc]
                           hover:text-[#a8dadc]"
                >
                    ${escapeHTML(retryMessage)}
                </button>

            `;

        }


        messageElement.innerHTML = `

            <div
                class="flex h-8 w-8 shrink-0
                       items-center justify-center
                       rounded-xl bg-white
                       text-lg shadow-sm"
            >
                🤖
            </div>


            <div
                class="max-w-[82%] rounded-2xl
                       rounded-tl-md bg-white
                       px-4 py-3 shadow-sm"
            >

                <p
                    class="whitespace-pre-line
                           text-sm leading-6
                           text-gray-700"
                >
                    ${escapeHTML(message)}
                </p>

                ${buttonHTML}

            </div>

        `;


        messages.appendChild(
            messageElement
        );


        scrollToBottom();


        if (buttonHTML && retryCallback) {

            const button =
                messageElement.querySelector(
                    ".ai-retry-button"
                );


            if (button) {

                button.addEventListener(
                    "click",
                    retryCallback
                );

            }

        }

    }


    // ========================================
    // Loading Message
    // ========================================

    function addLoadingMessage() {

        const messages =
            document.getElementById(
                "aiMessages"
            );

        if (!messages) return;


        const loading =
            document.createElement("div");


        loading.id =
            "aiLoadingMessage";


        loading.className =
            "mb-4 flex items-start gap-2";


        loading.innerHTML = `

            <div
                class="flex h-8 w-8 shrink-0
                       items-center justify-center
                       rounded-xl bg-white
                       text-lg shadow-sm"
            >
                🤖
            </div>


            <div
                class="rounded-2xl rounded-tl-md
                       bg-white px-4 py-3
                       shadow-sm"
            >

                <div class="flex gap-1">

                    <span
                        class="h-2 w-2 animate-bounce
                               rounded-full bg-gray-400"
                    ></span>

                    <span
                        class="h-2 w-2 animate-bounce
                               rounded-full bg-gray-400"
                        style="animation-delay:150ms"
                    ></span>

                    <span
                        class="h-2 w-2 animate-bounce
                               rounded-full bg-gray-400"
                        style="animation-delay:300ms"
                    ></span>

                </div>

            </div>

        `;


        messages.appendChild(
            loading
        );


        scrollToBottom();

    }


    // ========================================
    // Remove Loading
    // ========================================

    function removeLoadingMessage() {

        const loading =
            document.getElementById(
                "aiLoadingMessage"
            );

        if (loading) {

            loading.remove();

        }

    }


    // ========================================
    // Send Message
    // ========================================

    async function sendMessage(message) {

        if (
            isSending ||
            !message ||
            !message.trim()
        ) {
            return;
        }


        const token =
            getAuthToken();


        if (!token) {

            addAIMessage(
                "Please login first to use the EventEase AI Assistant."
            );

            return;

        }


        isSending = true;


        lastUserMessage =
            message.trim();


        const input =
            document.getElementById(
                "aiMessageInput"
            );

        const sendButton =
            document.getElementById(
                "aiSendButton"
            );


        if (input) {

            input.value = "";

        }


        if (sendButton) {

            sendButton.disabled = true;

        }


        addUserMessage(
            message.trim()
        );


        addLoadingMessage();


        try {

            console.log(
                "AI API URL:",
                API_URL
            );

            console.log(
                "AI token exists:",
                !!token
            );

            console.log(
                "AI message:",
                message.trim()
            );


            const response =
                await fetch(
                    API_URL,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`,

                        },

                        body: JSON.stringify({

                            message:
                                message.trim(),

                        }),

                    }
                );


            console.log(
                "AI response status:",
                response.status
            );

            console.log(
                "AI response ok:",
                response.ok
            );


            let result;


            try {

                result =
                    await response.json();

            } catch {

                removeLoadingMessage();

                addAIMessage(
                    "Server returned an unexpected response. Please try again."
                );

                return;

            }


            removeLoadingMessage();

            if (!response.ok) {

                const status =
                    response.status;

                let errorMessage =
                    sanitizeErrorMessage(
                        result?.message
                    ) ||
                    "Failed to get AI response.";


                if (status === 401) {

                    errorMessage =
                        "Your session has expired. Please login again.";

                } else if (status === 403) {

                    errorMessage =
                        sanitizeErrorMessage(
                            result?.message
                        ) ||
                        "Access denied.";

                } else if (status === 429) {

                    errorMessage =
                        "The AI service is temporarily unavailable because the request limit has been reached. Please try again later.";

                } else if (status === 503) {

                    errorMessage =
                        "Sorry, the AI service is temporarily busy right now. Please try again in a moment.";

                } else if (status >= 500) {

                    errorMessage =
                        sanitizeErrorMessage(
                            result?.message
                        ) ||
                        "Sorry, something went wrong while processing your request. Please try again.";

                }


                console.error(
                    "EventEase AI Error:",
                    `Status ${status}:`,
                    errorMessage
                );


                if (status === 503) {

                    addAIErrorMessage(
                        errorMessage,
                        "Try Again",
                        () => sendMessage(
                            lastUserMessage
                        )
                    );

                } else {

                    addAIMessage(
                        errorMessage
                    );

                }

                return;

            }


            const reply =
                result?.data?.reply;


            if (!reply) {

                console.error(
                    "EventEase AI Error:",
                    "Backend returned success but reply is missing.",
                    "Full response:",
                    result
                );

                addAIMessage(
                    "AI returned an empty response. Please try again."
                );

                return;

            }


            addAIMessage(reply);

        }
        catch (error) {

            removeLoadingMessage();


            console.error(
                "EventEase AI Error:",
                error
            );


            let errorMessage =
                "Sorry, I couldn't process your request right now. Please try again.";


            if (
                error instanceof TypeError &&
                error.message ===
                    "Failed to fetch"
            ) {

                errorMessage =
                    "Unable to connect to the AI service. Please check your connection and try again.";

            }


            addAIMessage(
                errorMessage
            );

        }
        finally {

            isSending = false;


            if (sendButton) {

                sendButton.disabled = false;

            }


            if (input) {

                input.focus();

            }

        }

    }


    // ========================================
    // Open Chat
    // ========================================

    function openChat() {

        const windowElement =
            document.getElementById(
                "aiChatWindow"
            );

        if (!windowElement) return;


        windowElement.classList.remove(
            "hidden"
        );

        isOpen = true;


        const input =
            document.getElementById(
                "aiMessageInput"
            );

        if (input) {

            setTimeout(() => {
                input.focus();
            }, 100);

        }

    }


    // ========================================
    // Close Chat
    // ========================================

    function closeChat() {

        const windowElement =
            document.getElementById(
                "aiChatWindow"
            );

        if (!windowElement) return;


        windowElement.classList.add(
            "hidden"
        );

        isOpen = false;

    }


    // ========================================
    // Initialize Chatbot Events
    // ========================================

    function initializeChatbot() {

        const botButton =
            document.getElementById(
                "aiBotButton"
            );

        const closeButton =
            document.getElementById(
                "aiCloseButton"
            );

        const minimizeButton =
            document.getElementById(
                "aiMinimizeButton"
            );

        const form =
            document.getElementById(
                "aiChatForm"
            );


        // Open

        if (botButton) {

            botButton.addEventListener(
                "click",
                openChat
            );

        }


        // Close

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeChat
            );

        }


        // Minimize

        if (minimizeButton) {

            minimizeButton.addEventListener(
                "click",
                closeChat
            );

        }


        // Send Form

        if (form) {

            form.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();


                    const input =
                        document.getElementById(
                            "aiMessageInput"
                        );


                    if (!input) return;


                    sendMessage(
                        input.value
                    );

                }
            );

        }


        // Suggested Questions

        document
            .querySelectorAll(
                ".ai-suggestion"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        sendMessage(
                            this.textContent
                                .trim()
                                .replace(
                                    /^[^\w]+/,
                                    ""
                                )
                        );

                    }
                );

            });

    }


    // ========================================
    // Create Chatbot HTML
    // ========================================

    function createChatbot() {

        if (document.getElementById("eventease-ai-chatbot")) {
            return;
        }


        const chatbotContainer =
            document.createElement("div");

        chatbotContainer.id =
            "eventease-ai-chatbot";


        chatbotContainer.innerHTML = `

            <!-- ======================================== -->
            <!-- AI CHAT WINDOW -->
            <!-- ======================================== -->

            <div
                id="aiChatWindow"
                class="fixed bottom-24 right-5 z-[10000] hidden
                       w-[calc(100vw-2rem)] max-w-[390px]
                       overflow-hidden rounded-3xl bg-white
                       shadow-2xl ring-1 ring-gray-200
                       sm:right-6"
            >

                <!-- ======================================== -->
                <!-- HEADER -->
                <!-- ======================================== -->

                <div
                    class="flex items-center justify-between
                           px-5 py-4 text-white"
                    style="background-color:#a8dadc;"
                >

                    <div class="flex items-center gap-3">

                        <!-- Bot Icon -->

                        <div
                            class="flex h-11 w-11 items-center
                                   justify-center rounded-2xl
                                   bg-white/20 text-2xl"
                        >
                            🤖
                        </div>


                        <!-- Title -->

                        <div>

                            <h3
                                class="text-sm font-bold"
                            >
                                EventEase AI Assistant
                            </h3>

                            <p
                                class="mt-0.5 text-xs text-white/90"
                            >
                                Your smart event companion
                            </p>

                        </div>

                    </div>


                    <!-- Controls -->

                    <div class="flex items-center gap-1">

                        <!-- Minimize -->

                        <button
                            id="aiMinimizeButton"
                            type="button"
                            class="flex h-9 w-9 items-center
                                   justify-center rounded-xl
                                   text-lg transition
                                   hover:bg-black/10"
                            title="Minimize"
                        >
                            -
                        </button>


                        <!-- Close -->

                        <button
                            id="aiCloseButton"
                            type="button"
                            class="flex h-9 w-9 items-center
                                   justify-center rounded-xl
                                   text-xl transition
                                   hover:bg-black/10"
                            title="Close"
                        >
                            ×
                        </button>

                    </div>

                </div>


                <!-- ======================================== -->
                <!-- CHAT MESSAGES -->
                <!-- ======================================== -->

                <div
                    id="aiMessages"
                    class="h-[380px] overflow-y-auto
                           bg-gray-50 p-4"
                >

                    <!-- Welcome Message -->

                    <div
                        class="mb-4 flex items-start gap-2"
                    >

                        <div
                            class="flex h-8 w-8 shrink-0
                                   items-center justify-center
                                   rounded-xl bg-white
                                   text-lg shadow-sm"
                        >
                            🤖
                        </div>


                        <div
                            class="max-w-[82%] rounded-2xl
                                   rounded-tl-md bg-white
                                   px-4 py-3 shadow-sm"
                        >

                            <p
                                class="text-sm leading-6
                                       text-gray-700"
                            >
                                Hello! I'm EventEase AI Assistant.
                                How can I help you today?
                            </p>

                        </div>

                    </div>


                    <!-- Suggested Questions -->

                    <div
                        id="aiSuggestions"
                        class="ml-10 space-y-2"
                    >

                        <button
                            type="button"
                            class="ai-suggestion w-full rounded-xl
                                   border border-gray-200
                                   bg-white px-3 py-2.5
                                   text-left text-xs
                                   text-gray-600 transition
                                   hover:border-[#a8dadc]
                                   hover:text-[#a8dadc]"
                        >
                            🎵 Show me upcoming music events
                        </button>


                        <button
                            type="button"
                            class="ai-suggestion w-full rounded-xl
                                   border border-gray-200
                                   bg-white px-3 py-2.5
                                   text-left text-xs
                                   text-gray-600 transition
                                   hover:border-[#a8dadc]
                                   hover:text-[#a8dadc]"
                        >
                            📅 What events are coming soon?
                        </button>


                        <button
                            type="button"
                            class="ai-suggestion w-full rounded-xl
                                   border border-gray-200
                                   bg-white px-3 py-2.5
                                   text-left text-xs
                                   text-gray-600 transition
                                   hover:border-[#a8dadc]
                                   hover:text-[#a8dadc]"
                        >
                            🎟️ How can I book an event?
                        </button>

                    </div>

                </div>


                <!-- ======================================== -->
                <!-- INPUT AREA -->
                <!-- ======================================== -->

                <div
                    class="border-t border-gray-200
                           bg-white p-4"
                >

                    <form
                        id="aiChatForm"
                        class="flex items-center gap-2"
                    >

                        <input
                            id="aiMessageInput"
                            type="text"
                            autocomplete="off"
                            placeholder="Ask something about events..."
                            class="min-w-0 flex-1 rounded-xl
                                   border border-gray-200
                                   bg-gray-50 px-4 py-3
                                   text-sm text-gray-800
                                   outline-none transition
                                   focus:border-[#a8dadc]
                                   focus:bg-white
                                   focus:ring-2
                                   focus:ring-[#a8dadc]/10"
                        >


                        <button
                            id="aiSendButton"
                            type="submit"
                            class="flex h-11 w-11 shrink-0
                                   items-center justify-center
                                   rounded-xl text-xl
                                   text-white transition
                                   hover:opacity-90
                                   disabled:cursor-not-allowed
                                   disabled:opacity-50"
                            style="background-color:#a8dadc;"
                            title="Send message"
                        >
                            ➤
                        </button>

                    </form>


                    <p
                        class="mt-3 text-center text-[11px]
                               text-gray-400"
                    >
                        Powered by  AI ✨
                    </p>

                </div>

            </div>


            <!-- ======================================== -->
            <!-- FLOATING BOT BUTTON -->
            <!-- ======================================== -->

            <button
                id="aiBotButton"
                type="button"
                class="fixed bottom-12 right-5 z-[9999]
                       flex h-12 w-12 items-center
                       justify-center rounded-full
                       text-3xl text-white
                       shadow-xl ring-4 ring-white
                       transition duration-200
                       hover:scale-105 hover:shadow-2xl
                       sm:right-6"
                style="background-color:#a8dadc;"
                title="Open EventEase AI Assistant"
                aria-label="Open EventEase AI Assistant"
            >
                🤖
            </button>

        `;


        document.body.appendChild(
            chatbotContainer
        );


        initializeChatbot();


        const botButton =
            document.getElementById("aiBotButton");


        if (!botButton) {

            console.error(
                "EventEase AI Chatbot: Failed to create floating bot button."
            );

        }

    }


    // ========================================
    // Start
    // ========================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            createChatbot
        );

    }
    else {

        createChatbot();

    }


    console.log(
        "EventEase AI Chatbot initialized"
    );

})();
