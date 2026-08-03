const express = require("express");

const authController = require("../controllers/auth.controller");

const validateRequest = require("../middlewares/validateRequest");

const {
  registerUserSchema,
  registerOrganizerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  resendVerificationOtpSchema, } = require("../validations/auth.validation");


const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();


// ****Register User****

router.post(
  "/register",
  validateRequest(registerUserSchema),
  authController.registerUser
);



// Register Organizer


router.post(
  "/register-organizer",
  validateRequest(registerOrganizerSchema),
  authController.registerOrganizer
);





// Login

router.post(
  "/login",
  validateRequest(loginSchema),
  authController.loginUser
);


// Forgot Password

router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);


// Reset Password

router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);



// Change Password

router.patch(
  "/change-password",
  authMiddleware,
  validateRequest(changePasswordSchema),
  authController.changePassword
);



// Send Verification OTP

router.post(
  "/send-verification-otp",
  authMiddleware,
  authController.sendVerificationOtp
);


// Verify Email

router.post(
  "/verify-email",
  validateRequest(verifyEmailSchema),
  authController.verifyEmail
);


// Resend Verification OTP

router.post(
  "/resend-verification-otp",
  validateRequest(resendVerificationOtpSchema),
  authController.resendVerificationOtp
);


module.exports = router;