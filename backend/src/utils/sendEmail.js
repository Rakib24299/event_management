const axios = require("axios");

// SEND EMAIL SYSTEM

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.EMAIL_FROM_NAME || "EventEase",
          email: process.env.EMAIL_FROM,
        },

        to: [
          {
            email: to,
          },
        ],

        subject,

        htmlContent:
          html ||
          `<p>${text}</p>`,

        textContent: text,
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
      }
    );

    console.log("✅ Email sent successfully.");

    return response.data;
  } catch (error) {
    console.error(
      "❌ Brevo Email Error:",
      error.response?.data || error.message
    );

    throw new Error("Failed to send email.");
  }
};

module.exports = sendEmail;