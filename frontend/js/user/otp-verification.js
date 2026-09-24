"use strict";


// EventEase OTP Verification
//
// FLOW:
//
// payment.html
//      ↓
// Continue to Payment
//      ↓
// Create Booking
//      ↓
// Dummy Payment
//      ↓
// otp-verification.html
//      ↓
// Enter OTP
//      ↓
// Verify OTP
//      ↓
// Booking Confirmed
//      ↓
// payment-success.html
//


// CONFIG

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// STATE

let bookingId = null;

let bookingData = null;

let isVerifying = false;

let countdownInterval = null;

let otpExpiresAt = null;


// GET AUTH TOKEN

const getAuthToken = () => {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken") ||
        sessionStorage.getItem("authToken")
    );

};


// DOM ELEMENTS

const bookingIdDisplay =
    document.getElementById(
        "bookingIdDisplay"
    );


const otpInput =
    document.getElementById(
        "otpInput"
    );


const verifyOtpButton =
    document.getElementById(
        "verifyOtpButton"
    );


const resendOtpButton =
    document.getElementById(
        "resendOtpButton"
    );


const otpError =
    document.getElementById(
        "otpError"
    );


const otpErrorMessage =
    document.getElementById(
        "otpErrorMessage"
    );


const otpSuccess =
    document.getElementById(
        "otpSuccess"
    );


const otpSuccessMessage =
    document.getElementById(
        "otpSuccessMessage"
    );


const otpTimer =
    document.getElementById(
        "otpTimer"
    );


const countdown =
    document.getElementById(
        "countdown"
    );


const otpExpiredMessage =
    document.getElementById(
        "otpExpiredMessage"
    );


const backButton =
    document.getElementById(
        "backButton"
    );


// AUTH CHECK

const requireAuth = () => {

    const token =
        getAuthToken();


    if (!token) {

        throw new Error(
            "You are not logged in. Please login first."
        );

    }


    return token;

};


// API REQUEST

const apiRequest = async (
    endpoint,
    options = {}
) => {

    const token =
        requireAuth();


    const headers = {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${token}`,

        ...(options.headers || {})

    };


    let response;


    try {

        response =
            await fetch(
                `${API_BASE_URL}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );

    } catch (error) {

        console.error(
            "API Connection Error:",
            error
        );

        throw new Error(
            "Unable to connect to the server. Please make sure the backend server is running."
        );

    }


    let result = {};


    try {

        result =
            await response.json();

    } catch (error) {

        result = {};

    }


    if (!response.ok) {

        throw new Error(

            result.message ||
            result.error ||
            "Something went wrong while processing your request."

        );

    }


    return result;

};


// SHOW ERROR

const showError = (
    message
) => {

    if (otpSuccess) {

        otpSuccess.classList.add(
            "hidden"
        );

    }


    if (otpErrorMessage) {

        otpErrorMessage.textContent =
            message;

    }


    if (otpError) {

        otpError.classList.remove(
            "hidden"
        );

    }

};


// HIDE ERROR

const hideError = () => {

    if (otpError) {

        otpError.classList.add(
            "hidden"
        );

    }

};


// SHOW SUCCESS

const showSuccess = (
    message
) => {

    if (otpError) {

        otpError.classList.add(
            "hidden"
        );

    }


    if (otpSuccessMessage) {

        otpSuccessMessage.textContent =
            message;

    }


    if (otpSuccess) {

        otpSuccess.classList.remove(
            "hidden"
        );

    }

};


// GET BOOKING DATA

