const express = require("express");

const eventController = require("../controllers/event.controller");

const validateRequest = require("../middlewares/validateRequest");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  createEventSchema,
  updateEventSchema,
} = require("../validations/event.validation");

const router = express.Router();


// Create Event

router.post(
  "/",
  authMiddleware,
  roleMiddleware("organizer", "admin"),
  validateRequest(createEventSchema),
  eventController.createEvent
);

// Get All Events

router.get(
  "/",
  eventController.getAllEvents
);

// Get Single Event

router.get(
  "/:id",
  eventController.getSingleEvent
);

// Publish Event

router.patch(
  "/:id/publish",
  authMiddleware,
  roleMiddleware("admin"),
  eventController.publishEvent
);

// Cancel Event

router.patch(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware("organizer", "admin"),
  eventController.cancelEvent
);

// Update Event

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("organizer", "admin"),
  validateRequest(updateEventSchema),
  eventController.updateEvent
);

// Delete Event

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("organizer", "admin"),
  eventController.deleteEvent
);


// Publish Event


router.patch(
  "/:id/publish",
  authMiddleware,
  roleMiddleware("admin"),
  eventController.publishEvent
);


// Cancel Event


router.patch(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware("organizer", "admin"),
  eventController.cancelEvent
);

module.exports = router;