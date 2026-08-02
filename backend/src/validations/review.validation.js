const { z } = require("zod");
const objectIdSchema = require("./objectId.validation");


// const objectIdSchema = z
//   .string()
//   .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");



  const createReviewSchema = z.object(
    {
     body: z.object(
      {
          user: objectIdSchema,

         event: objectIdSchema,

         booking: objectIdSchema,

        rating: z
            .number()
            .int()
            .min(1, "Rating must be at least 1")
            .max(5, "Rating cannot be greater than 5"),

        review: z
            .string()
            .trim()
            .min(5, "Review must be at least 5 characters")
            .max(1000, "Review cannot exceed 1000 characters"),
        }),
});

const updateReviewSchema = z.object(
 {
    body: z.object(
     {
        rating: z
        .number()
        .int()
        .min(1)
        .max(5)
        .optional(),

        review: z
        .string()
        .trim()
        .min(5)
        .max(1000)
        .optional(),

        status: z
        .enum(["pending", "approved", "rejected"])
        .optional(),
    }),
});

module.exports = {
    createReviewSchema,
    updateReviewSchema,
};