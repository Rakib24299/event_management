const eventService = require("../services/event.service");
const catchAsync = require("../utils/catchAsync");

// Create Event

const createEvent = catchAsync(async (req, res) => {
  const result = await eventService.createEvent(
    req.body,
    req.user.id
  );

  return res.status(201).json({
    success: true,
    message: "Event created successfully.",
    data: result,
  });
});

// Get All Events

const getAllEvents = catchAsync(async (req, res) => {
  const result = await eventService.getAllEvents();

  return res.status(200).json({
    success: true,
    data: result,
  });
});


// Get Single Event

const getSingleEvent = catchAsync(async (req, res) => {
  const result = await eventService.getSingleEvent(
    req.params.id
  );

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// Update Event

const updateEvent = catchAsync(async (req, res) => {
  const result = await eventService.updateEvent(
    req.params.id,
    req.body,
    req.user.id
  );

  return res.status(200).json({
    success: true,
    message: "Event updated successfully.",
    data: result,
  });
});

// Delete Event

const deleteEvent = catchAsync(async (req, res) => {
  const result = await eventService.deleteEvent(
    req.params.id,
    req.user.id
  );

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});


// Publish Event

const publishEvent = catchAsync(async (req, res) => {
  const result = await eventService.publishEvent(
    req.params.id
  );

  return res.status(200).json({
    success: true,
    message: "Event published successfully.",
    data: result,
  });
});


// Cancel Event


const cancelEvent = catchAsync(async (req, res) => {
  const result = await eventService.cancelEvent(
    req.params.id
  );

  return res.status(200).json({
    success: true,
    message: "Event cancelled successfully.",
    data: result,
  });
});

module.exports = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  cancelEvent,
};