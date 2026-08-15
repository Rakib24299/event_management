const { z } = require("zod");

// Update Profile Schema

const updateProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name cannot exceed 50 characters")
        .optional(),

      phone: z
        .string()
        .trim()
        .regex(
          /^(\+8801|01)[3-9]\d{8}$/,
          "Invalid phone number"
        )
        .optional(),

      address: z
        .string()
        .trim()
        .max(200, "Address cannot exceed 200 characters")
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
  updateProfileSchema,
};