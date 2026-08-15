const express = require("express");

const adminController = require("../controllers/admin.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();


// Get Pending Organizers***


router.get(
  "/pending-organizers",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getPendingOrganizers
);

// Approve Organizer
router.patch(
  "/approve-organizer/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.approveOrganizer
);

module.exports = router;