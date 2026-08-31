const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Category = require("../models/Category");
const AppError = require("../utils/AppError");
const slugify = require("slugify");

const {
  createBulkNotifications,
} = require("./notification.service");


// ========================================
// Get Pending Organizers
// ========================================

const getPendingOrganizers = async () => {

  const organizers = await User.find({
    role: "organizer",
    approvalStatus: "pending",
  })
    .select("-password")
    .sort({
      createdAt: -1,
    });

  return organizers;
};


// ========================================
// Approve Organizer
// ========================================

const approveOrganizer = async (
  organizerId
) => {

  const organizer =
    await User.findById(
      organizerId
    );

  if (!organizer) {

    throw new AppError(
      "Organizer not found.",
      404
    );

  }


  if (organizer.role !== "organizer") {

    throw new AppError(
      "This user is not an organizer.",
      400
    );

  }


  if (
    organizer.approvalStatus ===
    "approved"
  ) {

    throw new AppError(
      "Organizer is already approved.",
      400
    );

  }


  if (
    organizer.approvalStatus ===
    "rejected"
  ) {

    throw new AppError(
      "This organizer was already rejected.",
      400
    );

  }


  // ======================================
  // Approve Organizer
  // ======================================

  organizer.approvalStatus =
    "approved";


  await organizer.save();


  // ======================================
  // Notification To Organizer
  // ======================================

  await createBulkNotifications({

    users: [
      organizer._id,
    ],

    title:
      "Organizer Account Approved",

    message:
      "Your organizer account has been approved by the admin. You can now use organizer features and publish your events.",

    type:
      "approval",

  });


  return organizer;
};


// ========================================
// Reject Organizer
// ========================================

const rejectOrganizer = async (
  organizerId
) => {

  const organizer =
    await User.findById(
      organizerId
    );

  if (!organizer) {

    throw new AppError(
      "Organizer not found.",
      404
    );

  }


  if (organizer.role !== "organizer") {

    throw new AppError(
      "This user is not an organizer.",
      400
    );

  }


  if (
    organizer.approvalStatus ===
    "rejected"
  ) {

    throw new AppError(
      "Organizer is already rejected.",
      400
    );

  }


  if (
    organizer.approvalStatus ===
    "approved"
  ) {

    throw new AppError(
      "Approved organizer cannot be rejected from this action.",
      400
    );

  }


  // ======================================
  // Reject Organizer
  // ======================================

  organizer.approvalStatus =
    "rejected";


  await organizer.save();


  // ======================================
  // Notification To Organizer
  // ======================================

  await createBulkNotifications({

    users: [
      organizer._id,
    ],

    title:
      "Organizer Account Rejected",

    message:
      "Your organizer account request has been rejected by the admin.",

    type:
      "approval",

  });


  return organizer;
};


// ========================================
// Get Admin Dashboard Statistics
// ========================================

const getDashboardStats = async () => {

  // ======================================
  // Total Users
  // ======================================

  const totalUsers =
    await User.countDocuments({

      role: "user",

      status: "active",

    });


  // ======================================
  // Total Organizers
  // ======================================

  const totalOrganizers =
    await User.countDocuments({

      role: "organizer",

    });


  // ======================================
  // Pending Organizers
  // ======================================

  const pendingOrganizers =
    await User.countDocuments({

      role: "organizer",

      approvalStatus: "pending",

    });


  // ======================================
  // Total Events
  // ======================================

  const totalEvents =
    await Event.countDocuments({

      isDeleted: false,

    });


  // ======================================
  // Active / Published Events
  // ======================================

  const activeEvents =
    await Event.countDocuments({

      isDeleted: false,

      status: "published",

    });


  // ======================================
  // Completed Events
  // ======================================

  const completedEvents =
    await Event.countDocuments({

      isDeleted: false,

      status: "completed",

    });


  // ======================================
  // Pending Events
  // ======================================

  const pendingEvents =
    await Event.countDocuments({

      isDeleted: false,

      status: "draft",

    });


  // ======================================
  // Rejected Events
  // ======================================

  const rejectedEvents =
    await Event.countDocuments({

      isDeleted: false,

      status: "rejected",

    });


  // ======================================
  // Total Bookings
  // ======================================

  const totalBookings =
    await Booking.countDocuments();


  // ======================================
  // Confirmed Bookings
  // ======================================

  const confirmedBookings =
    await Booking.countDocuments({

      bookingStatus:
        "confirmed",

    });


  // ======================================
  // Total Tickets Sold
  // ======================================

  const ticketResult =
    await Booking.aggregate([

      {
        $match: {

          bookingStatus:
            "confirmed",

        },

      },

      {
        $group: {

          _id: null,

          totalTickets: {

            $sum:
              "$ticketQuantity",

          },

        },

      },

    ]);


  const totalTickets =
    ticketResult.length > 0
      ? ticketResult[0].totalTickets
      : 0;


  // ======================================
  // Total Revenue
  // ======================================

  const revenueResult =
    await Booking.aggregate([

      {
        $match: {

          bookingStatus:
            "confirmed",

        },

      },

      {
        $group: {

          _id: null,

          totalRevenue: {

            $sum:
              "$totalAmount",

          },

        },

      },

    ]);


  const totalRevenue =
    revenueResult.length > 0
      ? revenueResult[0].totalRevenue
      : 0;


  // ======================================
  // Return Statistics
  // ======================================

  return {

    totalUsers,

    totalOrganizers,

    pendingOrganizers,

    totalEvents,

    activeEvents,

    completedEvents,

    pendingEvents,

    rejectedEvents,

    totalBookings,

    confirmedBookings,

    totalTickets,

    totalRevenue,

  };

};


