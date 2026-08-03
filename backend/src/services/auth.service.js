const bcrypt = require("bcryptjs");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");



// ****RegisterUser****


const registerUser = async (payload) => {
  console.log("registerUser called with:", payload.email);
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

// Generate Email Verification OTP
const otp = generateOTP();

user.emailVerificationOtp = otp;
user.emailVerificationOtpExpires = new Date(
  Date.now() + 5 * 60 * 1000
);

  await user.save();

  let emailSent = true;
  try {
    await sendEmail({
      to: user.email,
      subject: "EventEase Email Verification OTP",
      text: `Your email verification OTP is ${otp}. It is valid for 5 minutes.`,
    });
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
    emailSent = false;
  }

  const token = generateToken(user);

  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    user: userResponse,
    token,
    message: emailSent
      ? "User registered successfully."
      : "User registered successfully, but verification email failed to send. Please request a new OTP.",
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

  

// Generate Email Verification OTP
const otp = generateOTP();

organizer.emailVerificationOtp = otp;
organizer.emailVerificationOtpExpires = new Date(
  Date.now() + 5 * 60 * 1000
);

  await organizer.save();

  let emailSent = true;
  try {
    await sendEmail({
      to: organizer.email,
      subject: "EventEase Email Verification OTP",
      text: `Your email verification OTP is ${otp}. It is valid for 5 minutes.`,
    });
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
    emailSent = false;
  }

  const organizerResponse = organizer.toObject();

  delete organizerResponse.password;

  return {
    user: organizerResponse,

    message: emailSent
      ? "Organizer registration successful. Please wait for admin approval."
      : "Organizer registered, but verification email failed to send. Please request a new OTP later.",
  };
};



// ****LOGIN-USER***


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

    if (!user.isVerified) {
    throw new Error("Please verify your email before logging in.");
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

  let emailSent = true;
  try {
    await sendEmail(
      {
      to: user.email,
      subject: "EventEase Password Reset OTP",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      });
  } catch (emailError) {
    console.error("Failed to send password reset email:", emailError);
    emailSent = false;
  }

  return {message: emailSent
      ? "Password reset OTP has been sent to your email."
      : "Failed to send password reset email. Please try again later.",};
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


// **** SEND VERIFICATION OTP ****

const sendVerificationOtp = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.isVerified) {
    throw new Error("Email is already verified.");
  }

  const otp = generateOTP();

  user.emailVerificationOtp = otp;
  user.emailVerificationOtpExpires = new Date(
    Date.now() + 5 * 60 * 1000
  );

  await user.save();

  let emailSent = true;
  try {
    await sendEmail({
      to: user.email,
      subject: "EventEase Email Verification OTP",
      text: `Your email verification OTP is ${otp}. It is valid for 5 minutes.`,
    });
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
    emailSent = false;
  }

  return {
    message: emailSent
      ? "Verification OTP has been sent successfully."
      : "Failed to send verification email. Please try again.",
  };
};

// **** VERIFY EMAIL ****

const verifyEmail = async (payload) => {
  const user = await User.findOne({
    email: payload.email,
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.isVerified) {
    throw new Error("Email is already verified.");
  }

  if (user.emailVerificationOtp !== payload.otp) {
    throw new Error("Invalid OTP.");
  }

  if (
    !user.emailVerificationOtpExpires ||
    user.emailVerificationOtpExpires < new Date()
  ) {
    throw new Error("OTP has expired.");
  }

  user.isVerified = true;
  user.emailVerificationOtp = null;
  user.emailVerificationOtpExpires = null;

  await user.save();

  return {
    message: "Email verified successfully.",
  };
};


// **** RESEND VERIFICATION OTP ****

const resendVerificationOtp = async (payload) => {
  const user = await User.findOne({
    email: payload.email,
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.isVerified) {
    throw new Error("Email is already verified.");
  }

  const otp = generateOTP();

  user.emailVerificationOtp = otp;
  user.emailVerificationOtpExpires = new Date(
    Date.now() + 5 * 60 * 1000
  );

  await user.save();

  let emailSent = true;
  try {
    await sendEmail({
      to: user.email,
      subject: "EventEase Email Verification OTP",
      text: `Your new verification OTP is ${otp}. It is valid for 5 minutes.`,
    });
  } catch (emailError) {
    console.error("Failed to resend verification email:", emailError);
    emailSent = false;
  }

  return {
    message: emailSent
      ? "Verification OTP resent successfully."
      : "Failed to resend verification email. Please try again.",
  };
};

module.exports = {
  registerUser,
  registerOrganizer,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  sendVerificationOtp,
  verifyEmail,
  resendVerificationOtp
};




