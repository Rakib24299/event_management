// Organizer Forgot Password

const API_BASE_URL = "http://localhost:5000/api/v1";


// Elements

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const emailInput =
    document.getElementById("email");

const sendOtpButton =
    document.getElementById("sendOtpButton");

const messageBox =
    document.getElementById("message");


// Show Message

function showMessage(message, type = "error") {

    messageBox.textContent = message;

    messageBox.classList.remove(
        "hidden",
        "border",
        "border-red-200",
        "bg-red-50",
        "text-red-600",
        "border-green-200",
        "bg-green-50",
        "text-green-700"
    );

    if (type === "success") {

        messageBox.classList.add(
            "border",
            "border-green-200",
            "bg-green-50",
            "text-green-700"
        );

    } else {

        messageBox.classList.add(
            "border",
            "border-red-200",
            "bg-red-50",
            "text-red-600"
        );
    }
}


// Forgot Password Submit

forgotPasswordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            emailInput.value.trim().toLowerCase();


        // Validate Email

        if (!email) {

            showMessage(
                "Please enter your organizer email address."
            );

            return;
        }


        // Disable Button

        sendOtpButton.disabled = true;

        sendOtpButton.textContent =
            "Sending OTP...";


        try {

            // API Request

            const response = await fetch(
                `${API_BASE_URL}/auth/forgot-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email
                    })
                }
            );


            // Read Response Safely

            const contentType =
                response.headers.get("content-type") || "";

            let data = {};

            if (contentType.includes("application/json")) {

                data = await response.json();

            } else {

                const text =
                    await response.text();

                console.error(
                    "Server returned non-JSON response:",
                    text
                );

                throw new Error(
                    `Server returned ${response.status} ${response.statusText}.`
                );
            }


            // Backend Error

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to send password reset OTP."
                );
            }


            // IMPORTANT
            // Save Organizer Email

            sessionStorage.setItem(
                "forgotPasswordEmail",
                email
            );


            // Success Message

            showMessage(
                data.message ||
                "Password reset OTP has been sent to your email.",
                "success"
            );


            // Redirect

            setTimeout(() => {

                window.location.href =
                    "./verify-forgot-otp.html";

            }, 500);


        } catch (error) {

            console.error(
                "Organizer forgot password error:",
                error
            );


            showMessage(
                error.message ||
                "Something went wrong. Please try again."
            );


        } finally {

            sendOtpButton.disabled = false;

            sendOtpButton.textContent =
                "Send OTP";
        }

    }
);