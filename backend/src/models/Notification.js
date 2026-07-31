const mongoose = require("mongoose");
const {Schema} = mongoose;


 const notificationSchema = new Schema (
    {
    user:
     {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },   
    
     title: 
    {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },

     message: 
     {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },

     type: 
    {
      type: String,
         enum: 
            [
                "event",
                "booking",
                "payment",
                "refund",
                "approval",
                "system",
            ],
      default: "system",
    },


    isRead: 
    {
      type: Boolean,
      default: false,
    },

    },
    {
        timestamps :true,
    }
 );


 const Notification = mongoose.model (
"Notification",
 notificationSchema
 );

 module.exports = Notification;