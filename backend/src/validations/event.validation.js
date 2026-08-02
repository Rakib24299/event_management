const {z}  = require("zod")
const objectIdSchema = require("./objectId.validation");

const createEventSchema = z.object(
    {
        body: z
            .object(
                {
                    title: z
                        .string()
                        .trim()
                        .min(3, "Event title must be at least 3 characters")
                        .max(100, "Event title cannot exceed 100 characters"),

                    slug: z
                        .string()
                        .trim()
                        .min(3, "Slug is required")
                        .max(120, "Slug cannot exceed 120 characters")
                        .optional(),

                    organizer: z.string().min(1, "Organizer is required"),

                    category: z.string().min(1, "Category is required"),

                    description: z
                        .string()
                        .trim()
                        .min(10, "Description must be at least 10 characters")
                        .max(2000, "Description cannot exceed 2000 characters"),

                    venue: z.object(
                        {
                            venueName: z
                            .string()
                            .trim()
                            .min(2, "Venue name is required"),

                            street: z.string().trim().optional(),

                            city: z.string().trim().optional(),

                            country: z.string().trim().optional(),
                        }),

                    eventDate: z
                    .string()
                    .min(1, "Event date is required"),

                    startTime: z
                    .string()
                    .min(1, "Start time is required"),

                    endTime: z
                    .string()
                    .min(1, "End time is required"),

                    eventType: z
                    .enum(["free", "paid"]),

                    ticketPrice: z
                    .number().min(0),

                    totalSeats: z
                    .number().int().min(1),

                    maxTicketsPerUser: z
                    .number()
                    .int()
                    .min(1)
                    // .max(10)
                    .optional(),
                 })

            .superRefine((data, ctx) => 
                {
                    if (data.eventType === "free" && data.ticketPrice !== 0)
                     {
                        ctx.addIssue(
                         {
                            code: z.ZodIssueCode.custom,
                            path: ["ticketPrice"],
                            message: "Free events must have a ticket price of 0.",
                        });
                    }

                    if (data.eventType === "paid" && data.ticketPrice <= 0) 
                    {
                        ctx.addIssue(
                         {
                            code: z.ZodIssueCode.custom,
                            path: ["ticketPrice"],
                            message: "Paid events must have a ticket price greater than 0.",
                        });
                    }
            }),
});


const updateEventSchema = z.object(
    {
        body: z.object(
        {
            title: z
            .string()
            .trim()
            .min(3)
            .max(100)
            .optional(),

            description: z
            .string()
            .trim()
            .max(2000)
            .optional(),

            venue: z
            .object(
                {
                    venueName: z.string().trim().optional(),
                    street: z.string().trim().optional(),
                    city: z.string().trim().optional(),
                    country: z.string().trim().optional(),
                })
            .optional(),

             eventDate: z.string().optional(),

             startTime: z.string().optional(),

             endTime: z.string().optional(),

            eventType: z.enum(["free", "paid"]).optional(),

             ticketPrice: z.number().min(0).optional(),

            totalSeats: z.number().int().min(1).optional(),

            maxTicketsPerUser: z
                                .number()
                                .int()
                                .min(1)
                                // .max(10,"Maximum 10 tickets allowed per user")
                                .optional(),

             status: z
                                .enum(["draft", "published", "completed", "cancelled"])
                                .optional(),
        }),
});

module.exports = {
    createEventSchema,
    updateEventSchema,
};