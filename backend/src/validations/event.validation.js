const {z}  = require("zod")
const objectIdSchema = require("./objectId.validation");




// Create Event Schema

const createEventSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .nonempty("Event title is required")
        .min(3, "Event title must be at least 3 characters")
        .max(100, "Event title cannot exceed 100 characters"),

      slug: z
        .string()
        .trim()
        .regex(
          /^[a-z0-9-]+$/,
          "Slug can contain only lowercase letters, numbers and hyphens"
        )
        .max(120, "Slug cannot exceed 120 characters")
        .optional(),

      organizer: objectIdSchema,

      category: objectIdSchema,

      description: z
        .string()
        .trim()
        .nonempty("Description is required")
        .min(10, "Description must be at least 10 characters")
        .max(2000, "Description cannot exceed 2000 characters"),

      venue: z.object({
        venueName: z
          .string()
          .trim()
          .nonempty("Venue name is required")
          .min(2, "Venue name must be at least 2 characters")
          .max(100, "Venue name cannot exceed 100 characters"),

        street: z
          .string()
          .trim()
          .max(150)
          .optional(),

        city: z
          .string()
          .trim()
          .max(100)
          .optional(),

        country: z
          .string()
          .trim()
          .max(100)
          .optional(),
      }),

      eventDate: z
        .string()
        .nonempty("Event date is required"),

      startTime: z
        .string()
        .nonempty("Start time is required"),

      endTime: z
        .string()
        .nonempty("End time is required"),

      eventType: z.enum(
        ["free", "paid"],
        {
          errorMap: () => ({
            message: "Event type must be either free or paid",
          }),
        }
      ),

      ticketPrice: z
        .number()
        .min(0, "Ticket price cannot be negative"),

      totalSeats: z
        .number()
        .int("Total seats must be an integer")
        .min(1, "Total seats must be at least 1"),

      maxTicketsPerUser: z
        .number()
        .int("Maximum tickets must be an integer")
        .min(1, "Maximum tickets must be at least 1")
        .max(20, "Maximum tickets per user cannot exceed 20")
        .optional(),
    })
    .strict()
    .superRefine((data, ctx) => {

      if (
        data.eventType === "free" &&
        data.ticketPrice !== 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ticketPrice"],
          message:
            "Free events must have a ticket price of 0.",
        });
      }

      if (
        data.eventType === "paid" &&
        data.ticketPrice <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ticketPrice"],
          message:
            "Paid events must have a ticket price greater than 0.",
        });
      }

      if (
        data.maxTicketsPerUser &&
        data.maxTicketsPerUser > data.totalSeats
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxTicketsPerUser"],
          message:
            "Maximum tickets per user cannot exceed total seats.",
        });
      }
    }),
});



// Update Event Schema


const updateEventSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(3, "Event title must be at least 3 characters")
        .max(100, "Event title cannot exceed 100 characters")
        .optional(),

      slug: z
        .string()
        .trim()
        .regex(
          /^[a-z0-9-]+$/,
          "Slug can contain only lowercase letters, numbers and hyphens"
        )
        .max(120, "Slug cannot exceed 120 characters")
        .optional(),

      category: objectIdSchema.optional(),

      description: z
        .string()
        .trim()
        .max(2000, "Description cannot exceed 2000 characters")
        .optional(),

      venue: z
        .object({
          venueName: z
            .string()
            .trim()
            .min(2, "Venue name must be at least 2 characters")
            .max(100)
            .optional(),

          street: z
            .string()
            .trim()
            .max(150)
            .optional(),

          city: z
            .string()
            .trim()
            .max(100)
            .optional(),

          country: z
            .string()
            .trim()
            .max(100)
            .optional(),
        })
        .optional(),

      eventDate: z
        .string()
        .optional(),

      startTime: z
        .string()
        .optional(),

      endTime: z
        .string()
        .optional(),

      eventType: z
        .enum(["free", "paid"])
        .optional(),

      ticketPrice: z
        .number()
        .min(0, "Ticket price cannot be negative")
        .optional(),

      totalSeats: z
        .number()
        .int("Total seats must be an integer")
        .min(1)
        .optional(),

      maxTicketsPerUser: z
        .number()
        .int("Maximum tickets must be an integer")
        .min(1)
        .max(20)
        .optional(),

      status: z
        .enum([
          "draft",
          "published",
          "completed",
          "cancelled",
        ])
        .optional(),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: "At least one field is required for update",
      }
    )
    .superRefine((data, ctx) => {

      if (
        data.eventType === "free" &&
        data.ticketPrice !== undefined &&
        data.ticketPrice !== 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ticketPrice"],
          message:
            "Free events must have a ticket price of 0.",
        });
      }

      if (
        data.eventType === "paid" &&
        data.ticketPrice !== undefined &&
        data.ticketPrice <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ticketPrice"],
          message:
            "Paid events must have a ticket price greater than 0.",
        });
      }

      if (
        data.totalSeats !== undefined &&
        data.maxTicketsPerUser !== undefined &&
        data.maxTicketsPerUser > data.totalSeats
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxTicketsPerUser"],
          message:
            "Maximum tickets per user cannot exceed total seats.",
        });
      }
    }),
});

module.exports = {
    createEventSchema,
    updateEventSchema,
};