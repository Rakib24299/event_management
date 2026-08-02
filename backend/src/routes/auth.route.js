const express = require("express");

const authController = require("../controllers/auth.controller");

const validateRequest = require("../middlewares/validateRequest");

const {
  registerUserSchema,
  registerOrganizerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,} = require("../validations/auth.validation");

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

module.exports = router;