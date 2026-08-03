require("dotenv").config();
const nodemailer = require("nodemailer");

async function test() {
  const configs = [
    {
      name: "Port 587 TLS",
      transport: {
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.BREVO_API_KEY,
        },
      },
    },
    {
      name: "Port 465 SSL",
      transport: {
        host: "smtp-relay.brevo.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.BREVO_API_KEY,
        },
      },
    },
    {
      name: "Port 587 TLS with account email",
      transport: {
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
          user: "thomasedison24299@gmail.com",
          pass: process.env.BREVO_API_KEY,
        },
      },
    },
  ];

  for (const config of configs) {
    console.log(`\nTesting ${config.name}...`);
    try {
      const transporter = nodemailer.createTransport(config.transport);
      const info = await transporter.sendMail({
        from: `"EventEase" <${process.env.EMAIL_FROM}>`,
        to: "22303004@iubat.edu",
        subject: "Test Brevo SMTP",
        text: "This is a test email.",
      });
      console.log("Success:", info.response);
      return;
    } catch (err) {
      console.error("Error:", err.message);
    }
  }
}

test().then(() => process.exit(0)).catch(() => process.exit(1));
