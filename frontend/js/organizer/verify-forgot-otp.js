// Organizer Verify Forgot Password OTP

const API_BASE_URL = "http://localhost:5000/api/v1";


// Elements

const emailInput =
    document.getElementById("email");

const otpInput =
    document.getElementById("otp");

const newPasswordInput =
    document.getElementById("newPassword");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const resetPasswordButton =
    document.getElementById("resetPasswordButton");

const errorBox =
    document.getElementById("verifyOtpError");

const successBox =
    document.getElementById("verifyOtpSuccess");


// Get Email From Session Storage

const email =
    sessionStorage.getItem("forgotPasswordEmail");


// Show Error

function showError(message) {

    errorBox.textContent = message;

    errorBox.classList.remove("hidden");

    successBox.classList.add("hidden");
}


// Show Success

function showSuccess(message) {

    successBox.textContent = message;

    successBox.classList.remove("hidden");

    errorBox.classList.add("hidden");
}


// Load Email

if (!email) {

    showError(
        "Email address not found. Please request a new password reset OTP."
    );

    resetPasswordButton.disabled = true;

} else {

    emailInput.value = email;

}


// OTP Input
// Only Numbers

otpInput.addEventListener(
    "input",
    () => {

        otpInput.value =
            otpInput.value
                .replace(/\D/g, "")
                .slice(0, 6);
    }
);


// Reset Password

resetPasswordButton.addEventListener(
    "click",
    async () => {

        // Check Email

        if (!email) {

            showError(
                "Email address not found. Please request a new password reset OTP."
            );

            return;
        }


        // Get Values

        const otp =
            otpInput.value.trim();

        const newPassword =
            newPasswordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        // Validate OTP

        if (!otp) {

            showError(
                "Please enter the OTP sent to your email."
            );

            otpInput.focus();

            return;
        }


        if (!/^\d{6}$/.test(otp)) {

            showError(
                "OTP must be exactly 6 digits."
            );

            otpInput.focus();

            return;
        }


        // Validate Password

        if (!newPassword) {

            showError(
                "Please enter your new password."
            );

            newPasswordInput.focus();

            return;
        }


        if (newPassword.length < 6) {

            showError(
                "Password must be at least 6 characters long."
            );

            newPasswordInput.focus();

            return;
        }


        // Confirm Password

        if (!confirmPassword) {

            showError(
                "Please confirm your new password."
            );

            confirmPasswordInput.focus();

            return;
        }


        if (newPassword !== confirmPassword) {

            showError(
                "Passwords do not match."
            );

            confirmPasswordInput.focus();

            return;
        }


        // Disable Button

        resetPasswordButton.disabled = true;

        resetPasswordButton.textContent =
            "Resetting Password...";


        try {

            // Reset Password API

            const response = await fetch(
                `${API_BASE_URL}/auth/reset-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        otp: otp,
                        newPassword: newPassword
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
                    "Failed to reset password."
                );
            }


            // Success

            showSuccess(
                data.message ||
                "Password reset successful. Redirecting to login..."
            );


            // Remove Stored Email

            sessionStorage.removeItem(
                "forgotPasswordEmail"
            );


            // Go Organizer Login

            setTimeout(() => {

                window.location.href =
                    "./organizer-login.html";

            }, 1200);


        } catch (error) {

            console.error(
                "Organizer reset password error:",
                error
            );


            showError(
                error.message ||
                "Something went wrong. Please try again."
            );


        } finally {

            resetPasswordButton.disabled = false;

            resetPasswordButton.textContent =
                "Reset Password";
        }

    }
);