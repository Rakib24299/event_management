const {z} = require("zod")

// Create Category Schema

const createCategorySchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .nonempty("Category name is required")
        .min(2, "Category name must be at least 2 characters")
        .max(50, "Category name cannot exceed 50 characters"),

      slug: z
        .string()
        .trim()
        .regex(
          /^[a-z0-9-]+$/,
          "Slug can contain only lowercase letters, numbers and hyphens"
        )
        .max(60, "Slug cannot exceed 60 characters")
        .optional(),

      description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional()
        .default(""),

      status: z
        .enum(["active", "inactive"])
        .optional()
        .default("active"),
    })
    .strict(),
});


// Update Category Schema
// ======================================================

const updateCategorySchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Category name must be at least 2 characters")
        .max(50, "Category name cannot exceed 50 characters")
        .optional(),

      slug: z
        .string()
        .trim()
        .regex(
          /^[a-z0-9-]+$/,
          "Slug can contain only lowercase letters, numbers and hyphens"
        )
        .max(60, "Slug cannot exceed 60 characters")
        .optional(),

      description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),

      status: z
        .enum(["active", "inactive"])
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
    createCategorySchema,
    updateCategorySchema,
};