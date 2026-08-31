const mongoose = require("mongoose");
const { Schema } = mongoose;


// ========================================
// Banner Image Schema
// ========================================

const bannerImageSchema = new Schema(
    {
        url: {
            type: String,
            default: "",
        },

        publicId: {
            type: String,
            default: "",
        },
    },
    {
        _id: false,
    }
);


// ========================================
// Gallery Image Schema
// ========================================

const galleryImageSchema = new Schema(
    {
        url: {
            type: String,
            default: "",
        },

        publicId: {
            type: String,
            default: "",
        },
    },
    {
        _id: false,
    }
);


// ========================================
// Venue Schema
// ========================================

const venueSchema = new Schema(
    {
        venueName: {
            type: String,
            required: [true, "Venue name is required"],
            trim: true,
        },

        street: {
            type: String,
            trim: true,
            default: "",
        },

        city: {
            type: String,
            trim: true,
            default: "",
        },

        country: {
            type: String,
            trim: true,
            default: "Bangladesh",
        },
    },
    {
        _id: false,
    }
);


// ========================================
// Event Schema
// ========================================

const eventSchema = new Schema(
    {
        // ====================================
        // Event Title
        // ====================================

        title: {
            type: String,
            required: [true, "Event title is required"],
            trim: true,
        },


        // ====================================
        // Event Slug
        // ====================================

        slug: {
            type: String,
            required: [true, "Event slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },


        // ====================================
        // Organizer
        // ====================================

        organizer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Organizer is required"],
        },


        // ====================================
        // Category
        // ====================================

        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },


        // ====================================
        // Description
        // ====================================

        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },


        // ====================================
        // Venue
        // ====================================

        venue: {
            type: venueSchema,
            required: true,
            default: () => ({}),
        },


        // ====================================
        // Event Date
        // ====================================

        eventDate: {
            type: Date,
            required: [true, "Event date is required"],
        },


        // ====================================
        // Start Time
        // ====================================

        startTime: {
            type: String,
            required: [true, "Start time is required"],
        },


        // ====================================
        // End Time
        // ====================================

        endTime: {
            type: String,
            required: [true, "End time is required"],
        },


        // ====================================
        // Event Type
        // ====================================

        eventType: {
            type: String,
            enum: ["free", "paid"],
            default: "paid",
        },


        // ====================================
        // Ticket Price
        // ====================================

        ticketPrice: {
            type: Number,
            default: 0,
            min: 0,
        },


        // ====================================
        // Total Seats
        // ====================================

        totalSeats: {
            type: Number,
            required: [true, "Total seats are required"],
            min: 1,
        },


        // ====================================
        // Available Seats
        // ====================================

        availableSeats: {
            type: Number,
            required: [true, "Available seats are required"],
            min: 0,
        },


        // ====================================
        // Maximum Tickets Per User
        // ====================================

        maxTicketsPerUser: {
            type: Number,
            default: 5,
            min: 1,
        },


        // ====================================
        // Banner Image
        // ====================================

        bannerImage: {
            type: bannerImageSchema,
            default: () => ({}),
        },


        // ====================================
        // Gallery Images
        // ====================================

        galleryImages: {
            type: [galleryImageSchema],
            default: [],
        },


        // ========================================
        // Event Status
        // ========================================
        //
        // draft
        // published
        // completed
        // cancelled
        // rejected
        //
        // ========================================

        status: {
            type: String,

            enum: [
                "draft",
                "published",
                "completed",
                "cancelled",
                "rejected",
            ],

            default: "draft",
        },


        // ====================================
        // Average Rating
        // ====================================

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },


        // ====================================
        // Total Reviews
        // ====================================

        totalReviews: {
            type: Number,
            default: 0,
            min: 0,
        },


        // ====================================
        // Soft Delete
        // ====================================

        isDeleted: {
            type: Boolean,
            default: false,
        },


        // ====================================
        // Deleted At
        // ====================================

        deletedAt: {
            type: Date,
            default: null,
        },


        // ====================================
        // Deleted By
        // ====================================

        deletedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },

    {
        timestamps: true,
    }
);


// ========================================
// Event Model
// ========================================

const Event = mongoose.model(
    "Event",
    eventSchema
);


module.exports = Event;