// ========================================
// Get All Users
// ========================================

const getAllUsers = async () => {

  const users =
    await User.find({

      role: {

        $in: [
          "user",
          "organizer",
        ],

      },

    })
      .select("-password")
      .sort({
        createdAt: -1,
      });

  return users;
};


// ========================================
// Block User
// ========================================

const blockUser = async (
  userId
) => {

  const user =
    await User.findById(
      userId
    );

  if (!user) {

    throw new AppError(
      "User not found.",
      404
    );

  }


  if (user.role === "admin") {

    throw new AppError(
      "Admin user cannot be blocked.",
      403
    );

  }


  if (
    user.status ===
    "blocked"
  ) {

    throw new AppError(
      "User is already blocked.",
      400
    );

  }


  user.status =
    "blocked";


  await user.save();


  return user;
};


// ========================================
// Unblock User
// ========================================

const unblockUser = async (
  userId
) => {

  const user =
    await User.findById(
      userId
    );

  if (!user) {

    throw new AppError(
      "User not found.",
      404
    );

  }


  if (
    user.status ===
    "active"
  ) {

    throw new AppError(
      "User is already active.",
      400
    );

  }


  user.status =
    "active";


  await user.save();


  return user;
};


// ========================================
// Get Single Event
// ========================================

const getSingleEvent = async (
  eventId,
  userRole = null
) => {

  const event =
    await Event.findById(
      eventId
    )
      .populate(
        "organizer",
        "name email organizationName"
      )
      .populate(
        "category",
        "name"
      );


  if (
    !event ||
    event.isDeleted
  ) {

    throw new AppError(
      "Event not found.",
      404
    );

  }


  if (
    !userRole ||
    (userRole !== "admin" &&
      userRole !== "organizer")
  ) {

    if (
      event.status !==
      "published"
    ) {

      throw new AppError(
        "Event not found.",
        404
      );

    }

  }


  return event;

};


// ========================================
// Get All Events For Admin
// ========================================

const getAllEvents = async () => {

  const events =
    await Event.find({

      isDeleted: false,

      status: "published",

    })
      .populate(
        "organizer",
        "name email organizationName"
      )
      .populate(
        "category",
        "name"
      )
      .sort({
        createdAt: -1,
      });

  return events;
};


// ========================================
// Get Pending Events
// ========================================
// Organizer created events have
// status = "draft"
// Admin can approve or reject them.
// ========================================

const getPendingEvents = async () => {

  const events =
    await Event.find({

      isDeleted: false,

      status: "draft",

    })
      .populate(
        "organizer",
        "name email organizationName"
      )
      .populate(
        "category",
        "name"
      )
      .sort({
        createdAt: -1,
      });

  return events;
};


// ========================================
// Approve Event
// ========================================

