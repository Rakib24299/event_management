const { z } = require("zod");


const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");


const createBookingSchema = z.object(
    {
        body: z.object(
         {
           event: objectIdSchema,

            ticketQuantity: z
            .number()
            .int()
            .min(1, "At least 1 ticket is required"),

            bookingOtp: z
            .string()
            .length(6, "OTP must be exactly 6 digits")
            .optional(),
        }),
});

const verifyBookingOtpSchema = z.object(
{
        body: z.object(
        {
            bookingId: z
            .string()
            .min(1, "Booking ID is required"),

            otp: z
            .string()
            .length(6, "OTP must be exactly 6 digits"),
        }),
});


const cancelBookingSchema = z.object(
    {
        body: z.object(
        {
            bookingId: z
            .string()
            .min(1, "Booking ID is required"),
        }),
});

const updateBookingStatusSchema = z.object(
    {
        body: z.object(
        {
            bookingStatus: z.enum(["pending","confirmed","cancelled","completed",]),
        }),
});

module.exports = {
        createBookingSchema,
        verifyBookingOtpSchema,
        cancelBookingSchema,
        updateBookingStatusSchema,
};