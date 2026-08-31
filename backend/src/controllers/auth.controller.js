const authService = require("../services/auth.service");
const catchAsync = require("../utils/catchAsync");


// ***Register User***

const registerUser = catchAsync(async (req, res) => {
  const result = await authService.registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: "User registered successfully.",
    data: result,
  });
});



// ***Register Organizer***

const registerOrganizer = catchAsync(async (req, res) => {

    const result = await authService.registerOrganizer(req.body);

    return res.status(201).json({
      success: true,
      message: "Organizer registered successfully.",
      data: result,
    });
  
});

// ***Login User***
const loginUser = catchAsync(async (req, res) => {

      const result = await authService.loginUser(req.body);

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        data: result,
      });
    
  });

// Forgot Password

const forgotPassword = catchAsync(async (req, res) => {
  const result = await authService.forgotPassword(req.body);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});



// Reset Password

const resetPassword = catchAsync(async (req, res) => {
  const result = await authService.resetPassword(req.body);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});




// ****Change Password****

const changePassword = catchAsync(async (req, res) => {
  const result = await authService.changePassword(
    req.user.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});



// **** SEND VERIFICATION OTP ****

const sendVerificationOtp = catchAsync(async (req, res) => {
  const result = await authService.sendVerificationOtp(
    req.user.id
  );

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});




// **** VERIFY EMAIL ****

const verifyEmail = catchAsync(async (req, res) => {
  const result = await authService.verifyEmail(req.body);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});



// **** RESEND VERIFICATION OTP ****

const resendVerificationOtp = catchAsync(async (req, res) => {
  const result = await authService.resendVerificationOtp(
    req.body
  );

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});



module.exports = {
  registerUser,
  registerOrganizer,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  sendVerificationOtp,
  verifyEmail,
  resendVerificationOtp,

};