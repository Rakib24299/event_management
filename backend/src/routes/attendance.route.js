const express = require("express");

const attendanceController = require("../controllers/attendance.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();


// ======================================================
// Scan QR Code & Mark Attendance
// ======================================================

router.post(
  "/scan",
  authMiddleware,
  roleMiddleware("admin", "organizer"),
  attendanceController.scanQRCode
);


module.exports = router;