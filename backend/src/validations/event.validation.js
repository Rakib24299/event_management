const { z } = require("zod");

const objectIdSchema =
  require("./objectId.validation");


// ========================================
// Image Schema
// ========================================

const imageSchema = z
  .object({

    url: z
      .string()
      .trim()
      .url("Invalid image URL"),

    publicId: z
      .string()
      .trim()
      .nonempty("Image public ID is required"),

  })
  .strict();



// ========================================
// Create Event Schema
// ========================================

const createEventSchema = z.object({

  body: z
    .object({

      title: z
        .string()
        .trim()
        .nonempty("Event title is required")
        .min(
          3,
          "Event title must be at least 3 characters"
        )
        .max(
          100,
          "Event title cannot exceed 100 characters"
        ),


      slug: z
        .string()
        .trim()
        .regex(
          /^[a-z0-9-]*$/,
          "Slug can contain only lowercase letters, numbers and hyphens"
        )
        .max(
          120,
          "Slug cannot exceed 120 characters"
        )
        .optional(),


      // organizer is taken from the
      // authenticated user (req.user.id),
      // not trusted from the request body.
      organizer:
        objectIdSchema.optional(),


      category:
        objectIdSchema,


      description: z
        .string()
        .trim()
        .nonempty("Description is required")
        .min(
          10,
          "Description must be at least 10 characters"
        )
        .max(
          2000,
          "Description cannot exceed 2000 characters"
        ),


      // ====================================
      // Venue
      // ====================================

      venue: z.object({

        venueName: z
          .string()
          .trim()
          .nonempty("Venue name is required")
          .min(
            2,
            "Venue name must be at least 2 characters"
          )
          .max(
            100,
            "Venue name cannot exceed 100 characters"
          ),


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


      // ====================================
      // Date & Time
      // ====================================

      eventDate: z
        .string()
        .nonempty("Event date is required"),


      startTime: z
        .string()
        .nonempty("Start time is required"),


      endTime: z
        .string()
        .nonempty("End time is required"),


      // ====================================
      // Event Type
      // ====================================

      eventType: z.enum(
        ["free", "paid"],
        {
          errorMap: () => ({

            message:
              "Event type must be either free or paid",

          }),
        }
      ),


      // ====================================
      // Ticket
      // ====================================

      ticketPrice: z
        .number()
        .min(
          0,
          "Ticket price cannot be negative"
        )
        .optional(),


      totalSeats: z
        .number()
        .int(
          "Total seats must be an integer"
        )
        .min(
          1,
          "Total seats must be at least 1"
        )
        .optional(),


      maxTicketsPerUser: z
        .number()
        .int(
          "Maximum tickets must be an integer"
        )
        .min(
          1,
          "Maximum tickets must be at least 1"
        )
        .max(
          20,
          "Maximum tickets per user cannot exceed 20"
        )
        .optional(),


      // ====================================
      // Banner Image
      // ====================================

      bannerImage:
        imageSchema.optional(),


      // ====================================
      // Gallery Images
      // ====================================

      galleryImages:
        z
          .array(imageSchema)
          .max(
            10,
            "Gallery cannot contain more than 10 images"
          )
          .optional(),

    })

    .strict()


    // ======================================
    // Create Event Validation
    // ======================================

    .superRefine((data, ctx) => {


      // ====================================
      // Free Event Price
      // ====================================

      if (
        data.eventType === "free" &&
        data.ticketPrice !== undefined &&
        data.ticketPrice !== 0
      ) {

        ctx.addIssue({

          code:
            z.ZodIssueCode.custom,

          path:
            ["ticketPrice"],

          message:
            "Free events must have a ticket price of 0.",

        });

      }


      // ====================================
      // Paid Event Validation
      // ====================================

      if (
        data.eventType === "paid"
      ) {

        if (
          data.ticketPrice === undefined ||
          data.ticketPrice <= 0
        ) {

          ctx.addIssue({

            code:
              z.ZodIssueCode.custom,

            path:
              ["ticketPrice"],

            message:
              "Paid events must have a ticket price greater than 0.",

          });

        }


        if (
          data.totalSeats === undefined ||
          data.totalSeats < 1
        ) {

          ctx.addIssue({

            code:
              z.ZodIssueCode.custom,

            path:
              ["totalSeats"],

            message:
              "Total seats must be at least 1.",

          });

        }


        if (
          data.maxTicketsPerUser === undefined ||
          data.maxTicketsPerUser < 1
        ) {

          ctx.addIssue({

            code:
              z.ZodIssueCode.custom,

            path:
              ["maxTicketsPerUser"],

            message:
              "Maximum tickets must be at least 1.",

          });

        }

      }


      // ====================================
      // Maximum Tickets
      // ====================================

      if (
        data.maxTicketsPerUser &&
        data.totalSeats &&
        data.maxTicketsPerUser >
          data.totalSeats
      ) {

        ctx.addIssue({

          code:
            z.ZodIssueCode.custom,

          path:
            ["maxTicketsPerUser"],

          message:
            "Maximum tickets per user cannot exceed total seats.",

        });

      }

    }),

});



// ========================================
// Update Event Schema
// ========================================

const updateEventSchema = z.object({

  body: z
    .object({


      // ====================================
      // Basic Information
      // ====================================

      title: z
        .string()
        .trim()
        .min(
          3,
          "Event title must be at least 3 characters"
        )
        .max(
          100,
          "Event title cannot exceed 100 characters"
        )
        .optional(),


      slug: z
        .string()
        .trim()
        .regex(
          /^[a-z0-9-]+$/,
          "Slug can contain only lowercase letters, numbers and hyphens"
        )
        .max(
          120,
          "Slug cannot exceed 120 characters"
        )
        .optional(),


      category:
        objectIdSchema.optional(),


      description: z
        .string()
        .trim()
        .max(
          2000,
          "Description cannot exceed 2000 characters"
        )
        .optional(),



      // ====================================
      // Venue
      // ====================================

      venue: z
        .object({

          venueName: z
            .string()
            .trim()
            .min(
              2,
              "Venue name must be at least 2 characters"
            )
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



      // ====================================
      // Date & Time
      // ====================================

      eventDate:
        z.string().optional(),


      startTime:
        z.string().optional(),


      endTime:
        z.string().optional(),



      // ====================================
      // Event Type
      // ====================================

      eventType:
        z
          .enum(["free", "paid"])
          .optional(),



      // ====================================
      // Ticket
      // ====================================

      ticketPrice:
        z
          .number()
          .min(
            0,
            "Ticket price cannot be negative"
          )
          .optional(),


      totalSeats:
        z
          .number()
          .int(
            "Total seats must be an integer"
          )
          .min(1)
          .optional(),


      maxTicketsPerUser:
        z
          .number()
          .int(
            "Maximum tickets must be an integer"
          )
          .min(1)
          .max(20)
          .optional(),



      // ====================================
      // Images
      // ====================================

      bannerImage:
        imageSchema.optional(),


      galleryImages:
        z
          .array(imageSchema)
          .max(
            10,
            "Gallery cannot contain more than 10 images"
          )
          .optional(),



      // ====================================
      // Status
      // ====================================

      status:
        z
          .enum([
            "draft",
            "published",
            "completed",
            "cancelled",
          ])
          .optional(),

    })

    .strict()


    // ======================================
    // At Least One Field
    // ======================================

    .refine(

      (data) =>
        Object.keys(data).length > 0,

      {

        message:
          "At least one field is required for update",

      }

    )


    // ======================================
    // Update Validation
    // ======================================

    .superRefine((data, ctx) => {


      // ====================================
      // Free Event Price
      // ====================================

      if (
        data.eventType === "free" &&
        data.ticketPrice !== undefined &&
        data.ticketPrice !== 0
      ) {

        ctx.addIssue({

          code:
            z.ZodIssueCode.custom,

          path:
            ["ticketPrice"],

          message:
            "Free events must have a ticket price of 0.",

        });

      }


      // ====================================
      // Paid Event Price
      // ====================================

      if (
        data.eventType === "paid" &&
        data.ticketPrice !== undefined &&
        data.ticketPrice <= 0
      ) {

        ctx.addIssue({

          code:
            z.ZodIssueCode.custom,

          path:
            ["ticketPrice"],

          message:
            "Paid events must have a ticket price greater than 0.",

        });

      }


      // ====================================
      // Maximum Tickets
      // ====================================

      if (
        data.totalSeats !== undefined &&
        data.maxTicketsPerUser !== undefined &&
        data.maxTicketsPerUser >
          data.totalSeats
      ) {

        ctx.addIssue({

          code:
            z.ZodIssueCode.custom,

          path:
            ["maxTicketsPerUser"],

          message:
            "Maximum tickets per user cannot exceed total seats.",

        });

      }

    }),

});



// ========================================
// Export
// ========================================

module.exports = {

  createEventSchema,

  updateEventSchema,

};