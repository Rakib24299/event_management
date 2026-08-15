const User = require("../models/User");
const AppError = require("../utils/AppError");



// Get Pending Organizers***

const getPendingOrganizers = async () => {
  const organizers = await User.find({
    role: "organizer",
    approvalStatus: "pending",
  })
    .select("-password")
    .sort({ createdAt: -1 });

  return organizers;
};


// Approve Organizer****

const approveOrganizer = async (organizerId) => {
  const organizer = await User.findById(organizerId);

  if (!organizer) {
    throw new AppError("Organizer not found.", 404);
  }

  if (organizer.role !== "organizer") {
    throw new AppError("This user is not an organizer.", 400);
  }

  if (organizer.approvalStatus === "approved") {
    throw new AppError("Organizer is already approved.", 400);
  }

  organizer.approvalStatus = "approved";

  await organizer.save();

  return organizer;
};

module.exports = {
  getPendingOrganizers,
  approveOrganizer,
};
