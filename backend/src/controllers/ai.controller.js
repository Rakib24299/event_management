// ========================================
// EventEase AI Controller
// ========================================

const aiService =
    require("../services/ai.service");

const catchAsync =
    require("../utils/catchAsync");


// ========================================
// AI Chat
// ========================================

const chatWithAI =
    catchAsync(
        async (req, res) => {

            const {
                message
            } = req.body;


            // ========================================
            // Validate Message
            // ========================================

            if (
                !message ||
                typeof message !== "string" ||
                !message.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Message is required.",

                });

            }


            // ========================================
            // Generate AI Response
            // ========================================

            const reply =
                await aiService.generateAIResponse(
                    message
                );


            // ========================================
            // Response
            // ========================================

            return res.status(200).json({

                success: true,

                message:
                    "AI response generated successfully.",

                data: {

                    reply,

                },

            });

        }
    );


module.exports = {

    chatWithAI,

};