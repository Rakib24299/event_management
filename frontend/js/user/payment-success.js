// ======================================================
// EventEase Booking Success Page
// ======================================================

const API_URL = "http://localhost:5000/api/v1";


// ======================================================
// DOM ELEMENTS
// ======================================================

const successEventImage =
    document.getElementById("successEventImage");

const successEventCategory =
    document.getElementById("successEventCategory");

const successEventTitle =
    document.getElementById("successEventTitle");

const successEventDate =
    document.getElementById("successEventDate");

const successEventLocation =
    document.getElementById("successEventLocation");

const successAvailableSeats =
    document.getElementById("successAvailableSeats");

const successBookingId =
    document.getElementById("successBookingId");

const successTicketQuantity =
    document.getElementById("successTicketQuantity");

const successPaymentMethod =
    document.getElementById("successPaymentMethod");

const successTotalAmount =
    document.getElementById("successTotalAmount");

const successPaymentId =
    document.getElementById("successPaymentId");

const successTransactionId =
    document.getElementById("successTransactionId");

const successPaymentStatus =
    document.getElementById("successPaymentStatus");

const successBookingStatus =
    document.getElementById("successBookingStatus");

const bookingStatus =
    document.getElementById("bookingStatus");

const bookingOtp =
    document.getElementById("bookingOtp");

const otpExpiry =
    document.getElementById("otpExpiry");

const otpMessage =
    document.getElementById("otpMessage");

const generateQrButton =
    document.getElementById("generateQrButton");

const qrContainer =
    document.getElementById("qrContainer");

const qrCode =
    document.getElementById("qrCode");

const qrMessage =
    document.getElementById("qrMessage");


// ======================================================
// TOKEN
// ======================================================

const getToken = () => {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken")
    );

};

const token = getToken();


// ======================================================
// GLOBAL DATA
// ======================================================

let successData = null;

let completedBooking = null;

let completedPayment = null;

let eventData = null;


// ======================================================
// FORMAT MONEY
// ======================================================

const formatMoney = (amount) => {

    return `৳${Number(amount || 0).toLocaleString("en-BD")}`;

};


// ======================================================
// FORMAT DATE
// ======================================================

