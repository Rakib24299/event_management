const axios = require("axios");

// SSLCommerz Configuration

const getSSLConfig = () => {
  const isSandbox =
    String(process.env.SSL_SANDBOX).toLowerCase() === "true";

  const baseUrl = isSandbox
    ? "https://sandbox.sslcommerz.com"
    : "https://securepay.sslcommerz.com";

  return {
    isSandbox,
    baseUrl,
    sessionUrl:
      `${baseUrl}/gwprocess/v4/api.php`,
    validationUrl:
      `${baseUrl}/validator/api/validationserverAPI.php`,
  };
};


// CREATE SSLCommerz PAYMENT SESSION
//
// EventEase
//    ↓
// Create Payment
//    ↓
// SSLCommerz Session
//    ↓
// Hosted Checkout
//

const createSSLSession = async ({
  payment,
  booking,
  frontendUrl,
}) => {

  if (!payment) {
    throw new Error(
      "Payment information is required."
    );
  }

  if (!booking) {
    throw new Error(
      "Booking information is required."
    );
  }

  if (!process.env.SSL_STORE_ID) {
    throw new Error(
      "SSL_STORE_ID is not configured."
    );
  }

  if (!process.env.SSL_STORE_PASSWORD) {
    throw new Error(
      "SSL_STORE_PASSWORD is not configured."
    );
  }

  if (!process.env.SSL_SUCCESS_URL) {
    throw new Error(
      "SSL_SUCCESS_URL is not configured."
    );
  }

  if (!process.env.SSL_FAIL_URL) {
    throw new Error(
      "SSL_FAIL_URL is not configured."
    );
  }

  if (!process.env.SSL_CANCEL_URL) {
    throw new Error(
      "SSL_CANCEL_URL is not configured."
    );
  }

  if (!process.env.SSL_IPN_URL) {
    throw new Error(
      "SSL_IPN_URL is not configured."
    );
  }


  const {
    sessionUrl,
  } = getSSLConfig();


  // AMOUNT 

  const totalAmount =
    Number(booking.totalAmount);


  if (
    !Number.isFinite(totalAmount) ||
    totalAmount < 10
  ) {
    throw new Error(
      "Payment amount must be at least 10 BDT."
    );
  }


  // TRANSACTION ID

  if (!payment.transactionId) {
    throw new Error(
      "Payment transaction ID is missing."
    );
  }


  // CUSTOMER DATA

  const customer =
    booking.user || {};


  const customerName =
    customer.name ||
    "EventEase Customer";


  const customerEmail =
    customer.email ||
    "customer@example.com";


  const customerPhone =
    customer.phone ||
    "01700000000";


  const customerAddress =
    customer.address ||
    "Dhaka";


  // PRODUCT DATA

  const event =
    booking.event || {};


  const eventTitle =
    event.title ||
    "Event Ticket";


  // FORM DATA

  const formData =
    new URLSearchParams();


  // STORE INFORMATION

  formData.append(
    "store_id",
    process.env.SSL_STORE_ID
  );


  formData.append(
    "store_passwd",
    process.env.SSL_STORE_PASSWORD
  );


  // TRANSACTION INFORMATION

  formData.append(
    "total_amount",
    totalAmount.toFixed(2)
  );


  formData.append(
    "currency",
    "BDT"
  );


  formData.append(
    "tran_id",
    payment.transactionId
  );


  // CALLBACK URLs

  formData.append(
    "success_url",
    process.env.SSL_SUCCESS_URL
  );


  formData.append(
    "fail_url",
    process.env.SSL_FAIL_URL
  );


  formData.append(
    "cancel_url",
    process.env.SSL_CANCEL_URL
  );


  formData.append(
    "ipn_url",
    process.env.SSL_IPN_URL
  );


  // SHIPPING

  formData.append(
    "shipping_method",
    "NO"
  );


  // PRODUCT INFORMATION

  formData.append(
    "product_name",
    eventTitle
  );


  formData.append(
    "product_category",
    "Event Ticket"
  );


  formData.append(
    "product_profile",
    "general"
  );


  // CUSTOMER INFORMATION

  formData.append(
    "cus_name",
    customerName
  );


  formData.append(
    "cus_email",
    customerEmail
  );


  formData.append(
    "cus_phone",
    customerPhone
  );


  formData.append(
    "cus_add1",
    customerAddress
  );


  formData.append(
    "cus_add2",
    ""
  );


  formData.append(
    "cus_city",
    "Dhaka"
  );


  formData.append(
    "cus_state",
    "Dhaka"
  );


  formData.append(
    "cus_postcode",
    "1200"
  );


  formData.append(
    "cus_country",
    "Bangladesh"
  );


  // CUSTOM VALUES

  formData.append(
    "value_a",
    booking._id.toString()
  );


  formData.append(
    "value_b",
    payment._id.toString()
  );


  formData.append(
    "value_c",
    booking.user._id.toString()
  );

  if (frontendUrl) {
    formData.append(
      "value_d",
      frontendUrl.toString()
    );
  }


  // SEND REQUEST TO SSLCOMMERZ

  try {

    console.log(
      "========== SSLCommerz SESSION =========="
    );

    console.log(
      "Environment:",
      getSSLConfig().isSandbox
        ? "SANDBOX"
        : "LIVE"
    );

    console.log(
      "Transaction ID:",
      payment.transactionId
    );

    console.log(
      "Amount:",
      totalAmount
    );

    console.log(
      "========================================="
    );


    const response =
      await axios.post(
        sessionUrl,
        formData.toString(),
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          timeout: 30000,
        }
      );


    console.log(
      "========== SSL SESSION RESPONSE =========="
    );

    console.log(
      response.data
    );

    console.log(
      "=========================================="
    );


    // CHECK RESPONSE

    if (
      !response.data
    ) {
      throw new Error(
        "Empty response received from SSLCommerz."
      );
    }


    if (
      response.data.status !==
      "SUCCESS"
    ) {
      throw new Error(
        response.data.failedreason ||
        "SSLCommerz payment session creation failed."
      );
    }


    // CHECK GATEWAY URL

    if (
      !response.data.GatewayPageURL
    ) {
      throw new Error(
        "SSLCommerz GatewayPageURL was not returned."
      );
    }


    return response.data;

  } catch (error) {

    console.error(
      "========== SSL SESSION ERROR =========="
    );

    console.error(
      error.response?.data ||
      error.message
    );

    console.error(
      "======================================="
    );

    throw error;
  }
};


