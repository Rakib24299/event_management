const express = require("express");

const dashboardController = require("../controllers/dashboard.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();


// Admin Dashboard


router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  dashboardController.getAdminDashboard
);


// Organizer Dashboard


router.get(
  "/organizer",
  authMiddleware,
  roleMiddleware("organizer"),
  dashboardController.getOrganizerDashboard
);

// User Dashboard

router.get(
  "/user",
  authMiddleware,
  roleMiddleware("user"),
  dashboardController.getUserDashboard
);

module.exports = router;