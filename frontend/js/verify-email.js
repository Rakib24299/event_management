// ========================================
// EventEase Email Verification
// ========================================

const API_URL = "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const verifyForm =
    document.getElementById("verifyForm");

const otpInput =
    document.getElementById("otp");

const verifyButton =
    document.getElementById("verifyButton");

const resendButton =
    document.getElementById("resendButton");

const emailDisplay =
    document.getElementById("emailDisplay");

const verifyError =
    document.getElementById("verifyError");

const verifySuccess =
    document.getElementById("verifySuccess");

const resendTimer =
    document.getElementById("resendTimer");

const countdown =
    document.getElementById("countdown");


// ========================================
// Get Email From URL
// ========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const email =
    urlParams.get("email");


// ========================================
// Check Email
// ========================================

if (!email) {

    showError(
        "Email address is missing. Please register again."
    );

} else {

    emailDisplay.textContent = email;

}


// ========================================
// Show Error
// ========================================

function showError(message) {

    verifySuccess.classList.add("hidden");

    verifyError.textContent = message;

    verifyError.classList.remove("hidden");

}


// ========================================
// Show Success
// ========================================

function showSuccess(message) {

    verifyError.classList.add("hidden");

    verifySuccess.textContent = message;

    verifySuccess.classList.remove("hidden");

}


// ========================================
// OTP Input
// Only numbers
// ========================================

otpInput.addEventListener(
    "input",
    () => {

        otpInput.value =
            otpInput.value
                .replace(/\D/g, "")
                .slice(0, 6);

    }
);


// ========================================
// Verify Email
// ========================================

verifyForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        verifyError.classList.add("hidden");

        verifySuccess.classList.add("hidden");


        const otp =
            otpInput.value.trim();


        // ====================================
        // Validate OTP
        // ====================================

        if (!email) {

            showError(
                "Email address is missing."
            );

            return;

        }


        if (!/^\d{6}$/.test(otp)) {

            showError(
                "Please enter a valid 6-digit OTP."
            );

            return;

        }


        // ====================================
        // Loading
        // ====================================

        verifyButton.disabled = true;

        verifyButton.textContent =
            "Verifying...";


        try {

            // ====================================
            // API Request
            // ====================================

            const response =
                await fetch(
                    `${API_URL}/auth/verify-email`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                email: email,

                                otp: otp

                            })

                    }
                );


            const result =
                await response.json();


            console.log(
                "Verification Response:",
                result
            );


            // ====================================
            // Error
            // ====================================

            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Email verification failed."
                );

            }


            // ====================================
            // Success
            // ====================================

            showSuccess(
                result.message ||
                "Email verified successfully."
            );


            verifyButton.textContent =
                "Email Verified";


            // ====================================
            // Redirect Login
            // ====================================

            setTimeout(() => {

                window.location.href =
                    "./login.html";

            }, 1500);


        } catch (error) {

            console.error(
                "Verification Error:",
                error
            );


            showError(
                error.message ||
                "Something went wrong. Please try again."
            );


            verifyButton.disabled = false;

            verifyButton.textContent =
                "Verify Email";

        }

    }
);


// ========================================
// Resend Verification OTP
// ========================================

resendButton.addEventListener(
    "click",
    async () => {

        if (!email) {

            showError(
                "Email address is missing."
            );

            return;

        }


        verifyError.classList.add("hidden");

        verifySuccess.classList.add("hidden");


        resendButton.disabled = true;

        resendButton.textContent =
            "Sending...";


        try {

            // ====================================
            // API Request
            // ====================================

            const response =
                await fetch(
                    `${API_URL}/auth/resend-verification-otp`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                email: email

                            })

                    }
                );


            const result =
                await response.json();


            console.log(
                "Resend OTP Response:",
                result
            );


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Failed to resend verification code."
                );

            }


            // ====================================
            // Success
            // ====================================

            showSuccess(
                result.message ||
                "A new verification code has been sent."
            );


            // ====================================
            // Start Timer
            // ====================================

            startResendTimer();


        } catch (error) {

            console.error(
                "Resend OTP Error:",
                error
            );


            showError(
                error.message ||
                "Unable to resend verification code."
            );


            resendButton.disabled = false;

            resendButton.textContent =
                "Resend Verification Code";

        }

    }
);


// ========================================
// Resend Timer
// ========================================

let timer = null;


function startResendTimer() {

    let seconds = 60;


    resendButton.disabled = true;

    resendButton.classList.add(
        "cursor-not-allowed",
        "opacity-50"
    );

    resendButton.textContent =
        "Code Sent";


    resendTimer.classList.remove(
        "hidden"
    );


    countdown.textContent =
        seconds;


    clearInterval(timer);


    timer = setInterval(() => {

        seconds--;


        countdown.textContent =
            seconds;


        if (seconds <= 0) {

            clearInterval(timer);


            resendButton.disabled = false;

            resendButton.classList.remove(
                "cursor-not-allowed",
                "opacity-50"
            );

            resendButton.textContent =
                "Resend Verification Code";


            resendTimer.classList.add(
                "hidden"
            );

        }

    }, 1000);

}