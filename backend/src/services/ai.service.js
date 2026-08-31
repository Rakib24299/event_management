// ========================================
// EventEase AI Service
// Google Gemini API
// ========================================

const { GoogleGenAI } = require("@google/genai");

const AppError =
    require("../utils/AppError");

// ========================================
// Gemini Client
// ========================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// ========================================
// Generate AI Response
// ========================================

const generateAIResponse = async (userMessage) => {

    // Validate message
    if (
        !userMessage ||
        typeof userMessage !== "string" ||
        !userMessage.trim()
    ) {
        throw new Error("Message is required.");
    }


    // ========================================
    // Gemini Request
    // ========================================

    try {

        const response =
            await ai.models.generateContent({

                // model: "gemini-3.7-flash",
                model: 'gemini-3.1-flash-lite', // Model name updated

                contents: userMessage.trim(),

                config: {

                    systemInstruction: `
You are EventEase AI Assistant.

EventEase is an Event Management System.

Your job is to help users with:

- Events
- Event categories
- Event bookings
- Event information
- General EventEase questions

Keep your answers simple, friendly, and concise.

Do not invent specific EventEase event information
if that information has not been provided to you.

If the user asks something unrelated to EventEase,
you can still answer briefly and politely.
                    `,

                    temperature: 0.7,

                    maxOutputTokens: 500,

                },

            });


        // ========================================
        // Get Gemini Text Response
        // ========================================

        const reply =
            response.text;


        if (!reply) {

            throw new AppError(
                "Gemini returned an empty response.",
                500
            );

        }


        return reply;

    } catch (error) {

        console.error(
            "Gemini API Error:",
            error
        );


        // ========================================
        // Extract status code from error
        // ========================================

        let rawStatus = null;

        // Check if error.message is JSON string
        if (
            error.message &&
            typeof error.message === "string"
        ) {

            try {

                const parsed =
                    JSON.parse(
                        error.message
                    );

                if (
                    parsed &&
                    parsed.error
                ) {

                    rawStatus =
                        parsed.error.code ||
                        parsed.error.status;

                }

            } catch {

                // Not JSON, ignore

            }

        }


        // Check error object properties

        if (!rawStatus) {

            rawStatus =
                error.status ||
                error.statusCode ||
                error.code ||
                error.response?.status;

        }


        // Check nested response data

        if (
            !rawStatus &&
            error.response?.data?.error
        ) {

            rawStatus =
                error.response.data.error.code ||
                error.response.data.error.status;

        }


        const statusNum =
            rawStatus !== null &&
            rawStatus !== undefined
                ? Number(rawStatus)
                : null;

        const isUnavailable =
            typeof rawStatus === "string" &&
            rawStatus === "UNAVAILABLE";


        // ========================================
        // Map to friendly message
        // ========================================

        let friendlyMessage =
            "Sorry, something went wrong while processing your request. Please try again.";

        let statusCode = 500;

        if (
            statusNum === 503 ||
            isUnavailable
        ) {

            statusCode = 503;

            friendlyMessage =
                "Sorry, the AI service is temporarily busy right now. Please try again in a moment.";

        } else if (statusNum === 429) {

            statusCode = 429;

            friendlyMessage =
                "The AI service is temporarily unavailable because the request limit has been reached. Please try again later.";

        } else if (
            statusNum === 401 ||
            statusNum === 403
        ) {

            statusCode = statusNum;

            friendlyMessage =
                "There is an AI authentication/configuration problem. Please contact the administrator.";

        } else if (statusNum === 400) {

            statusCode = 400;

            friendlyMessage =
                "Sorry, I couldn't understand that request. Please try asking in a different way.";

        } else if (
            statusNum !== null &&
            statusNum >= 500
        ) {

            statusCode = statusNum;

            friendlyMessage =
                "Sorry, the AI service is temporarily unavailable. Please try again later.";

        } else if (statusNum === null) {

            statusCode = 503;

            friendlyMessage =
                "Unable to connect to the AI service. Please check your connection and try again.";

        }


        throw new AppError(
            friendlyMessage,
            statusCode
        );

    }

};


// ========================================
// Export
// ========================================

module.exports = {

    generateAIResponse,

};
