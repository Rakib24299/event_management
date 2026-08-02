const Event = require("../models/Event");
const Category = require("../models/Category");


// Create Event


const createEvent = async (payload, userId) => {
  // Check Category
  const category = await Category.findById(payload.category);

  if (!category) 
    {
    throw new Error("Category not found.");
  }

  const event = await Event.create(
    {
    ...payload,
    organizer: userId,
    availableSeats: payload.totalSeats,
  });

  return event;
};


// Get All Events


const getAllEvents = async () => {
  const events = await Event.find(
    {
    isDeleted: false,
    status :" Published",
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
    throw new Error("Event not found.");
  }

  return event;
};


// Update Event


const updateEvent = async (eventId, payload, userId) => {
  const event = await Event.findById(eventId);

  if (!event || event.isDeleted)
     {
    throw new Error("Event not found.");
  }

  if (event.organizer.toString() !== userId.toString()) 
    {
    throw new Error("You are not authorized to update this event.");
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    payload,
    {
      new: true,
      runValidators: true,
    }
  );

  return updatedEvent;
};


// Delete Event (Soft Delete)

const deleteEvent = async (eventId, userId) => {
  const event = await Event.findById(eventId);

  if (!event || event.isDeleted) 
    {
    throw new Error("Event not found.");
  }

  if (event.organizer.toString() !== userId.toString()) 
    {
    throw new Error("You are not authorized to delete this event.");
  }

  event.isDeleted = true;
  event.deletedAt = new Date();
  event.deletedBy = userId;

  await event.save();

  return {message: "Event deleted successfully."};
};


// Publish Event


const publishEvent = async (eventId) => {
  const event = await Event.findById(eventId);

  if (!event || event.isDeleted) {
    throw new Error("Event not found.");
  }

  event.status = "published";

  await event.save();

  return event;
};


// Cancel Event


const cancelEvent = async (eventId) => {
  const event = await Event.findById(eventId);

  if (!event || event.isDeleted) 
    {
    throw new Error("Event not found.");
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