const loadBookingData = () => {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const urlBookingId =
        urlParams.get(
            "bookingId"
        );


    const urlPaymentId =
        urlParams.get(
            "paymentId"
        );


    const savedBookingId =
        sessionStorage.getItem(
            "paymentBookingId"
        );


    const savedBookingData =
        sessionStorage.getItem(
            "paymentBookingData"
        );


    if (!savedBookingId && !urlBookingId) {

        throw new Error(
            "Booking information was not found. Please start the booking process again."
        );

    }


    bookingId =
        savedBookingId || urlBookingId;


    if (urlPaymentId) {

        sessionStorage.setItem(
            "paymentId",
            urlPaymentId
        );

    }


    if (!savedBookingId && urlBookingId) {

        sessionStorage.setItem(
            "paymentBookingId",
            urlBookingId
        );

    }


    if (savedBookingData) {

        try {

            bookingData =
                JSON.parse(
                    savedBookingData
                );

        } catch (error) {

            console.error(
                "Unable to parse booking data:",
                error
            );

            bookingData = null;

        }

    }


    console.log(
        "Booking ID:",
        bookingId
    );


    console.log(
        "Booking Data:",
        bookingData
    );


    if (bookingIdDisplay) {

        bookingIdDisplay.textContent =
            bookingId;

    }


    if (
        bookingData &&
        bookingData.otpExpiresAt
    ) {

        otpExpiresAt =
            new Date(
                bookingData.otpExpiresAt
            ).getTime();

    }

};


// FORMAT TIME

const formatTime = (
    seconds
) => {

    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    return (
        String(minutes).padStart(
            2,
            "0"
        ) +
        ":" +
        String(remainingSeconds).padStart(
            2,
            "0"
        )
    );

};


// START COUNTDOWN

const startCountdown = () => {

    // CLEAR PREVIOUS TIMER

    if (countdownInterval) {

        clearInterval(
            countdownInterval
        );

    }


    // DEFAULT 5 MINUTES / count down

    if (!otpExpiresAt) {

        otpExpiresAt =
            Date.now() +
            (5 * 60 * 1000);

    }


    const updateCountdown = () => {

        const remaining =
            Math.max(
                0,
                Math.floor(
                    (
                        otpExpiresAt -
                        Date.now()
                    ) / 1000
                )
            );


        if (countdown) {

            countdown.textContent =
                formatTime(
                    remaining
                );

        }


        // EXPIRED

        if (remaining <= 0) {

            clearInterval(
                countdownInterval
            );


            countdownInterval =
                null;


            if (otpTimer) {

                otpTimer.classList.add(
                    "hidden"
                );

            }


            if (otpExpiredMessage) {

                otpExpiredMessage.classList.remove(
                    "hidden"
                );

            }


            if (verifyOtpButton) {

                verifyOtpButton.disabled =
                    true;

            }


            if (resendOtpButton) {

                resendOtpButton.disabled =
                    false;

            }

        }

    };


    updateCountdown();


    countdownInterval =
        setInterval(
            updateCountdown,
            1000
        );

};


// VALIDATE OTP

const getOtpValue = () => {

    if (!otpInput) {

        return "";

    }


    return otpInput.value
        .replace(/\D/g, "")
        .slice(0, 6);

};


// VERIFY OTP

