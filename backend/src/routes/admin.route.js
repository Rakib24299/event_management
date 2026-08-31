const express =
  require("express");

const adminController =
  require("../controllers/admin.controller");

const authMiddleware =
  require("../middlewares/auth.middleware");

const roleMiddleware =
  require("../middlewares/role.middleware");


const router =
  express.Router();


// ======================================================
// Pending Organizers
// ======================================================

router.get(

  "/pending-organizers",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .getPendingOrganizers

);


// ======================================================
// Approve Organizer
// ======================================================

router.patch(

  "/approve-organizer/:id",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .approveOrganizer

);


// ======================================================
// Reject Organizer
// ======================================================

router.patch(

  "/reject-organizer/:id",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .rejectOrganizer

);


// ======================================================
// Dashboard Statistics
// ======================================================

router.get(

  "/dashboard-stats",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .getDashboardStats

);


// ======================================================
// Get All Users
// ======================================================

router.get(

  "/users",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .getAllUsers

);


// ======================================================
// Block User
// ======================================================

router.patch(

  "/users/:id/block",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .blockUser

);


// ======================================================
// Unblock User
// ======================================================

router.patch(

  "/users/:id/unblock",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .unblockUser

);


// ======================================================
// Get All Events
// ======================================================

router.get(

  "/events",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .getAllEvents

);


// ======================================================
// Delete Event
// ======================================================

router.delete(

  "/events/:id",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .deleteEventByAdmin

);


// ======================================================
// Get All Payments
// ======================================================

router.get(

  "/payments",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .getAllPayments

);


// ======================================================
// Payment Statistics
// ======================================================

router.get(

  "/payments/statistics",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .getPaymentStatistics

);


// ======================================================
// Revenue History
// ======================================================

router.get(

  "/revenue-history",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .getAdminRevenueHistory

);


// ======================================================
// Pending Refunds
// ======================================================

router.get(

  "/payments/refunds/pending",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .getPendingRefunds

);


// ======================================================
// Process Refund
// ======================================================

router.patch(

  "/payments/:id/refund",

  authMiddleware,

  roleMiddleware("admin"),

  adminController
    .processRefundByAdmin

);


// ======================================================
// Export
// ======================================================

module.exports = router;