// VALIDATE SSLCommerz PAYMENT
//
// Hosted Checkout
//       ↓
// Success / IPN
//       ↓
// val_id
//       ↓
// Backend Validation
//       ↓
// VALID / VALIDATED
//

const validateSSLPayment = async (
  valId
) => {

  if (!valId) {
    throw new Error(
      "SSLCommerz validation ID is required."
    );
  }


  if (!process.env.SSL_STORE_ID) {
    throw new Error(
      "SSL_STORE_ID is not configured."
    );
  }


  if (!process.env.SSL_STORE_PASSWORD) {
    throw new Error(
      "SSL_STORE_PASSWORD is not configured."
    );
  }


  const {
    validationUrl,
  } = getSSLConfig();


  try {

    console.log(
      "========== SSL PAYMENT VALIDATION =========="
    );

    console.log(
      "Validation ID:",
      valId
    );

    console.log(
      "Environment:",
      getSSLConfig().isSandbox
        ? "SANDBOX"
        : "LIVE"
    );

    console.log(
      "============================================="
    );


    const response =
      await axios.get(
        validationUrl,
        {
          params: {

            val_id:
              valId,

            store_id:
              process.env.SSL_STORE_ID,

            store_passwd:
              process.env.SSL_STORE_PASSWORD,

            format:
              "json",

          },

          timeout: 30000,
        }
      );


    console.log(
      "========== SSL VALIDATION RESPONSE =========="
    );

    console.log(
      response.data
    );

    console.log(
      "=============================================="
    );


    return response.data;

  } catch (error) {

    console.error(
      "========== SSL VALIDATION ERROR =========="
    );

    console.error(
      error.response?.data ||
      error.message
    );

    console.error(
      "=========================================="
    );

    throw error;
  }
};


// EXPORT

module.exports = {

  createSSLSession,

  validateSSLPayment,

};