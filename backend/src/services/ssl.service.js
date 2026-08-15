const axios = require("axios");

// console.log("========== SSL ENV CHECK ==========");
// console.log("STORE ID:", process.env.SSL_STORE_ID);
// console.log("SANDBOX:", process.env.SSL_SANDBOX);
// console.log(
//   "PASSWORD EXISTS:",
//   Boolean(process.env.SSL_STORE_PASSWORD)
// );
// console.log(
//   "PASSWORD LENGTH:",
//   process.env.SSL_STORE_PASSWORD?.length
// );
// console.log("===================================");

// Create SSLCommerz Payment Session
const createSSLSession = async ({ payment, booking }) => {

  const isSandbox = process.env.SSL_SANDBOX === "true";

  const apiUrl = isSandbox
    ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
    : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

  const formData = new URLSearchParams();

  // Store Credentials
  formData.append(
    "store_id",
    process.env.SSL_STORE_ID
  );

  formData.append(
    "store_passwd",
    process.env.SSL_STORE_PASSWORD
  );

  // Transaction Information
  formData.append(
    "total_amount",
    String(booking.totalAmount)
  );

  formData.append(
    "currency",
    "BDT"
  );

  formData.append(
    "tran_id",
    payment.transactionId
  );

  // Callback URLs
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

  // Shipping
  formData.append(
    "shipping_method",
    "NO"
  );

  // Product Information
  formData.append(
    "product_name",
    booking.event.title
  );

  formData.append(
    "product_category",
    "Event Ticket"
  );

  formData.append(
    "product_profile",
    "general"
  );

  // Customer Information
  formData.append(
    "cus_name",
    booking.user.name
  );

  formData.append(
    "cus_email",
    booking.user.email
  );

  formData.append(
    "cus_phone",
    booking.user.phone
  );

  formData.append(
    "cus_add1",
    booking.user.address || "Dhaka"
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

  // Custom Values
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

  try {

    const response = await axios.post(
      apiUrl,
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

    console.log(response.data);

    console.log(
      "=========================================="
    );

    // SSLCommerz returned failure
    if (
      !response.data ||
      response.data.status !== "SUCCESS"
    ) {
      throw new Error(
        response.data?.failedreason ||
        "SSLCommerz payment session creation failed."
      );
    }

    // Gateway URL missing
    if (!response.data.GatewayPageURL) {
      throw new Error(
        "SSLCommerz GatewayPageURL was not returned."
      );
    }

    return response.data;

  } catch (error) {

    console.error(
      "SSLCommerz Session Error:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
};


// Validate SSLCommerz Payment
const validateSSLPayment = async (valId) => {

  const isSandbox =
    process.env.SSL_SANDBOX === "true";

  const baseUrl = isSandbox
    ? "https://sandbox.sslcommerz.com"
    : "https://securepay.sslcommerz.com";

  const url =
    `${baseUrl}/validator/api/validationserverAPI.php`;

  const response = await axios.get(url, {
    params: {
      val_id: valId,
      store_id: process.env.SSL_STORE_ID,
      store_passwd:
        process.env.SSL_STORE_PASSWORD,
      format: "json",
    },

    timeout: 30000,
  });

  return response.data;
};


module.exports = {
  createSSLSession,
  validateSSLPayment,
};