const dashboardService = require("../services/dashboard.service");


// Admin Dashboard 

const getAdminDashboard = async (req, res) => {
  try {
    const result = await dashboardService.getAdminDashboard();

    return res.status(200).json({
      success: true,
      message: "Admin dashboard fetched successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Organizer Dashboard


const getOrganizerDashboard = async (req, res) => {
  try {
    const result = await dashboardService.getOrganizerDashboard(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Organizer dashboard fetched successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// User Dashboard


const getUserDashboard = async (req, res) => {
  try {
    const result = await dashboardService.getUserDashboard(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "User dashboard fetched successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  getAdminDashboard,
  getOrganizerDashboard,
  getUserDashboard,
};