const mongoose   = require("mongoose");
const {Schema} = mongoose;

const bookingSchema = new Schema(
  {
    user :
    {
        type : Schema.Types.ObjectId,
        ref :"User",
        required : [true , "User is required"],

    },


    event :
    {
        type : Schema.Types.ObjectId,
        ref :"Event",
        required : [true , "Event is required"],
  
    },

    ticketQuantity :
    {
        type  : Number ,
        required :[true , "Ticket quantity is required"],
        min :1,
        max :[10, "You cannot buy more than 10 tickets at once"]
    },

    totalAmount :
    {
        type : Number,
        required : [true , "Total amount is required"],
        min : 0 ,
    },


    bookingStatus :
    {
        type :String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default : "pending",
    },

        bookingOtp: 
    {
        type: String,
         default: null,
    },

    bookingOtpExpires: 
    {
        type: Date,
        default: null,
    },

    isOtpVerified: 
    {
         type: Boolean,
         default: false,
    },

    qrCode:
     {
        type: String,
        default: "",
    },

    isAttended: 
    {
        type: Boolean,
        default: false,
    },

    attendanceTime: 
    {
        type: Date,
        default: null,
    },

    refundPercentage:
     {
        type: Number,
        default: 0,
    },

    refundAmount:
     {
        type: Number,
        default: 0,
    },

    refundStatus: 
    {
        type: String,
        enum: ["none", "pending", "processed"],
        default: "none",
    },

    cancelledAt:
     {
        type: Date,
        default: null,
    },

    payment :
    {
         type: Schema.Types.ObjectId,
        ref: "Payment",
        default: null,
    
    },

    
    
  },
  {
    timestamps : true,
  }
    

);



const Booking = mongoose.model("Booking", bookingSchema);


module.exports= Booking;