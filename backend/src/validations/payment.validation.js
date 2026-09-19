const Joi = require("joi");


// CREATE PAYMENT
//
// POST /api/v1/payments/create
//
// Paid Event:
// Booking ID
//     ↓
// Create SSLCommerz Payment
//
// Free Event:
// Payment is not allowed
// Booking directly uses OTP flow

const createPaymentSchema = Joi.object({

  booking: Joi.string()
    .trim()
    .required()
    .messages({

      "string.empty":
        "Booking ID is required.",

      "any.required":
        "Booking ID is required.",

      "string.base":
        "Booking ID must be a valid string.",

    }),

});


// SSLCommerz SUCCESS
//
// SSLCommerz sends payment information to this endpoint.
// No authentication is required.
//

const sslPaymentSuccessSchema =
  Joi.object()
    .unknown(true);


// SSLCommerz FAIL
//
// SSLCommerz sends failed payment information.
//

const sslPaymentFailSchema =
  Joi.object()
    .unknown(true);


// SSLCommerz CANCEL
//
// SSLCommerz sends cancelled payment information.
//

const sslPaymentCancelSchema =
  Joi.object()
    .unknown(true);


// SSLCommerz IPN
//
// SSLCommerz server sends IPN data here.
//
// Unknown fields are allowed because SSLCommerz
// can send additional gateway fields.
//

const sslPaymentIPNSchema =
  Joi.object()
    .unknown(true);


// EXPORT

module.exports = {

  createPaymentSchema,

  sslPaymentSuccessSchema,

  sslPaymentFailSchema,

  sslPaymentCancelSchema,

  sslPaymentIPNSchema,

};