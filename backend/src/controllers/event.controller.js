const eventService = require("../services/event.service");


// Create Event

const createEvent = async (req, res) => {
  try {
      const result = await eventService.createEvent(
      req.body,
      req.user.id
    );

    return res.status(201).json(
        {
        success: true,
        message: "Event created successfully.",
        data: result,
        });
  }
  
  catch (error)
  {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};


// Get All Events

const getAllEvents = async (req, res) => {
  try {
    const result = await eventService.getAllEvents();

    return res.status(200).json(
    {
      success: true,
      data: result,
    });
  } 
  catch (error)
   {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};


// Get Single Event

const getSingleEvent = async (req, res) => {
  try {
    const result = await eventService.getSingleEvent(
      req.params.id
    );

    return res.status(200).json(
    {
      success: true,
      data: result,
    });
  } 
  catch (error) 
  {
    return res.status(404).json(
    {
      success: false,
      message: error.message,
    });
  }
};

// Update Event

const updateEvent = async (req, res) => {
  try {
    const result = await eventService.updateEvent(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(200).json(
    {
      success: true,
      message: "Event updated successfully.",
      data: result,
    });
  } 
  catch (error)
   {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};


// Delete Event

const deleteEvent = async (req, res) => {
  try {
    const result = await eventService.deleteEvent(
      req.params.id,
      req.user.id
    );

    return res.status(200).json(
    {
      success: true,
      message: result.message,
    });
  } 
  catch (error) 
  {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};



// Publish Event

const publishEvent = async (req, res) => {
  try {
    const result = await eventService.publishEvent(
      req.params.id
    );

    return res.status(200).json(
    {
      success: true,
      message: "Event published successfully.",
      data: result,
    });
  }
   catch (error) 
  {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};


// Cancel Event


const cancelEvent = async (req, res) => {
  try {
    const result = await eventService.cancelEvent(
      req.params.id
    );

    return res.status(200).json(
    {
      success: true,
      message: "Event cancelled successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
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