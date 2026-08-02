const bcrypt = require("bcryptjs");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");

// ****RegisterUser****
const registerUser = async (payload) => {
  const existingUser = await User.findOne({
    email: payload.email,
  });

  if (existingUser) {
    throw new Error("User already exists with this email.");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(process.env.BCRYPT_SALT_ROUNDS || 10)
  );

  const user = await User.create({
    ...payload,
    password: hashedPassword,
  });

  const token = generateToken(user);

  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    user: userResponse,
    token,
  };
};



// ****registerOrganizer****

const registerOrganizer = async (payload) => {

  const existingUser = await User.findOne(
    {
        email: payload.email,
    });

  if (existingUser) 
    {
        throw new Error("User already exists with this email.");
    }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(process.env.BCRYPT_SALT_ROUNDS || 10)
  );

  const organizer = await User.create({
    ...payload,

    password: hashedPassword,

    role: "organizer",

    approvalStatus: "pending",
  });

  const organizerResponse = organizer.toObject();

  delete organizerResponse.password;

  return {
    user: organizerResponse,

    message:
      "Organizer registration successful. Please wait for admin approval.",
  };
};



// ****LOGINUSER***


const loginUser = async (payload) => {
  
  const user = await User.findOne(
        {
        email: payload.email,
        })
    .select("+password");

  if (!user) 
    {
        throw new Error("Invalid email or password.");
    }

 
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password
  );

  if (!isPasswordMatched) 
    {
        throw new Error("Invalid email or password.");
    }

  if (user.status === "blocked") 
    {
        throw new Error("Your account has been blocked. Please contact the admin.");
    }

  
  if (user.role === "organizer" && user.approvalStatus !== "approved") 
    {
        throw new Error("Your organizer account is pending admin approval.");
     }

  const token = generateToken(user);

 
  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    user: userResponse,
    token,
  };

};



// ****FORGOTPASSWORD****

const forgotPassword = async (payload) => {
 
  const user = await User.findOne(
    {
    email: payload.email,
  });

  if (!user) 
    {
        throw new Error("No account found with this email.");
    }

 
  const otp = generateOTP();


  user.resetPasswordOtp = otp;
  user.resetPasswordOtpExpires = new Date(Date.now() + 5 * 60 * 1000);

  await user.save();

  
  await sendEmail(
    {
    to: user.email,
    subject: "EventEase Password Reset OTP",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

  return {message: "Password reset OTP has been sent to your email.",};
};




// ****RESET_PASSWORD***

const resetPassword = async (payload) => {
  const user = await User.findOne(
    {
     email: payload.email,
    })
    .select("+password");

  if (!user) 
    {
    throw new Error("No account found with this email.");
    }

 
  if (user.resetPasswordOtp !== payload.otp) 
    
{
    throw new Error("Invalid OTP.");
  }

  
  if (
    !user.resetPasswordOtpExpires ||
    user.resetPasswordOtpExpires < new Date()
  ) {
    throw new Error("OTP has expired.");
  }


  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(process.env.BCRYPT_SALT_ROUNDS || 10)
  );

  
  user.password = hashedPassword;

  
  user.resetPasswordOtp = null;
  user.resetPasswordOtpExpires = null;

  await user.save();

  return {
    message: "Password has been reset successfully.",
  };
};


// ****CHANGE_PASSWORD****

const changePassword = async (userId, payload) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new Error("User not found.");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.currentPassword,
    user.password
  );

  if (!isPasswordMatched) {
    throw new Error("Current password is incorrect.");
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(process.env.BCRYPT_SALT_ROUNDS || 10)
  );

  user.password = hashedPassword;

  await user.save();

  return {
    message: "Password changed successfully.",
  };
};

module.exports = {
  registerUser,
  registerOrganizer,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
};




