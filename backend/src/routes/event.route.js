const express = require("express");

const eventController = require("../controllers/event.controller");

const validateRequest = require("../middlewares/validateRequest");
const authMiddleware = require("../middlewares/auth.middleware");

const {
  createEventSchema,
  updateEventSchema,
} = require("../validations/event.validation");

const router = express.Router();


// Create Event

router.post(
  "/",
  authMiddleware,
  validateRequest(createEventSchema),
  eventController.createEvent
);

// ======================
// Get All Events
// ======================

router.get(
  "/",
  eventController.getAllEvents
);


// Get Single Event


router.get(
  "/:id",
  eventController.getSingleEvent
);


// Update Event


router.patch(
  "/:id",
  authMiddleware,
  validateRequest(updateEventSchema),
  eventController.updateEvent
);


// Delete Event


router.delete(
  "/:id",
  authMiddleware,
  eventController.deleteEvent
);


// Publish Event


router.patch(
  "/:id/publish",
  authMiddleware,
  eventController.publishEvent
);


// Cancel Event


router.patch(
  "/:id/cancel",
  authMiddleware,
  eventController.cancelEvent
);

module.exports = router;