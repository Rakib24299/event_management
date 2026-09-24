// EventEase Booking Success Page
// Dummy Payment + Booking OTP

const API_URL =
  "http://localhost:5000/api/v1";


// DOM ELEMENTS

const successEventImage =
  document.getElementById(
    "successEventImage"
  );

const successEventCategory =
  document.getElementById(
    "successEventCategory"
  );

const successEventTitle =
  document.getElementById(
    "successEventTitle"
  );

const successEventDate =
  document.getElementById(
    "successEventDate"
  );

const successEventLocation =
  document.getElementById(
    "successEventLocation"
  );

const successAvailableSeats =
  document.getElementById(
    "successAvailableSeats"
  );

const successBookingId =
  document.getElementById(
    "successBookingId"
  );

const successTicketQuantity =
  document.getElementById(
    "successTicketQuantity"
  );

const successPaymentMethod =
  document.getElementById(
    "successPaymentMethod"
  );

const successTotalAmount =
  document.getElementById(
    "successTotalAmount"
  );

const successPaymentId =
  document.getElementById(
    "successPaymentId"
  );

const successTransactionId =
  document.getElementById(
    "successTransactionId"
  );

const successPaymentStatus =
  document.getElementById(
    "successPaymentStatus"
  );

const successBookingStatus =
  document.getElementById(
    "successBookingStatus"
  );

const bookingStatus =
  document.getElementById(
    "bookingStatus"
  );

const bookingOtp =
  document.getElementById(
    "bookingOtp"
  );

const otpExpiry =
  document.getElementById(
    "otpExpiry"
  );

const otpMessage =
  document.getElementById(
    "otpMessage"
  );

const ticketsCard =
  document.getElementById(
    "ticketsCard"
  );

const paymentMethodCard =
  document.getElementById(
    "paymentMethodCard"
  );

const bookingIdCard =
  document.getElementById(
    "bookingIdCard"
  );

const totalAmountCard =
  document.getElementById(
    "totalAmountCard"
  );

const bookingInfoGrid =
  document.getElementById(
    "bookingInfoGrid"
  );

const paymentInfoSection =
  document.getElementById(
    "paymentInfoSection"
  );

const paymentInfoHeading =
  document.getElementById(
    "paymentInfoHeading"
  );

const paymentInfoSubheading =
  document.getElementById(
    "paymentInfoSubheading"
  );

const paymentIdRow =
  document.getElementById(
    "paymentIdRow"
  );

const transactionIdRow =
  document.getElementById(
    "transactionIdRow"
  );

const paymentStatusRow =
  document.getElementById(
    "paymentStatusRow"
  );

const bookingStatusRow =
  document.getElementById(
    "bookingStatusRow"
  );

const successHeading =
  document.getElementById(
    "successHeading"
  );

const successSubheading =
  document.getElementById(
    "successSubheading"
  );


// TOKEN

const getToken = () => {

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken")
  );

};


const token =
  getToken();


// GLOBAL DATA

let successData =
  null;

let completedBooking =
  null;

let completedPayment =
  null;

let eventData =
  null;


// FORMAT MONEY

const formatMoney =
  (amount) => {

    return `৳${Number(
      amount || 0
    ).toLocaleString("en-BD")}`;

  };


// FORMAT DATE

const formatDate =
  (dateValue) => {

    if (!dateValue) {
      return "--";
    }


    const date =
      new Date(
        dateValue
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateValue;
    }


    return date.toLocaleDateString(
      "en-BD",
      {
        weekday:
          "long",

        year:
          "numeric",

        month:
          "long",

        day:
          "numeric",
      }
    );
  };


// GET ID

const getId =
  (object) => {

    if (!object) {
      return null;
    }


    return (
      object._id ||
      object.id ||
      null
    );
  };


// LOAD SUCCESS DATA

