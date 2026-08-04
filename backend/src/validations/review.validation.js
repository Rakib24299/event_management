const { z } = require("zod");
const objectIdSchema = require("./objectId.validation");


// create Review Schema***
const createReviewSchema = z.object({
  body: z
    .object({
      event: objectIdSchema,

      rating: z
        .number({
          required_error: "Rating is required",
        })
        .int("Rating must be an integer")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot be greater than 5"),

      comment: z
        .string()
        .trim()
        .min(5, "Comment must be at least 5 characters")
        .max(1000, "Comment cannot exceed 1000 characters"),
    })
    .strict(),
});



// update Review Schema
const updateReviewSchema = z.object({
  body: z
    .object({
      rating: z
        .number()
        .int("Rating must be an integer")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot be greater than 5")
        .optional(),

      comment: z
        .string()
        .trim()
        .min(5, "Comment must be at least 5 characters")
        .max(1000, "Comment cannot exceed 1000 characters")
        .optional(),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: "At least one field is required for update",
      }
    ),
});

module.exports = {
    createReviewSchema,
    updateReviewSchema,
};