const mongoose = require("mongoose");

const { Schema } = mongoose;



const paymentSchema = new Schema(

    {

    booking: 
    {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: [true, "Booking is required"],
    },

     user: 
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },

    amount:
    {
        type: Number,
        required: [true, "Payment amount is required"],
        min: 0,
    },


    transactionId: 
    {
        type: String,
         unique: true,
         sparse: true, 
         trim: true,
         default: null,
    },

    bankTransactionId: {
            type: String,
            trim: true,
            default: null,
            },

    valId: 
{
            type: String,
            trim: true,
            default: null,
                },


paymentMethod:
{
    type: String,
    enum: [
        "bkash",
        "nagad",
        "rocket",
        "card",
        "cash",
        "sslcommerz"
    ],
    required: [true, "Payment method is required"],
},



    currency:
    {
        type: String,
        default: "BDT",
        uppercase: true,
        trim: true,
    },

    paymentGateway: {
  type: String,
  default: "SSLCommerz",
},

    


    paymentStatus:
     {
        type: String,
        enum: ["pending","processing","paid","failed","cancelled","refunded",],
         default: "pending",
    },


    refundAmount:
    {
        type: Number,
        default: 0,
        min: 0,
    },

    refundDate: 
    {
        type: Date,
        default: null,
    },


    paymentDate:
    {
        type: Date,
        default: Date.now,
    },
    gatewayResponse: {
  type: Schema.Types.Mixed,
  default: null,
},

paidAt: {
  type: Date,
  default: null,
},

    },

    {
        timestamps : true,
    }
);



  
        
        const Payment = mongoose.model("Payment", paymentSchema);

        module.exports = Payment;