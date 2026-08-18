const Event = require("../models/Event");
const Category = require("../models/Category");
const AppError = require("../utils/AppError");


const User = require("../models/User");
const {createBulkNotifications,} = require("./notification.service");



// Create Event****


const createEvent = async (payload, userId) => {
  const category = await Category.findById(payload.category);

  if (!category || category.isDeleted)
     {
    throw new AppError("Category not found.",404);
  }

  const event = await Event.create({
    ...payload,
    organizer: userId,
    availableSeats: payload.totalSeats,
  });

  return event;
};


// Get All Events


const getAllEvents = async () => {
  const events = await Event.find({
    isDeleted: false,
    status: "published",
  })
    .populate("organizer", "name email organizationName")
    .populate("category", "name");

  return events;
};


// Get Single Event


const getSingleEvent = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate("organizer", "name email organizationName")
    .populate("category", "name");

  if (!event || event.isDeleted) 
  {
    throw new AppError("Event not found.",404);
  }

  return event;
};


// Update Event****

const updateEvent = async (eventId,payload,userId) => {

  const event = await Event.findById(eventId);

  if (!event || event.isDeleted) 
  {
    throw new AppError("Event not found.",404);
  }

  if (event.organizer.toString() !== userId.toString())
  {
    throw new AppError("You are not authorized to update this event.",403);
  }

  if (payload.category) 
  {
      const category = await Category.findById(payload.category);

      if (!category || category.isDeleted) 
      {
        throw new AppError("Category not found.",404);
      }
  }

  const updatedEvent = await Event.findByIdAndUpdate(eventId,payload,
    {
      new: true,
      runValidators: true,
    }
  );

  return updatedEvent;
};


// Delete Event (Soft Delete)

const deleteEvent = async (eventId,userId) => {const event = await Event.findById(eventId);

  if (!event || event.isDeleted) 
    {
    throw new AppError("Event not found.",404);
  }

  if (event.organizer.toString() !== userId.toString()) 
  {
    throw new AppError("You are not authorized to delete this event.",403);
  }

  event.isDeleted = true;
  event.deletedAt = new Date();
  event.deletedBy = userId;

  await event.save();

  return {message: "Event deleted successfully.",};
};


// Publish Event


const publishEvent = async (eventId) => {const event = await Event.findById(eventId);

  if (!event || event.isDeleted) 
  {
    throw new AppError("Event not found.",404);
  }

  event.status = "published";

  await event.save();


  // Send notification to all active users

const users = await User.find({status: "active",}).select("_id");

const userIds = users.map((user) => user._id);

await createBulkNotifications({
  users: userIds,

  title: "New Event Published",

  message: `${event.title} has been published. Check it out now.`,

  type: "event",
});

  return event;
};


// Cancel Event


const cancelEvent = async (eventId) => {const event = await Event.findById(eventId);

  if (!event || event.isDeleted) 
  {
    throw new AppError("Event not found.",404);
  }

  event.status = "cancelled";

  await event.save();

  return event;
};

module.exports = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  cancelEvent,
};