const loadSuccessData =
  () => {

    const paymentSuccessData =
      sessionStorage.getItem(
        "paymentSuccessData"
      );

    const paymentBookingData =
      sessionStorage.getItem(
        "paymentBookingData"
      );

    const paymentCreatedData =
      sessionStorage.getItem(
        "paymentCreatedData"
      );


    let parsedSuccess =
      null;

    let parsedBooking =
      null;

    let parsedPayment =
      null;


    try {

      if (
        paymentSuccessData
      ) {

        parsedSuccess =
          JSON.parse(
            paymentSuccessData
          );
      }

    } catch (error) {

      console.error(
        "Success data parse error:",
        error
      );

    }


    try {

      if (
        paymentBookingData
      ) {

        parsedBooking =
          JSON.parse(
            paymentBookingData
          );
      }

    } catch (error) {

      console.error(
        "Booking data parse error:",
        error
      );

    }


    try {

      if (
        paymentCreatedData
      ) {

        parsedPayment =
          JSON.parse(
            paymentCreatedData
          );
      }

    } catch (error) {

      console.error(
        "Payment data parse error:",
        error
      );

    }


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


    // Sometimes success response itself
    // can be booking

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


// GET BOOKING ID

const getBookingId =
  () => {
    const urlParams =
      new URLSearchParams(
        window.location.search
      );

    const urlBookingId =
      urlParams.get("bookingId") ||
      urlParams.get("id");

    return (
      urlBookingId ||
      getId(
        completedBooking
      ) ||
      sessionStorage.getItem(
        "confirmedBookingId"
      ) ||
      sessionStorage.getItem(
        "paymentBookingId"
      )
    );
  };


// GET PAYMENT ID

const getPaymentId =
  () => {
    const urlParams =
      new URLSearchParams(
        window.location.search
      );

    const urlPaymentId =
      urlParams.get("paymentId");

    return (
      urlPaymentId ||
      getId(
        completedPayment
      ) ||
      sessionStorage.getItem(
        "paymentId"
      )
    );
  };


// DISPLAY BOOKING INFORMATION

const displayBookingInformation =
  () => {

    const bookingId =
      getBookingId();


    const paymentId =
      getPaymentId();


    const quantity =
      Number(
        completedBooking?.ticketQuantity ||
        completedBooking?.quantity ||
        successData?.ticketQuantity ||
        1
      );


    const totalAmount =
      Number(
        completedBooking?.totalAmount ??
        completedBooking?.totalPrice ??
        completedPayment?.grossAmount ??
        completedPayment?.amount ??
        successData?.amount ??
        0
      );


    const paymentMethod =
      completedPayment?.paymentMethod ||
      successData?.paymentMethod ||
      "sslcommerz";


    const transactionId =
      completedPayment?.transactionId ||
      completedPayment?.tran_id ||
      successData?.transactionId ||
      "--";


    const paymentStatus =
      completedPayment?.status ||
      completedPayment?.paymentStatus ||
      successData?.paymentStatus ||
      "paid";


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


    if (successBookingId) {

      successBookingId.textContent =
        bookingId || "--";
    }


    if (successTicketQuantity) {

      successTicketQuantity.textContent =
        quantity;
    }


    if (successPaymentMethod) {

      successPaymentMethod.textContent =
        paymentMethod === "sslcommerz"
          ? "SSLCommerz"
          : paymentMethod || "Online";

    }


    if (successTotalAmount) {

      successTotalAmount.textContent =
        isFreeEvent
          ? "Free"
          : formatMoney(
              totalAmount
            );
    }


    if (successPaymentId) {

      successPaymentId.textContent =
        paymentId || "--";
    }


    if (successTransactionId) {

      successTransactionId.textContent =
        transactionId || "--";
    }


    if (successPaymentStatus) {

      successPaymentStatus.textContent =
        String(
          paymentStatus
        ).toUpperCase();
    }


    if (successBookingStatus) {

      successBookingStatus.textContent =
        String(
          bookingCurrentStatus
        ).toUpperCase();
    }


    if (bookingStatus) {

      bookingStatus.textContent =
        String(
          bookingCurrentStatus
        ).toUpperCase();
    }


    // Free Event UI Adjustments

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


// DISPLAY OTP

const displayOTP =
  () => {

    const otp =
      completedBooking?.bookingOtp ||
      completedBooking?.otp ||
      successData?.otp ||
      sessionStorage.getItem(
        "bookingOtp"
      );


    const expiry =
      completedBooking?.bookingOtpExpires ||
      completedBooking?.otpExpiresAt ||
      successData?.otpExpiresAt;


    console.log(
      "Booking OTP:",
      otp
    );


    if (
      bookingOtp
    ) {

      bookingOtp.textContent =
        otp || "------";
    }


    if (
      otpMessage
    ) {

      if (otp) {

        otpMessage.textContent =
          "Your booking OTP has been generated successfully.";

        otpMessage.classList.remove(
          "text-red-600"
        );

        otpMessage.classList.add(
          "text-primary"
        );

      } else {

        otpMessage.textContent =
          "OTP was not returned by the server.";

        otpMessage.classList.remove(
          "text-primary"
        );

        otpMessage.classList.add(
          "text-red-600"
        );
      }
    }


    if (
      expiry &&
      otpExpiry
    ) {

      const expiryDate =
        new Date(
          expiry
        );


      if (
        !Number.isNaN(
          expiryDate.getTime()
        )
      ) {

        otpExpiry.textContent =
          `Valid until ${expiryDate.toLocaleTimeString(
            "en-BD",
            {
              hour:
                "numeric",

              minute:
                "2-digit",
            }
          )}`;
      }
    }
  };


// FIND EVENT ID

const getEventId =
  () => {
    const urlParams =
      new URLSearchParams(
        window.location.search
      );

    const urlEventId =
      urlParams.get("eventId") ||
      urlParams.get("event");

    if (urlEventId) {
      return urlEventId;
    }

    const event =
      completedBooking?.event;

    if (
      event &&
      typeof event ===
        "object"
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
      sessionStorage.getItem("selectedEventId") ||
      sessionStorage.getItem("paymentEventId") ||
      null
    );
  };


// LOAD EVENT

const loadEventInformation =
  async () => {

    const eventId =
      getEventId();


    if (!eventId) {

      if (successEventTitle) {

        successEventTitle.textContent =
          "Event information unavailable.";
      }

      return;
    }


    try {

      const response =
        await fetch(
          `${API_URL}/events/${eventId}`,
          {
            method:
              "GET",

            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );


      const result =
        await response.json();


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


      if (
        successEventTitle
      ) {

        successEventTitle.textContent =
          "Unable to load event information.";
      }
    }
  };


// DISPLAY EVENT

const displayEventInformation =
  () => {

    if (!eventData) {
      return;
    }


    // IMAGE

    let imageUrl =
      "";


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


    if (
      successEventImage
    ) {

      successEventImage.src =
        imageUrl;

      successEventImage.alt =
        eventData.title ||
        "Event";
    }


    // CATEGORY

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


    if (
      successEventCategory
    ) {

      successEventCategory.textContent =
        category;
    }


    // TITLE

    if (
      successEventTitle
    ) {

      successEventTitle.textContent =
        eventData.title ||
        eventData.name ||
        "Untitled Event";
    }


    // DATE

    if (
      successEventDate
    ) {

      successEventDate.textContent =
        formatDate(
          eventData.eventDate ||
          eventData.date ||
          eventData.startDate
        );
    }


    // LOCATION

    let location =
      eventData.venue ||
      eventData.location ||
      eventData.address ||
      "";


    if (
      location &&
      typeof location ===
      "object"
    ) {

      location =
        location.venueName ||
        location.name ||
        location.address ||
        [location.street, location.city, location.country].filter(Boolean).join(", ") ||
        "";
    }


    if (
      successEventLocation
    ) {

      successEventLocation.textContent =
        location ||
        "Location not available";
    }


    // AVAILABLE SEATS

    if (
      successAvailableSeats
    ) {

      successAvailableSeats.textContent =
        eventData.availableSeats ??
        "--";
    }

    const isFreeEvent =
      (eventData && (eventData.eventType === "free" || Number(eventData.ticketPrice ?? 0) === 0)) ||
      (completedBooking?.event && (completedBooking.event.eventType === "free" || Number(completedBooking.event.ticketPrice ?? 0) === 0)) ||
      (completedBooking && Number(completedBooking.totalAmount ?? 0) === 0 && (completedBooking.ticketPrice === 0 || completedBooking.ticketPrice === undefined || completedBooking.ticketPrice === null)) ||
      completedPayment?.paymentMethod === "free" ||
      successData?.paymentMethod === "free" ||
      successData?.paymentMethod === "free_registration";

    if (isFreeEvent && successAvailableSeats) {
      const seatsRow = successAvailableSeats.closest("p");
      if (seatsRow) {
        seatsRow.classList.add("hidden");
      }
    }

    displayBookingInformation();
  };


// INITIALIZE

const initialize =
  async () => {

    console.log(
      "Initializing Booking Success Page..."
    );

    let hasData =
      loadSuccessData();

    const bookingId =
      getBookingId();

    if (!hasData && bookingId) {
      try {
        const authToken = getToken();
        const headers = { "Content-Type": "application/json" };
        if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

        let response = await fetch(`${API_URL}/bookings/public/${encodeURIComponent(bookingId)}`, { headers });
        if (!response.ok) {
          response = await fetch(`${API_URL}/bookings/${encodeURIComponent(bookingId)}`, { headers });
        }

        if (response.ok) {
          const result = await response.json();
          const booking = result?.data || result;
          if (booking && (booking._id || booking.id)) {
            completedBooking = booking;
            if (booking.event && typeof booking.event === "object") {
              eventData = booking.event;
            }
            if (booking.payment && typeof booking.payment === "object") {
              completedPayment = booking.payment;
            }
            hasData = true;
          }
        }
      } catch (err) {
        console.warn("Could not fetch booking from API:", err);
      }
    }

    if (!hasData) {

      if (
        successEventTitle
      ) {

        successEventTitle.textContent =
          "Booking information unavailable.";
      }


      if (
        successBookingId
      ) {

        successBookingId.textContent =
          bookingId ||
          sessionStorage.getItem(
            "confirmedBookingId"
          ) || "--";
      }


      if (
        otpMessage
      ) {

        otpMessage.textContent =
          "Booking data was not found.";
      }

      return;
    }


    displayBookingInformation();

    displayOTP();

    await loadEventInformation();

  };


initialize();