const mongoose = require("mongoose");

const {Schema }= mongoose;


const reviewSchema = new Schema
(
    {
    user: 
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    event:
     {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },


    booking: 
     {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking is required"],
    },


    rating:
     {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },

    review:
    {
      type: String,
      required: [true, "Review is required"],
      trim: true,
    },


    status: 
    {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
  },
  {
    timestamps: true,
  }
);



        reviewSchema.index({ user: 1, event: 1 }, { unique: true });
        
        const Review = mongoose.model("Review", reviewSchema);

        module.exports = Review;