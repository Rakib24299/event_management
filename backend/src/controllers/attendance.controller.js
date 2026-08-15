const attendanceService = require("../services/attendance.service");
const catchAsync = require("../utils/catchAsync");


// ======================================================
// Scan QR Code & Mark Attendance
// ======================================================

const scanQRCode = catchAsync(async (req, res) => {

  const result =
    await attendanceService.scanQRCode(
      req.body.qrData
    );

  return res.status(200).json({
    success: true,
    message: "Attendance marked successfully.",
    data: result,
  });
});


module.exports = {
  scanQRCode,
};