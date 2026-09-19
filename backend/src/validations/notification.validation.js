const { z } = require("zod");

const objectIdSchema = require("./objectId.validation");


// Create Notification Schema

const createNotificationSchema = z.object({
  body: z
    .object({
      user: objectIdSchema,

      title: z
        .string()
        .trim()
        .nonempty("Notification title is required")
        .min(
          3,
          "Notification title must be at least 3 characters"
        )
        .max(
          150,
          "Notification title cannot exceed 150 characters"
        ),

      message: z
        .string()
        .trim()
        .nonempty("Notification message is required")
        .min(
          3,
          "Notification message must be at least 3 characters"
        )
        .max(
          1000,
          "Notification message cannot exceed 1000 characters"
        ),

      type: z
        .enum(
          [
            "event",
            "booking",
            "payment",
            "refund",
            "approval",
            "system",
            "account",
          ],
          {
            errorMap: () => ({
              message: "Invalid notification type",
            }),
          }
        )
        .optional()
        .default("system"),
    })
    .strict(),
});


// Update Notification Read Status Schema

const updateNotificationSchema = z.object({
  body: z
    .object({
      isRead: z.boolean({
        required_error: "isRead is required",
      }),
    })
    .strict(),
});


module.exports = {
  createNotificationSchema,
  updateNotificationSchema,
};