const approveEvent = async (
  eventId
) => {

  const event =
    await Event.findById(
      eventId
    );

  if (!event || event.isDeleted) {

    throw new AppError(
      "Event not found.",
      404
    );

  }


  if (
    event.status ===
    "published"
  ) {

    throw new AppError(
      "Event is already published.",
      400
    );

  }


  if (
    event.status ===
    "rejected"
  ) {

    throw new AppError(
      "Rejected event cannot be approved from this action.",
      400
    );

  }


  if (
    event.status !==
    "draft"
  ) {

    throw new AppError(
      `Event cannot be approved because its current status is "${event.status}".`,
      400
    );

  }


  // ======================================
  // Publish Event
  // ======================================

  event.status =
    "published";


  await event.save();


  // ======================================
  // Notify All Active Users
  // ======================================

  const users =
    await User.find({

      status: "active",

      role: "user",

    })
      .select("_id");


  const userIds =
    users.map(
      (user) =>
        user._id
    );


  if (
    userIds.length > 0
  ) {

    await createBulkNotifications({

      users: userIds,

      title:
        "New Event Published",

      message:
        `${event.title} has been approved and published. Check it out now.`,

      type:
        "event",

    });

  }


  // ======================================
  // Notify Organizer
  // ======================================

  await createBulkNotifications({

    users: [
      event.organizer,
    ],

    title:
      "Event Approved",

    message:
      `Your event "${event.title}" has been approved by the admin and is now published.`,

    type:
      "approval",

  });


  return event;
};


// ========================================
// Reject Event
// ========================================

const rejectEvent = async (
  eventId
) => {

  const event =
    await Event.findById(
      eventId
    );

  if (!event || event.isDeleted) {

    throw new AppError(
      "Event not found.",
      404
    );

  }


  if (
    event.status ===
    "rejected"
  ) {

    throw new AppError(
      "Event is already rejected.",
      400
    );

  }


  if (
    event.status ===
    "published"
  ) {

    throw new AppError(
      "Published event cannot be rejected from this action.",
      400
    );

  }


  if (
    event.status !==
    "draft"
  ) {

    throw new AppError(
      `Event cannot be rejected because its current status is "${event.status}".`,
      400
    );

  }


  // ======================================
  // Reject Event
  // ======================================

  event.status =
    "rejected";


  await event.save();


  // ======================================
  // Notify Organizer
  // ======================================

  await createBulkNotifications({

    users: [
      event.organizer,
    ],

    title:
      "Event Rejected",

    message:
      `Your event "${event.title}" has been rejected by the admin.`,

    type:
      "approval",

  });


  return event;
};


// ========================================
// Delete Event By Admin
// Soft Delete
// ========================================

const deleteEventByAdmin = async (
  eventId,
  adminId
) => {

  const event =
    await Event.findById(
      eventId
    );

  if (
    !event ||
    event.isDeleted
  ) {

    throw new AppError(
      "Event not found.",
      404
    );

  }


  // ======================================
  // Soft Delete
  // ======================================

  event.isDeleted =
    true;

  event.deletedAt =
    new Date();

  event.deletedBy =
    adminId;


  await event.save();


  return {

    message:
      "Event deleted successfully.",

  };

};


// ========================================
// Create Event
// Organizer + Admin
// ========================================

const createEvent = async (
  data,
  organizerId
) => {

  const {
    title,
    slug,
    category,
    description,
    venue,
    eventDate,
    startTime,
    endTime,
    eventType,
    ticketPrice,
    totalSeats,
    maxTicketsPerUser,
    bannerImage,
    galleryImages,
  } = data;


  // ======================================
  // Verify Category Exists
  // ======================================

  const categoryExists =
    await Category.findById(
      category
    );

  if (
    !categoryExists ||
    categoryExists.isDeleted
  ) {

    throw new AppError(
      "Selected category does not exist.",
      400
    );

  }


  // ======================================
  // Generate Safe, Unique Slug
  // ======================================

  const baseSlug =
    slug &&
    slug.trim()
      ? slug
          .trim()
          .toLowerCase()
      : slugify(
          title,
          {
            lower: true,
            strict: true,
          }
        );

  let uniqueSlug = baseSlug;
  let counter = 1;

  while (
    await Event.findOne({
      slug: uniqueSlug,
    })
  ) {

    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;

  }


  // ======================================
  // Create Event
  // ======================================

  const event = await Event.create({

    title: title.trim(),

    slug: uniqueSlug,

    organizer: organizerId,

    category,

    description:
      description.trim(),

    venue: {

      venueName:
        venue?.venueName?.trim() ||
        "",

      street:
        venue?.street || "",

      city:
        venue?.city || "",

      country:
        venue?.country ||
        "Bangladesh",

    },

    eventDate,

    startTime,

    endTime,

    eventType,

    ticketPrice,

    totalSeats,

    availableSeats: totalSeats,

    maxTicketsPerUser:
      maxTicketsPerUser || 5,

    status: "draft",

    bannerImage:
      bannerImage ||
      {},

    galleryImages:
      galleryImages ||
      [],

  });


  // ======================================
  // Notify Organizer
  // ======================================
  await createBulkNotifications({

    users: [organizerId],

    title: "Event Submitted",

    message: `Your event "${event.title}" has been submitted and is pending admin approval.`,

    type: "event",

  });


  const admins = await User.find({ role: "admin" }).select("_id");


  if (admins.length > 0) {

    await createBulkNotifications({

      users: admins.map((admin) => admin._id),

      title: "New Event Submitted",

      message: `A new event "${event.title}" has been submitted by an organizer and is pending approval.`,

      type: "event",

    });

  }


  return event;

};


