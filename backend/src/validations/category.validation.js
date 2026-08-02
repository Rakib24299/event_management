const {z} = require("zod")

const createCategorySchema = z.object(
    {
         body: z.object(
            {
                name: z
                .string()
                .trim()
                .min(2, "Category name must be at least 2 characters")
                .max(50, "Category name cannot exceed 50 characters"),

                slug: z
                .string()
                .trim()
                .min(2, "Slug is required")
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
        }),
});


const updateCategorySchema = z.object(
    {
        body: z.object(
            {
                name: z
                .string()
                .trim()
                .min(2, "Category name must be at least 2 characters")
                .max(50, "Category name cannot exceed 50 characters")
                .optional(),

                slug: z
                .string()
                .trim()
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
            }),
});


module.exports = {
    createCategorySchema,
    updateCategorySchema,
};