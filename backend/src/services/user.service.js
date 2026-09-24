const User = require("../models/User");
const AppError = require("../utils/AppError");
const uploadToCloudinary = require("../utils/uploadToCloudinary");



// const cloudinary = require("../config/cloudinary");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");

// Get My Profile
const getMyProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
};



// Update My Profile
const updateMyProfile = async (userId, payload) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  user.name = payload.name ?? user.name;
  user.phone = payload.phone ?? user.phone;
  user.address = payload.address ?? user.address;

  await user.save();

  return user;
};




// Upload Profile Image

const uploadProfileImage = async (userId, file) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (!file) {
    throw new AppError("Please upload an image.", 400);
  }



  // image delete
  // delete image
  // Delete old image if exists
  if (user.profileImage?.publicId) {
    await deleteFromCloudinary(user.profileImage.publicId);
  }

  // Upload new image
  const uploadedImage = await uploadToCloudinary(
    file.buffer,
    "eventease/profile-images"
  );

  user.profileImage = {
    url: uploadedImage.url,
    publicId: uploadedImage.publicId,
  };

  await user.save();

  return user;
};



// Delete Profile Image****

const deleteProfileImage = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (!user.profileImage.publicId) {
    throw new AppError("No profile image found.", 404);
  }

  // Delete image from Cloudinary
  await deleteFromCloudinary(user.profileImage.publicId);

  // Remove image info from database
  user.profileImage = {
    url: "",
    publicId: "",
  };

  await user.save();

  return {
    message: "Profile image deleted successfully.",
  };
};


// Upload Organization Logo***


const uploadOrganizationLogo = async (userId, file) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (user.role !== "organizer") {
    throw new AppError(
      "Only organizers can upload organization logo.",
      403
    );
  }

  if (!file) {
    throw new AppError("Please upload a logo.", 400);
  }

  // Delete old logo
  if (user.organizationLogo?.publicId) {
    await deleteFromCloudinary(user.organizationLogo.publicId);
  }

  // Upload new logo
  const uploadedLogo = await uploadToCloudinary(
    file.buffer,
    "eventease/organization-logos"
  );

  user.organizationLogo = {
    url: uploadedLogo.url,
    publicId: uploadedLogo.publicId,
  };

  await user.save();

  return user;
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
   deleteProfileImage,
    uploadOrganizationLogo,
};