// ========================================
// Get My Events
// Organizer Only
// ========================================

const getMyEvents = async (
  organizerId
) => {

  const events =
    await Event.find({

      organizer: organizerId,
      isDeleted: false,

    })
      .populate(
        "category",
        "name"
      )
      .sort({
        createdAt: -1,
      });

  return events;

};


// ========================================
// Update Event
// Organizer (own) + Admin
// ========================================

const updateEvent = async (
  eventId,
  data,
  userId,
  userRole
) => {

  const event =
    await Event.findById(
      eventId
    );

  if (
    !event ||
    event.isDeleted
  ) {

    throw new AppError(
      "Event not found.",
      404
    );

  }


  // ======================================
  // Authorization
  // ======================================

  if (
    userRole !== "admin" &&
    String(event.organizer) !==
      String(userId)
  ) {

    throw new AppError(
      "You are not authorized to update this event.",
      403
    );

  }


  // ======================================
  // Verify Category If Changed
  // ======================================

  if (data.category) {

    const categoryExists =
      await Category.findById(
        data.category
      );

    if (
      !categoryExists ||
      categoryExists.isDeleted
    ) {

      throw new AppError(
        "Selected category does not exist.",
        400
      );

    }

  }


  // ======================================
  // Slug Uniqueness
  // ======================================

  if (
    data.slug &&
    data.slug !== event.slug
  ) {

    const existingSlug =
      await Event.findOne({

        slug: data.slug,
        _id: {
          $ne: eventId,
        },

      });

    if (existingSlug) {

      throw new AppError(
        "Slug already exists.",
        409
      );

    }

  }


  const updatedEvent =
    await Event.findByIdAndUpdate(
      eventId,
      data,
      {
        new: true,
        runValidators: true,
      }
    );

  return updatedEvent;

};


// ========================================
// Delete Event
// Organizer (own) + Admin
// Soft Delete
// ========================================

const deleteEvent = async (
  eventId,
  userId,
  userRole
) => {

  const event =
    await Event.findById(
      eventId
    );

  if (
    !event ||
    event.isDeleted
  ) {

    throw new AppError(
      "Event not found.",
      404
    );

  }


  // ======================================
  // Authorization
  // ======================================

  if (
    userRole !== "admin" &&
    String(event.organizer) !==
      String(userId)
  ) {

    throw new AppError(
      "You are not authorized to delete this event.",
      403
    );

  }


  event.isDeleted = true;
  event.deletedAt = new Date();

  await event.save();


  return {
    message:
      "Event deleted successfully.",
  };

};


// ========================================
// Cancel Event
// Organizer (own) + Admin
// ========================================

const cancelEvent = async (
  eventId,
  userId,
  userRole
) => {

  const event =
    await Event.findById(
      eventId
    );

  if (
    !event ||
    event.isDeleted
  ) {

    throw new AppError(
      "Event not found.",
      404
    );

  }


  // ======================================
  // Authorization
  // ======================================

  if (
    userRole !== "admin" &&
    String(event.organizer) !==
      String(userId)
  ) {

    throw new AppError(
      "You are not authorized to cancel this event.",
      403
    );

  }


  event.status = "cancelled";

  await event.save();


  return event;

};


// ========================================
// Export
// ========================================

module.exports = {

  createEvent,

  getMyEvents,

  updateEvent,

  deleteEvent,

  cancelEvent,

  getSingleEvent,

  getPendingOrganizers,

  approveOrganizer,

  rejectOrganizer,

  getDashboardStats,

  getAllUsers,

  blockUser,

  unblockUser,

  getAllEvents,

  getPendingEvents,

  approveEvent,

  rejectEvent,

  deleteEventByAdmin,

};