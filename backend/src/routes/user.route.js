const express = require("express");

const userController = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");
const upload = require("../middlewares/upload.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  updateProfileSchema,
} = require("../validations/user.validation");

const router = express.Router();


// Get My Profile

router.get(
  "/me",
  authMiddleware,
  userController.getMyProfile
);

// Update My Profile

router.patch(
  "/update-profile",
  authMiddleware,
  validateRequest(updateProfileSchema),
  userController.updateMyProfile
);


// upload profile
router.patch(
  "/profile-image",
  authMiddleware,
  upload.single("profileImage"),
  userController.uploadProfileImage
);

// Delete Profile Image

router.delete(
  "/profile-image",
  authMiddleware,
  userController.deleteProfileImage
);

router.patch(
  "/organization-logo",
  authMiddleware,
  upload.single("organizationLogo"),
  userController.uploadOrganizationLogo
);

// Upload Organization Logo

router.patch(
  "/organization-logo",
  authMiddleware,
  roleMiddleware("organizer"),
  upload.single("organizationLogo"),
  userController.uploadOrganizationLogo
);

// Upload Organization Logo

router.patch(
  "/organization-logo",
  authMiddleware,
  roleMiddleware("organizer"),
  upload.single("organizationLogo"),
  userController.uploadOrganizationLogo
);

module.exports = router;