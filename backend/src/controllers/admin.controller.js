const adminService =
  require("../services/admin.service");

const catchAsync =
  require("../utils/catchAsync");


// ======================================================
// Get Pending Organizers
// ======================================================

const getPendingOrganizers =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .getPendingOrganizers();

    return res.status(200).json({

      success: true,

      message:
        "Pending organizers fetched successfully.",

      data:
        result,

    });

  });


// ======================================================
// Approve Organizer
// ======================================================

const approveOrganizer =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .approveOrganizer(
          req.params.id
        );

    return res.status(200).json({

      success: true,

      message:
        "Organizer approved successfully.",

      data:
        result,

    });

  });


// ======================================================
// Reject Organizer
// ======================================================

const rejectOrganizer =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .rejectOrganizer(
          req.params.id
        );

    return res.status(200).json({

      success: true,

      message:
        "Organizer rejected successfully.",

      data:
        result,

    });

  });


// ======================================================
// Dashboard Statistics
// ======================================================

const getDashboardStats =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .getDashboardStats();

    return res.status(200).json({

      success: true,

      message:
        "Dashboard statistics fetched successfully.",

      data:
        result,

    });

  });


// ======================================================
// Get All Users
// ======================================================

const getAllUsers =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .getAllUsers();

    return res.status(200).json({

      success: true,

      message:
        "Users fetched successfully.",

      data:
        result,

    });

  });


// ======================================================
// Block User
// ======================================================

const blockUser =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .blockUser(
          req.params.id
        );

    return res.status(200).json({

      success: true,

      message:
        "User blocked successfully.",

      data:
        result,

    });

  });


// ======================================================
// Unblock User
// ======================================================

const unblockUser =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .unblockUser(
          req.params.id
        );

    return res.status(200).json({

      success: true,

      message:
        "User unblocked successfully.",

      data:
        result,

    });

  });


// ======================================================
// Get All Events
// ======================================================

const getAllEvents =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .getAllEvents();

    return res.status(200).json({

      success: true,

      message:
        "Events fetched successfully.",

      data:
        result,

    });

  });


// ======================================================
// Delete Event By Admin
// ======================================================

const deleteEventByAdmin =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .deleteEventByAdmin(

          req.params.id,

          req.user.id

        );

    return res.status(200).json({

      success: true,

      message:
        result.message,

    });

  });


// ======================================================
// Get All Payments
// ======================================================

const getAllPayments =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .getAllPayments();

    return res.status(200).json({

      success: true,

      message:
        "Payments fetched successfully.",

      data:
        result,

    });

  });


// ======================================================
// Get Payment Statistics
// ======================================================

const getPaymentStatistics =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .getPaymentStatistics();

    return res.status(200).json({

      success: true,

      message:
        "Payment statistics fetched successfully.",

      data:
        result,

    });

  });


// ======================================================
// Get Admin Revenue History
// ======================================================

const getAdminRevenueHistory =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .getAdminRevenueHistory();

    return res.status(200).json({

      success: true,

      message:
        "Revenue history fetched successfully.",

      data:
        result,

    });

  });


// ======================================================
// Get Pending Refunds
// ======================================================

const getPendingRefunds =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .getPendingRefunds();

    return res.status(200).json({

      success: true,

      message:
        "Pending refunds fetched successfully.",

      data:
        result,

    });

  });


// ======================================================
// Process Refund By Admin
// ======================================================

const processRefundByAdmin =
  catchAsync(async (req, res) => {

    const result =
      await adminService
        .processRefundByAdmin(
          req.params.id
        );

    return res.status(200).json({

      success: true,

      message:
        result.message,

      data: {

        payment:
          result.payment,

        booking:
          result.booking,

      },

    });

  });


// ======================================================
// Export
// ======================================================

module.exports = {

  getPendingOrganizers,

  approveOrganizer,

  rejectOrganizer,

  getDashboardStats,

  getAllUsers,

  blockUser,

  unblockUser,

  getAllEvents,

  deleteEventByAdmin,

  getAllPayments,

  getPaymentStatistics,

  getAdminRevenueHistory,

  getPendingRefunds,

  processRefundByAdmin,

};