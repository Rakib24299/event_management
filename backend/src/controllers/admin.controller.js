const adminService = require("../services/admin.service");
const catchAsync = require("../utils/catchAsync");

// Get Pending Organizers***
const getPendingOrganizers = catchAsync(async (req, res) => {
  const result = await adminService.getPendingOrganizers();

  return res.status(200).json({
    success: true,
    message: "Pending organizers fetched successfully.",
    data: result,
  });
});

// Approve Organizer***

const approveOrganizer = catchAsync(async (req, res) => {
  const result = await adminService.approveOrganizer(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Organizer approved successfully.",
    data: result,
  });
});

module.exports = {
  getPendingOrganizers,
  approveOrganizer,
};