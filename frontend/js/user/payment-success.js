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

const ticketsCard =
    document.getElementById("ticketsCard");

const paymentMethodCard =
    document.getElementById("paymentMethodCard");

const bookingIdCard =
    document.getElementById("bookingIdCard");

const totalAmountCard =
    document.getElementById("totalAmountCard");

const bookingInfoGrid =
    document.getElementById("bookingInfoGrid");

const paymentInfoSection =
    document.getElementById("paymentInfoSection");

const paymentInfoHeading =
    document.getElementById("paymentInfoHeading");

const paymentInfoSubheading =
    document.getElementById("paymentInfoSubheading");

const paymentIdRow =
    document.getElementById("paymentIdRow");

const transactionIdRow =
    document.getElementById("transactionIdRow");

const paymentStatusRow =
    document.getElementById("paymentStatusRow");

const bookingStatusRow =
    document.getElementById("bookingStatusRow");

const successHeading =
    document.getElementById("successHeading");

const successSubheading =
    document.getElementById("successSubheading");


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


    const isFreeEvent =
        (eventData && (eventData.eventType === "free" || Number(eventData.ticketPrice ?? 0) === 0)) ||
        (completedBooking?.event && (completedBooking.event.eventType === "free" || Number(completedBooking.event.ticketPrice ?? 0) === 0)) ||
        (completedBooking && Number(completedBooking.totalAmount ?? 0) === 0 && (completedBooking.ticketPrice === 0 || completedBooking.ticketPrice === undefined || completedBooking.ticketPrice === null)) ||
        completedPayment?.paymentMethod === "free" ||
        successData?.paymentMethod === "free" ||
        successData?.paymentMethod === "free_registration";


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
        isFreeEvent
            ? "Free"
            : formatMoney(
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


    // --------------------------------------------------
    // Free Event UI Adjustments
    // --------------------------------------------------

    if (isFreeEvent) {

        if (ticketsCard) {
            ticketsCard.classList.add("hidden");
        } else if (successTicketQuantity) {
            successTicketQuantity.closest("div")?.classList.add("hidden");
        }

        if (paymentMethodCard) {
            paymentMethodCard.classList.add("hidden");
        } else if (successPaymentMethod) {
            successPaymentMethod.closest("div")?.classList.add("hidden");
        }

        if (paymentStatusRow) {
            paymentStatusRow.classList.add("hidden");
        } else if (successPaymentStatus) {
            successPaymentStatus.closest("div")?.classList.add("hidden");
        }

        if (paymentIdRow) {
            paymentIdRow.classList.add("hidden");
        } else if (successPaymentId) {
            successPaymentId.closest("div")?.classList.add("hidden");
        }

        if (transactionIdRow) {
            transactionIdRow.classList.add("hidden");
        } else if (successTransactionId) {
            successTransactionId.closest("div")?.classList.add("hidden");
        }

        if (successHeading) {
            successHeading.textContent = "Registration Confirmed!";
        }

        if (successSubheading) {
            successSubheading.textContent = "Your free event registration has been successfully confirmed.";
        }

        if (paymentInfoHeading) {
            paymentInfoHeading.textContent = "Registration Information";
        }

        if (paymentInfoSubheading) {
            paymentInfoSubheading.textContent = "Your event registration is confirmed.";
        }

        if (bookingInfoGrid) {
            bookingInfoGrid.className = "mt-7 grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 sm:grid-cols-2";
        }

        if (successBookingStatus) {
            successBookingStatus.textContent = "CONFIRMED";
            successBookingStatus.className = "rounded-full bg-primaryLight px-3 py-1 text-xs font-semibold text-primary";
        }

        if (bookingStatus) {
            bookingStatus.textContent = "CONFIRMED";
            bookingStatus.className = "w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white";
        }

    } else {

        if (ticketsCard) {
            ticketsCard.classList.remove("hidden");
        } else if (successTicketQuantity) {
            successTicketQuantity.closest("div")?.classList.remove("hidden");
        }

        if (paymentMethodCard) {
            paymentMethodCard.classList.remove("hidden");
        } else if (successPaymentMethod) {
            successPaymentMethod.closest("div")?.classList.remove("hidden");
        }

        if (paymentStatusRow) {
            paymentStatusRow.classList.remove("hidden");
        } else if (successPaymentStatus) {
            successPaymentStatus.closest("div")?.classList.remove("hidden");
        }

        if (paymentIdRow) {
            paymentIdRow.classList.remove("hidden");
        } else if (successPaymentId) {
            successPaymentId.closest("div")?.classList.remove("hidden");
        }

        if (transactionIdRow) {
            transactionIdRow.classList.remove("hidden");
        } else if (successTransactionId) {
            successTransactionId.closest("div")?.classList.remove("hidden");
        }

        if (bookingInfoGrid) {
            bookingInfoGrid.className = "mt-7 grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-4";
        }

    }

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

    if (successAvailableSeats) {

        const isFree =
            eventData.eventType === "free" ||
            Number(eventData.ticketPrice ?? 0) === 0;

        if (isFree) {

            const seatsRow =
                successAvailableSeats.closest("p");

            if (seatsRow) {
                seatsRow.classList.add("hidden");
            }

        } else {

            successAvailableSeats.textContent =
                eventData.availableSeats ??
                "--";

        }

    }

    displayBookingInformation();

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
            "QR Ticket Generated";


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
// LOAD BOOKING FROM API (FALLBACK)
// ======================================================
// Used when sessionStorage data is not available
// (e.g., after free event OTP verification where
// the backend redirects directly to this page).

const loadBookingFromApi =
    async () => {

        const urlParams =
            new URLSearchParams(
                window.location.search
            );


        const bookingId =
            urlParams.get("bookingId") ||
            sessionStorage.getItem(
                "confirmedBookingId"
            ) ||
            sessionStorage.getItem(
                "paymentBookingId"
            );


        if (!bookingId) {

            console.log(
                "No bookingId found for API fallback."
            );

            return;

        }


        if (!token) {

            console.log(
                "No auth token for API fallback."
            );

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/bookings/${encodeURIComponent(bookingId)}`,
                    {
                        method: "GET",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`,
                        },
                    }
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                console.error(
                    "Failed to load booking for success page:",
                    result
                );

                return;

            }


            const booking =
                result?.data ||
                result;


            if (booking) {

                completedBooking =
                    booking;


                if (
                    booking?.payment
                ) {

                    try {

                        const paymentResponse =
                            await fetch(
                                `${API_URL}/payments/booking/${encodeURIComponent(booking.payment)}`,
                                {
                                    method: "GET",

                                    headers: {
                                        "Content-Type":
                                            "application/json",

                                        "Authorization":
                                            `Bearer ${token}`,
                                    },
                                }
                            );


                        const paymentResult =
                            await paymentResponse.json();


                        if (
                            paymentResult?.success &&
                            paymentResult?.data
                        ) {

                            completedPayment =
                                paymentResult.data;

                        }

                    } catch (paymentError) {

                        console.error(
                            "Failed to load payment:",
                            paymentError
                        );

                    }

                }


                console.log(
                    "Booking loaded from API:",
                    completedBooking
                );

            }

        } catch (error) {

            console.error(
                "API fallback error:",
                error
            );

        }

    };


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

    }


    displayBookingInformation();


    displayOTP();


    await loadBookingFromApi();


    await loadEventInformation();

};


initialize();