const verifyOtp = async () => {

    if (isVerifying) {

        return;

    }


    hideError();


    const otp =
        getOtpValue();


    // OTP LENGTH

    if (otp.length !== 6) {

        showError(
            "Please enter the complete 6-digit OTP."
        );

        return;

    }


    // BOOKING ID

    if (!bookingId) {

        showError(
            "Booking ID is missing. Please restart the booking process."
        );

        return;

    }


    // PROCESSING

    isVerifying =
        true;


    if (verifyOtpButton) {

        verifyOtpButton.disabled =
            true;

        verifyOtpButton.textContent =
            "Verifying...";

    }


    try {

        console.log(
            "Verifying booking OTP..."
        );


        // BACKEND OTP VERIFICATION

        const result =
            await apiRequest(
                "/bookings/verify-otp",
                {
                    method: "POST",

                    body:
                        JSON.stringify({

                            bookingId,

                            otp

                        })

                }
            );


        console.log(
            "OTP Verification Response:",
            result
        );


        // EXTRACT RESPONSE DATA

        const data =
            result.data ||
            result;


        const verifiedBooking =
            data.booking ||
            bookingData;


        // SAVE CONFIRMED BOOKING

        sessionStorage.setItem(
            "confirmedBookingId",
            bookingId
        );


        sessionStorage.setItem(
            "confirmedBookingData",
            JSON.stringify(
                verifiedBooking
            )
        );


        // UPDATE PAYMENT SUCCESS DATA

        let existingSuccessData = {};


        const savedSuccessData =
            sessionStorage.getItem(
                "paymentSuccessData"
            );


        if (savedSuccessData) {

            try {

                existingSuccessData =
                    JSON.parse(
                        savedSuccessData
                    );

            } catch (error) {

                existingSuccessData = {};

            }

        }


        const isFree =
            result?.isFree === true ||
            result?.data?.isFree === true ||
            existingSuccessData?.paymentMethod === "free" ||
            existingSuccessData?.payment?.paymentMethod === "free" ||
            verifiedBooking?.event?.eventType === "free" ||
            verifiedBooking?.ticketPrice === 0 ||
            verifiedBooking?.totalAmount === 0;

        const finalSuccessData = {
            ...existingSuccessData,
            booking: verifiedBooking,
            paymentMethod: isFree ? "free" : (existingSuccessData?.paymentMethod || "sslcommerz"),
            otpVerified: true,
            verifiedAt: new Date().toISOString()
        };

        sessionStorage.setItem(
            "paymentSuccessData",
            JSON.stringify(finalSuccessData)
        );

        const verifiedEventId = verifiedBooking?.event?._id || verifiedBooking?.event || "";
        if (verifiedEventId) {
            sessionStorage.setItem("paymentEventId", verifiedEventId);
            sessionStorage.setItem("selectedEventId", verifiedEventId);
        }
        if (verifiedBooking?.event && typeof verifiedBooking.event === "object") {
            sessionStorage.setItem("selectedEventData", JSON.stringify(verifiedBooking.event));
        }

        if (otpInput) {
            otpInput.disabled = true;
        }

        if (resendOtpButton) {
            resendOtpButton.disabled = true;
        }

        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }

        // FREE EVENT: Confirmed immediately
        if (isFree) {
            showSuccess("OTP verified successfully! Your free booking is confirmed.");
            if (verifyOtpButton) {
                verifyOtpButton.textContent = "Booking Confirmed";
            }
            setTimeout(() => {
                window.location.href = "./payment-success.html";
            }, 1200);
            return;
        }

        // PAID EVENT: Redirect to SSLCommerz Payment Gateway
        showSuccess("OTP verified successfully! Connecting to SSLCommerz Payment Gateway...");
        if (verifyOtpButton) {
            verifyOtpButton.textContent = "Connecting to Payment...";
        }

        try {
            const token = getAuthToken();
            const frontendBaseUrl =
                window.location.origin +
                (window.location.pathname.includes("/frontend/") ? "/frontend" : "");

            const payResponse = await fetch(`${API_BASE_URL}/payments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking: bookingId,
                    frontendUrl: frontendBaseUrl
                })
            });

            const payResult = await payResponse.json();

            if (payResponse.ok && payResult.success && payResult.data?.gatewayPageURL) {
                // Direct redirect to SSLCommerz Sandbox Hosted Payment Page
                setTimeout(() => {
                    window.location.href = payResult.data.gatewayPageURL;
                }, 1000);
            } else {
                // Fallback to payment.html
                setTimeout(() => {
                    window.location.href = `./payment.html?bookingId=${encodeURIComponent(bookingId)}`;
                }, 1000);
            }
        } catch (payError) {
            console.warn("Direct gateway session failed, navigating to payment page:", payError);
            setTimeout(() => {
                window.location.href = `./payment.html?bookingId=${encodeURIComponent(bookingId)}`;
            }, 1000);
        }

    } catch (error) {

        console.error(
            "OTP Verification Error:",
            error
        );


        showError(
            error.message ||
            "Unable to verify OTP. Please try again."
        );


        if (verifyOtpButton) {

            verifyOtpButton.disabled =
                false;

            verifyOtpButton.textContent =
                "Verify OTP";

        }

    } finally {

        isVerifying =
            false;

    }

};


// RESEND OTP
//
// NOTE:
// This function is prepared for the resend endpoint.
// It uses:
// POST /bookings/:bookingId/resend-otp
//
// If your backend resend route has a different URL,
// only this endpoint needs to be changed.

const resendOtp = async () => {

    if (!bookingId) {

        showError(
            "Booking ID is missing."
        );

        return;

    }


    hideError();


    if (resendOtpButton) {

        resendOtpButton.disabled =
            true;

        resendOtpButton.textContent =
            "Sending...";

    }


    try {

        console.log(
            "Requesting new OTP..."
        );


        const result =
            await apiRequest(
                `/bookings/${bookingId}/resend-otp`,
                {
                    method: "POST"
                }
            );


        console.log(
            "Resend OTP Response:",
            result
        );


        const data =
            result.data ||
            result;


        // UPDATE EXPIRY

        if (
            data &&
            data.booking &&
            data.booking.otpExpiresAt
        ) {

            otpExpiresAt =
                new Date(
                    data.booking.otpExpiresAt
                ).getTime();

        } else {

            otpExpiresAt =
                Date.now() +
                (5 * 60 * 1000);

        }


        // UPDATE BOOKING DATA

        if (
            data &&
            data.booking
        ) {

            bookingData =
                data.booking;


            sessionStorage.setItem(
                "paymentBookingData",
                JSON.stringify(
                    bookingData
                )
            );

        }


        // RESET UI

        if (otpInput) {

            otpInput.value = "";

            otpInput.disabled =
                false;

            otpInput.focus();

        }


        if (otpTimer) {

            otpTimer.classList.remove(
                "hidden"
            );

        }


        if (otpExpiredMessage) {

            otpExpiredMessage.classList.add(
                "hidden"
            );

        }


        if (verifyOtpButton) {

            verifyOtpButton.disabled =
                false;

            verifyOtpButton.textContent =
                "Verify OTP";

        }


        startCountdown();


        showSuccess(
            "A new OTP has been sent to your registered email."
        );


    } catch (error) {

        console.error(
            "Resend OTP Error:",
            error
        );


        showError(
            error.message ||
            "Unable to resend OTP."
        );

    } finally {

        if (resendOtpButton) {

            resendOtpButton.disabled =
                false;

            resendOtpButton.textContent =
                "Resend OTP";

        }

    }

};


// INPUT HANDLER

const handleOtpInput = () => {

    if (!otpInput) {

        return;

    }


    otpInput.value =
        otpInput.value
            .replace(/\D/g, "")
            .slice(0, 6);


    hideError();


    // ENABLE VERIFY BUTTON

    if (
        verifyOtpButton &&
        !otpExpiresAt ||
        (
            verifyOtpButton &&
            otpExpiresAt &&
            Date.now() < otpExpiresAt
        )
    ) {

        verifyOtpButton.disabled =
            otpInput.value.length !== 6;

    }

};


// BACK BUTTON

const handleBack = () => {

    window.history.back();

};


// EVENT LISTENERS

const setupEventListeners = () => {

    // OTP INPUT

    if (otpInput) {

        otpInput.addEventListener(
            "input",
            handleOtpInput
        );


        otpInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter"
                ) {

                    verifyOtp();

                }

            }
        );

    }


    // VERIFY

    if (verifyOtpButton) {

        verifyOtpButton.addEventListener(
            "click",
            verifyOtp
        );

    }


    // RESEND

    if (resendOtpButton) {

        resendOtpButton.addEventListener(
            "click",
            resendOtp
        );

    }


    // BACK

    if (backButton) {

        backButton.addEventListener(
            "click",
            handleBack
        );

    }

};


// INITIALIZE

const initialize = () => {

    try {

        console.log(
            "========================================"
        );

        console.log(
            "EventEase OTP Verification"
        );

        console.log(
            "========================================"
        );


        // AUTH

        requireAuth();


        // LOAD BOOKING

        loadBookingData();


        // EVENT LISTENERS

        setupEventListeners();


        // START TIMER

        startCountdown();


        // INITIAL BUTTON STATE

        if (verifyOtpButton) {

            verifyOtpButton.disabled =
                true;

        }


        console.log(
            "OTP verification page initialized."
        );

    } catch (error) {

        console.error(
            "OTP page initialization error:",
            error
        );


        showError(
            error.message ||
            "Unable to load OTP verification page."
        );


        if (verifyOtpButton) {

            verifyOtpButton.disabled =
                true;

        }

    }

};


// DOM READY

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );

} else {

    initialize();

}