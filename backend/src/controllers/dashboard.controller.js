const dashboardService = require("../services/dashboard.service");
const catchAsync = require("../utils/catchAsync");

// Admin Dashboard

const getAdminDashboard = catchAsync(async (req, res) => {
  const result = await dashboardService.getAdminDashboard();

  return res.status(200).json({
    success: true,
    message: "Admin dashboard fetched successfully.",
    data: result,
  });
});



// Organizer Dashboard

const getOrganizerDashboard = catchAsync(async (req, res) => {
  const result = await dashboardService.getOrganizerDashboard(
    req.user.id
  );

  return res.status(200).json({
    success: true,
    message: "Organizer dashboard fetched successfully.",
    data: result,
  });
});


// User Dashboard

const getUserDashboard = catchAsync(async (req, res) => {
  const result = await dashboardService.getUserDashboard(
    req.user.id
  );

  return res.status(200).json({
    success: true,
    message: "User dashboard fetched successfully.",
    data: result,
  });
});


module.exports = {
  getAdminDashboard,
  getOrganizerDashboard,
  getUserDashboard,
};