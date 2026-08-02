const mongoose = require ("mongoose")
const {Schema} = mongoose;


const bannerImageSchema = new Schema (

    {
        url :
        {
            type : String,
            default :"",
        },
        publicId :
        {
            type : String,
            default :"",
        },

    },
    {_id : false}
);

const galleryImageSchema = new Schema(

    {
        url :
        {
            type : String,
            default:"",
        },


        publicId:
        {
            type : String,
            default:"",
        },
    },

    {_id : false}
);


const venueSchema = new Schema(
    {
        venueName :
        {
            type: String,
            required: [true, "Venue name is required"],
            trim: true,
        },


        street :
        {
            type: String,
             trim: true,
             default:"",
        },

        city :
        {
            type: String,
            trim: true,
            default:"",
        },

        country :
        {
            type: String,
            trim: true,
            default:"Bangladesh",
        },


    },

    {_id: false}


);

const eventSchema = new Schema(
    {
        title:
        {
            type: String,
            required: [true ,"Event title is required"],
            trim : true,
        },

        slug :
        {
            type: String,
            required: [true ,"Event slug is required"],
            unique : true ,
            lowercase :true,
            trim : true,
        },

         organizer: 
         {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Organizer is required"],
         },

         category: 
        {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },

       
         description: 
        {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
         venue: 
           {
            type: venueSchema,
            required: true,
            default: () => ({}),
             },

        eventDate:
            {
            type: Date,
            required: [true, "Event date is required"],
            },

         startTime: 
            {
            type: String,
            required: [true, "Start time is required"],
            },

        endTime: 
            {
            type: String,
            required: [true, "End time is required"],
            },

        eventType: 
            {
            type: String,
            enum: ["free", "paid"],
            default: "paid",
            },


        ticketPrice: 
            {
            type: Number,
            required: [true, "Ticket price is required"],
            min: 0,
            },

         totalSeats:
            {
            type: Number,
            required: [true, "Total seats are required"],
            min: 1,
            },

         availableSeats: 
            {
            type: Number,
            required: [true, "Available seats are required"],
            min: 0,
            },

         maxTicketsPerUser:
            {
            type: Number,
            default: 5,
            min: 1,
            },

         bannerImage:
            {
            type: bannerImageSchema,
            default: () => ({}),
            },

         galleryImages: 
            {
            type: [galleryImageSchema],
            default: [],
            },

        status: 
            {
            type: String,
            enum: ["draft", "published", "completed", "cancelled"],
            default: "draft",
            },

        averageRating:
            {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
            },

         totalReviews:
            {
            type: Number,
            default: 0,
            min: 0,
            },

        isDeleted:
            {
            type: Boolean,
            default: false,
            },

        deletedAt: 
            {
            type: Date,
            default: null,
            },

         deletedBy: 
            {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
            },

    },
    {timestamps:true }
)

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;