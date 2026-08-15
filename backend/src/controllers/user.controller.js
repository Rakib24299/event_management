const userService = require("../services/user.service");
const catchAsync = require("../utils/catchAsync");

// Get My Profile

const getMyProfile = catchAsync(async (req, res) => {
  const result = await userService.getMyProfile(req.user.id);

  return res.status(200).json({
    success: true,
    message: "Profile fetched successfully.",
    data: result,
  });
});

// Update My Profile

const updateMyProfile = catchAsync(async (req, res) => {
  const result = await userService.updateMyProfile(
    req.user.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: result,
  });
});

// Upload Profile Image

const uploadProfileImage = catchAsync(async (req, res) => {
  const result = await userService.uploadProfileImage(
    req.user.id,
    req.file
  );

  return res.status(200).json({
    success: true,
    message: "Profile image uploaded successfully.",
    data: result,
  });
});


// Delete Profile Image***
const deleteProfileImage = catchAsync(async (req, res) => {
  const result = await userService.deleteProfileImage(
    req.user.id
  );

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});



// Upload Organization Logo***


const uploadOrganizationLogo = catchAsync(async (req, res) => {
  const result = await userService.uploadOrganizationLogo(
    req.user.id,
    req.file
  );

  return res.status(200).json({
    success: true,
    message: "Organization logo uploaded successfully.",
    data: result,
  });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  deleteProfileImage,
  uploadOrganizationLogo,
};