const mongoose = require("mongoose");
const { Schema } = mongoose;


const profileImageSchema = new Schema(
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
  { _id: false }
);


const organizationLogoSchema = new Schema(
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
  { _id: false }
);

const addressSchema = new Schema(
  {
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
      default: "",
    },
  },
  { _id: false }
);


const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "organizer", "admin"],
      default: "user",
    },

    profileImage: {
      type: profileImageSchema,
      default: () => ({}),
    },

    address: {
      type: addressSchema,
      default: () => ({}),
    },

    organizationName: {
      type: String,
      trim: true,
      default: "",
    },

    organizationLogo: {
      type: organizationLogoSchema,
      default: () => ({}),
    },

    tradeLicense: {
      type: String,
      trim: true,
      default: "",
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordOtp: {
      type: String,
      default: null,
    },

    resetPasswordOtpExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;