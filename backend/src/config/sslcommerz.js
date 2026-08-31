const SSLCommerzPayment = require("sslcommerz-lts");

const storeId = process.env.SSL_STORE_ID;
const storePassword = process.env.SSL_STORE_PASSWORD;

// SSLCommerz constructor:
// false = sandbox
// true = live

const isLive =
  process.env.SSL_SANDBOX !== "true";

console.log("================================");
console.log("SSLCommerz Configuration");
console.log("================================");
console.log("Store ID:", storeId);
console.log("Sandbox:", !isLive);
console.log(
  "Password Exists:",
  Boolean(storePassword)
);
console.log("================================");

const sslcommerz =
  new SSLCommerzPayment(
    storeId,
    storePassword,
    isLive
  );

module.exports = sslcommerz;