const formatDate = (dateValue) => {

    if (!dateValue) {
        return "--";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString(
        "en-BD",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

};


// ======================================================
// GET ID
// ======================================================

const getId = (object) => {

    if (!object) {
        return null;
    }

    return (
        object._id ||
        object.id ||
        null
    );

};


// ======================================================
// LOAD PAYMENT SUCCESS DATA
// ======================================================

const loadSuccessData = () => {

    console.log(
        "Loading payment success data..."
    );


    // --------------------------------------------------
    // PRIMARY DATA
    // --------------------------------------------------

    const paymentSuccessData =
        sessionStorage.getItem(
            "paymentSuccessData"
        );


    // --------------------------------------------------
    // BOOKING DATA
    // --------------------------------------------------

    const paymentBookingData =
        sessionStorage.getItem(
            "paymentBookingData"
        );


    // --------------------------------------------------
    // PAYMENT DATA
    // --------------------------------------------------

    const paymentCreatedData =
        sessionStorage.getItem(
            "paymentCreatedData"
        );


    let parsedSuccess = null;

    let parsedBooking = null;

    let parsedPayment = null;


    try {

        if (paymentSuccessData) {

            parsedSuccess =
                JSON.parse(
                    paymentSuccessData
                );

        }

    } catch (error) {

        console.error(
            "Payment success data parse error:",
            error
        );

    }


    try {

        if (paymentBookingData) {

            parsedBooking =
                JSON.parse(
                    paymentBookingData
                );

        }

    } catch (error) {

        console.error(
            "Payment booking data parse error:",
            error
        );

    }


    try {

        if (paymentCreatedData) {

            parsedPayment =
                JSON.parse(
                    paymentCreatedData
                );

        }

    } catch (error) {

        console.error(
            "Payment created data parse error:",
            error
        );

    }


    // ==================================================
    // BUILD FINAL DATA
    // ==================================================

    successData =
        parsedSuccess || {};


    completedBooking =
        parsedSuccess?.booking ||
        parsedBooking ||
        null;


    completedPayment =
        parsedSuccess?.payment ||
        parsedPayment ||
        null;


    // --------------------------------------------------
    // Sometimes response itself is booking
    // --------------------------------------------------

    if (
        !completedBooking &&
        parsedSuccess &&
        (
            parsedSuccess._id ||
            parsedSuccess.id
        )
    ) {

        completedBooking =
            parsedSuccess;

    }


    console.log(
        "SUCCESS DATA:",
        successData
    );

    console.log(
        "BOOKING DATA:",
        completedBooking
    );

    console.log(
        "PAYMENT DATA:",
        completedPayment
    );


    return !!completedBooking;

};


// ======================================================
// GET BOOKING ID
// ======================================================

const getBookingId = () => {

    return (

        getId(completedBooking) ||

        sessionStorage.getItem(
            "confirmedBookingId"
        ) ||

        sessionStorage.getItem(
            "paymentBookingId"
        )

    );

};


// ======================================================
// GET PAYMENT ID
// ======================================================

const getPaymentId = () => {

    return (

        getId(completedPayment) ||

        sessionStorage.getItem(
            "paymentId"
        )

    );

};


// ======================================================
// DISPLAY BOOKING INFORMATION
// ======================================================

const displayBookingInformation = () => {

    const bookingId =
        getBookingId();


    const paymentId =
        getPaymentId();


    // --------------------------------------------------
    // Quantity
    // --------------------------------------------------

    const quantity =
        Number(
            completedBooking?.ticketQuantity ||
            completedBooking?.quantity ||
            successData?.ticketQuantity ||
            1
        );


    // --------------------------------------------------
    // Amount
    // --------------------------------------------------

    const totalAmount =
        Number(
            completedBooking?.totalAmount ??
            completedBooking?.totalPrice ??
            completedPayment?.amount ??
            successData?.amount ??
            0
        );


    // --------------------------------------------------
    // Payment Method
    // --------------------------------------------------

    const paymentMethod =
        completedPayment?.paymentMethod ||
        successData?.paymentMethod ||
        sessionStorage.getItem("paymentMethod") ||
        "sslcommerz";


    // --------------------------------------------------
    // Transaction ID
    // --------------------------------------------------

    const transactionId =
        completedPayment?.transactionId ||
        completedPayment?.tran_id ||
        successData?.transactionId ||
        successData?.tran_id ||
        "--";


    // --------------------------------------------------
    // Payment Status
    // --------------------------------------------------

    const paymentStatus =
        completedPayment?.paymentStatus ||
        completedPayment?.status ||
        successData?.paymentStatus ||
        "paid";


    // --------------------------------------------------
    // Booking Status
    // --------------------------------------------------

    const bookingCurrentStatus =
        completedBooking?.bookingStatus ||
        completedBooking?.status ||
        successData?.bookingStatus ||
        "pending";


    // ==================================================
    // DISPLAY
    // ==================================================

    successBookingId.textContent =
        bookingId || "--";


    successTicketQuantity.textContent =
        quantity;


    successPaymentMethod.textContent =
        String(
            paymentMethod
        ).replace(
            /_/g,
            " "
        );


    successTotalAmount.textContent =
        formatMoney(
            totalAmount
        );


    successPaymentId.textContent =
        paymentId || "--";


    successTransactionId.textContent =
        transactionId || "--";


    successPaymentStatus.textContent =
        String(
            paymentStatus
        ).toUpperCase();


    successBookingStatus.textContent =
        String(
            bookingCurrentStatus
        ).toUpperCase();


    bookingStatus.textContent =
        String(
            bookingCurrentStatus
        ).toUpperCase();

};


// ======================================================
// DISPLAY OTP
// ======================================================

const displayOTP = () => {

    // --------------------------------------------------
    // Try multiple possible OTP locations
    // --------------------------------------------------

    const otp =
        completedBooking?.otp ||
        successData?.otp ||
        successData?.booking?.otp ||
        completedPayment?.otp ||
        sessionStorage.getItem("bookingOtp") ||
        null;


    console.log(
        "Detected OTP:",
        otp
    );


    if (otp) {

        bookingOtp.textContent =
            String(otp);

        otpMessage.textContent =
            "Your booking OTP has been generated successfully.";

        otpMessage.classList.remove(
            "text-red-600"
        );

        otpMessage.classList.add(
            "text-primary"
        );

    } else {

        bookingOtp.textContent =
            "------";

        otpMessage.textContent =
            "OTP was not included in the booking response.";

        otpMessage.classList.remove(
            "text-primary"
        );

        otpMessage.classList.add(
            "text-red-600"
        );

    }


    // --------------------------------------------------
    // OTP expiry
    // --------------------------------------------------

    const expiry =
        completedBooking?.otpExpiresAt ||
        successData?.otpExpiresAt ||
        successData?.booking?.otpExpiresAt ||
        null;


    if (expiry) {

        const expiryDate =
            new Date(expiry);


        if (
            !Number.isNaN(
                expiryDate.getTime()
            )
        ) {

            otpExpiry.textContent =
                `Valid until ${expiryDate.toLocaleTimeString(
                    "en-BD",
                    {
                        hour: "numeric",
                        minute: "2-digit"
                    }
                )}`;

        }

    }

};


// ======================================================
// FIND EVENT ID
// ======================================================

const getEventId = () => {

    const event =
        completedBooking?.event;


    if (
        event &&
        typeof event === "object"
    ) {

        return (
            event._id ||
            event.id ||
            null
        );

    }


    return (
        event ||
        completedBooking?.eventId ||
        successData?.eventId ||
        null
    );

};


// ======================================================
// LOAD EVENT
// ======================================================

const loadEventInformation = async () => {

    const eventId =
        getEventId();


    console.log(
        "Event ID:",
        eventId
    );


    if (!eventId) {

        successEventTitle.textContent =
            "Event information unavailable.";

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/events/${eventId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const result =
            await response.json();


        console.log(
            "Event Response:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load event."
            );

        }


        eventData =
            result.data?.event ||
            result.data ||
            result.event ||
            result;


        displayEventInformation();

    } catch (error) {

        console.error(
            "Event loading error:",
            error
        );

        successEventTitle.textContent =
            "Unable to load event information.";

    }

};


// ======================================================
// DISPLAY EVENT
// ======================================================

const displayEventInformation = () => {

    if (!eventData) {
        return;
    }


    // --------------------------------------------------
    // IMAGE
    // --------------------------------------------------

    let imageUrl = "";


    if (
        typeof eventData.bannerImage ===
        "string"
    ) {

        imageUrl =
            eventData.bannerImage;

    } else if (
        eventData.bannerImage &&
        typeof eventData.bannerImage ===
            "object"
    ) {

        imageUrl =
            eventData.bannerImage.url ||
            eventData.bannerImage.secure_url ||
            "";

    }


    imageUrl =
        imageUrl ||
        eventData.image ||
        eventData.imageUrl ||
        "https://via.placeholder.com/600x400?text=EventEase";


    successEventImage.src =
        imageUrl;


    successEventImage.alt =
        eventData.title ||
        "Event";


    // --------------------------------------------------
    // CATEGORY
    // --------------------------------------------------

    let category =
        "Event";


    if (
        typeof eventData.category ===
        "string"
    ) {

        category =
            eventData.category;

    } else if (
        eventData.category &&
        typeof eventData.category ===
            "object"
    ) {

        category =
            eventData.category.name ||
            "Event";

    }


    successEventCategory.textContent =
        category;


    // --------------------------------------------------
    // TITLE
    // --------------------------------------------------

    successEventTitle.textContent =
        eventData.title ||
        eventData.name ||
        "Untitled Event";


    // --------------------------------------------------
    // DATE
    // --------------------------------------------------

    successEventDate.textContent =
        formatDate(
            eventData.eventDate ||
            eventData.date ||
            eventData.startDate
        );


    // --------------------------------------------------
    // LOCATION
    // --------------------------------------------------

    let location =
        eventData.location ||
        eventData.venue ||
        eventData.address ||
        "";


    // Handle object location
    if (
        location &&
        typeof location === "object"
    ) {

        location =
            location.name ||
            location.address ||
            location.venue ||
            JSON.stringify(location);

    }


    successEventLocation.textContent =
        location ||
        "Location not available";


    // --------------------------------------------------
    // AVAILABLE SEATS
    // --------------------------------------------------

    successAvailableSeats.textContent =
        eventData.availableSeats ??
        "--";

};


// ======================================================
// GENERATE QR
// ======================================================

const generateQRCode = async () => {

    if (!token) {

        qrMessage.textContent =
            "Please login again.";

        return;

    }


    const bookingId =
        getBookingId();


    if (!bookingId) {

        qrMessage.textContent =
            "Booking ID was not found.";

        return;

    }


    generateQrButton.disabled =
        true;


    generateQrButton.textContent =
        "Generating QR...";


    try {

        const response =
            await fetch(
                `${API_URL}/bookings/${bookingId}/generate-qr`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const result =
            await response.json();


        console.log(
            "QR Response:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to generate QR ticket."
            );

        }


        const data =
            result.data ||
            result;


        const qrImage =
            data?.qrCode ||
            data?.qrUrl ||
            data?.qrImage ||
            data?.booking?.qrCode ||
            data?.booking?.qrUrl ||
            data?.booking?.qrImage;


        if (!qrImage) {

            throw new Error(
                "QR image was not returned by the server."
            );

        }


        qrCode.innerHTML = "";


        const image =
            document.createElement("img");


        image.src =
            qrImage;


        image.alt =
            "Booking QR Code";


        image.className =
            "mx-auto h-56 w-56 rounded-xl bg-white p-2";


        qrCode.appendChild(
            image
        );


        qrContainer.classList.remove(
            "hidden"
        );


        qrMessage.textContent =
            "Your QR ticket is ready. Show it at the venue.";


        generateQrButton.textContent =
            "QR Ticket Generated ✓";


    } catch (error) {

        console.error(
            "QR Error:",
            error
        );


        qrMessage.textContent =
            error.message ||
            "Unable to generate QR ticket.";


        generateQrButton.disabled =
            false;


        generateQrButton.textContent =
            "Generate QR Ticket";

    }

};


// ======================================================
// EVENT LISTENER
// ======================================================

if (generateQrButton) {

    generateQrButton.addEventListener(
        "click",
        generateQRCode
    );

}


// ======================================================
// INITIALIZE
// ======================================================

const initialize = async () => {

    console.log(
        "Initializing Booking Success Page..."
    );


    const hasData =
        loadSuccessData();


    if (!hasData) {

        successEventTitle.textContent =
            "Booking information unavailable.";

        successBookingId.textContent =
            sessionStorage.getItem(
                "confirmedBookingId"
            ) || "--";

        otpMessage.textContent =
            "Booking data was not found.";

        return;

    }


    displayBookingInformation();


    displayOTP();


    await loadEventInformation();

};


initialize();