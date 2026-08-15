const SSLCommerzPayment = require("sslcommerz-lts");

const storeId = process.env.SSL_STORE_ID;
const storePassword = process.env.SSL_STORE_PASSWORD;
const isLive = process.env.SSL_SANDBOX === "false";

console.log("========== SSL CONFIG ==========");
console.log("STORE ID:", storeId);
console.log("SANDBOX:", !isLive);
console.log("PASSWORD EXISTS:", Boolean(storePassword));
console.log("PASSWORD LENGTH:", storePassword?.length);
console.log("================================");

const sslcommerz = new SSLCommerzPayment(
  storeId,
  storePassword,
  isLive
);

module.exports = sslcommerz;