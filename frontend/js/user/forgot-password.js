// EventEase
// Forgot Password

const API_BASE_URL = "http://localhost:5000/api/v1";


// DOM Elements

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const emailInput =
    document.getElementById("email");

const sendOtpButton =
    document.getElementById("sendOtpButton");

const message =
    document.getElementById("message");


// Show Message

function showMessage(text, type = "error") {

    message.textContent = text;

    message.classList.remove(
        "hidden",
        "bg-red-50",
        "text-red-600",
        "border-red-200",
        "bg-green-50",
        "text-green-600",
        "border-green-200"
    );


    if (type === "success") {

        message.classList.add(
            "bg-green-50",
            "text-green-600",
            "border",
            "border-green-200"
        );

    } else {

        message.classList.add(
            "bg-red-50",
            "text-red-600",
            "border",
            "border-red-200"
        );

    }

}


// Send Forgot Password OTP

forgotPasswordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            emailInput.value.trim().toLowerCase();


        // Basic Validation

        if (!email) {

            showMessage(
                "Please enter your email address.",
                "error"
            );

            return;

        }


        // Loading State

        sendOtpButton.disabled = true;

        sendOtpButton.textContent =
            "Sending OTP...";


        try {

            console.log(
                "Sending forgot password OTP to:",
                email
            );


            // API Request

            const response =
                await fetch(
                    `${API_BASE_URL}/auth/forgot-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            email: email,
                        }),
                    }
                );


            // Read Response

            let data = null;


            try {

                data = await response.json();

            } catch (error) {

                data = null;

            }


            console.log(
                "Forgot password response:",
                data
            );


            // Error

            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Unable to send OTP."
                );

            }


            // Save Email

            /*
             * Verify page will use this email.
             *
             * Example:
             * rakib@gmail.com
             */

            sessionStorage.setItem(
                "forgotPasswordEmail",
                email
            );


            // Success Message

            showMessage(
                data?.message ||
                "Password reset OTP has been sent to your email.",
                "success"
            );


            // Redirect to Verify OTP Page

            setTimeout(() => {

                window.location.href =
                    "./verify-forgot-otp.html";

            }, 1000);


        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );


            showMessage(
                error.message ||
                "Something went wrong. Please try again.",
                "error"
            );


        } finally {

            sendOtpButton.disabled = false;

            sendOtpButton.textContent =
                "Send OTP";

        }

    }
);