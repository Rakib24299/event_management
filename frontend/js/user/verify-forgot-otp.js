// ======================================================
// EventEase
// Verify Forgot Password OTP
// ======================================================

const API_BASE_URL = "http://localhost:5000/api/v1";


// ======================================================
// DOM Elements
// ======================================================

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

const verifyOtpError =
    document.getElementById("verifyOtpError");

const verifyOtpSuccess =
    document.getElementById("verifyOtpSuccess");


// ======================================================
// Check JS Loaded
// ======================================================

console.log(
    "Verify Forgot OTP JS loaded successfully."
);


// ======================================================
// Get Email From Session Storage
// ======================================================

const forgotPasswordEmail =
    sessionStorage.getItem(
        "forgotPasswordEmail"
    );


console.log(
    "Forgot Password Email:",
    forgotPasswordEmail
);


// ======================================================
// If Email Not Found
// ======================================================

if (!forgotPasswordEmail) {

    showError(
        "Email information is missing. Please request a new OTP."
    );

} else {

    emailInput.value =
        forgotPasswordEmail;

}


// ======================================================
// Show Error
// ======================================================

function showError(message) {

    verifyOtpError.textContent =
        message;

    verifyOtpError.classList.remove(
        "hidden"
    );

    verifyOtpSuccess.classList.add(
        "hidden"
    );

}


// ======================================================
// Show Success
// ======================================================

function showSuccess(message) {

    verifyOtpSuccess.textContent =
        message;

    verifyOtpSuccess.classList.remove(
        "hidden"
    );

    verifyOtpError.classList.add(
        "hidden"
    );

}


// ======================================================
// Reset Password
// ======================================================

resetPasswordButton.addEventListener(
    "click",
    async function () {

        // ----------------------------------------------
        // Clear Previous Messages
        // ----------------------------------------------

        verifyOtpError.classList.add(
            "hidden"
        );

        verifyOtpSuccess.classList.add(
            "hidden"
        );


        // ----------------------------------------------
        // Get Values
        // ----------------------------------------------

        const email =
            emailInput.value.trim().toLowerCase();

        const otp =
            otpInput.value.trim();

        const newPassword =
            newPasswordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        console.log("Reset Password Request:", {
            email,
            otp
        });


        // ----------------------------------------------
        // Validate Email
        // ----------------------------------------------

        if (!email) {

            showError(
                "Email address is required."
            );

            return;

        }


        // ----------------------------------------------
        // Validate OTP
        // ----------------------------------------------

        if (!/^\d{6}$/.test(otp)) {

            showError(
                "OTP must be exactly 6 digits."
            );

            return;

        }


        // ----------------------------------------------
        // Validate Password
        // ----------------------------------------------

        if (!newPassword) {

            showError(
                "Please enter your new password."
            );

            return;

        }


        if (newPassword.length < 8) {

            showError(
                "Password must be at least 8 characters."
            );

            return;

        }


        // ----------------------------------------------
        // Confirm Password
        // ----------------------------------------------

        if (newPassword !== confirmPassword) {

            showError(
                "Passwords do not match."
            );

            return;

        }


        // ----------------------------------------------
        // Loading
        // ----------------------------------------------

        resetPasswordButton.disabled =
            true;

        resetPasswordButton.textContent =
            "Resetting Password...";


        try {

            console.log(
                "Sending reset password request..."
            );


            // ------------------------------------------
            // API Request
            // ------------------------------------------

            const response =
                await fetch(
                    `${API_BASE_URL}/auth/reset-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email: email,

                            otp: otp,

                            newPassword:
                                newPassword

                        })
                    }
                );


            console.log(
                "Reset Password Response Status:",
                response.status
            );


            // ------------------------------------------
            // Read Response
            // ------------------------------------------

            let data = null;

            try {

                data =
                    await response.json();

            } catch (error) {

                data = null;

            }


            console.log(
                "Reset Password Response:",
                data
            );


            // ------------------------------------------
            // API Error
            // ------------------------------------------

            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Unable to reset password."
                );

            }


            // ------------------------------------------
            // Success
            // ------------------------------------------

            showSuccess(
                data?.message ||
                "Password has been reset successfully."
            );


            // ------------------------------------------
            // Remove Stored Email
            // ------------------------------------------

            sessionStorage.removeItem(
                "forgotPasswordEmail"
            );


            // ------------------------------------------
            // Redirect To Login
            // ------------------------------------------

            console.log(
                "Password reset successful."
            );

            console.log(
                "Redirecting to user-login.html..."
            );


            setTimeout(function () {

                window.location.href =
                    "./user-login.html";

            }, 1500);


        } catch (error) {

            console.error(
                "Reset Password Error:",
                error
            );


            showError(
                error.message ||
                "Unable to reset password."
            );


        } finally {

            resetPasswordButton.disabled =
                false;

            resetPasswordButton.textContent =
                "Reset Password";

        }

    }
);