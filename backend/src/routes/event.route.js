const express =
    require("express");

const eventController =
    require("../controllers/event.controller");

const validateRequest =
    require("../middlewares/validateRequest");

const authMiddleware =
    require("../middlewares/auth.middleware");

const roleMiddleware =
    require("../middlewares/role.middleware");

const {

    createEventSchema,

    updateEventSchema,

} = require("../validations/event.validation");


const router =
    express.Router();


// ========================================
// Create Event
// Organizer + Admin
// ========================================

router.post(

    "/",

    authMiddleware,

    roleMiddleware(
        "organizer",
        "admin"
    ),

    validateRequest(
        createEventSchema
    ),

    eventController.createEvent

);


// ========================================
// Get My Events
// Organizer Only
// ========================================

router.get(

    "/my-events",

    authMiddleware,

    roleMiddleware(
        "organizer"
    ),

    eventController.getMyEvents

);


// ========================================
// Get All Published Events
// Public
// ========================================

router.get(

    "/",

    eventController.getAllEvents

);


// ========================================
// Get Single Event
// Public
// ========================================

router.get(

    "/:id",

    eventController.getSingleEvent

);


// ========================================
// Publish Event
// Admin Only
// ========================================

router.patch(

    "/:id/publish",

    authMiddleware,

    roleMiddleware(
        "admin"
    ),

    eventController.publishEvent

);


// ========================================
// Reject Event
// Admin Only
// ========================================

router.patch(

    "/:id/reject",

    authMiddleware,

    roleMiddleware(
        "admin"
    ),

    eventController.rejectEvent

);


// ========================================
// Cancel Event
// Organizer + Admin
// ========================================

router.patch(

    "/:id/cancel",

    authMiddleware,

    roleMiddleware(
        "organizer",
        "admin"
    ),

    eventController.cancelEvent

);


// ========================================
// Update Event
// Organizer + Admin
// ========================================

router.patch(

    "/:id",

    authMiddleware,

    roleMiddleware(
        "organizer",
        "admin"
    ),

    validateRequest(
        updateEventSchema
    ),

    eventController.updateEvent

);


// ========================================
// Delete Event
// Organizer + Admin
// ========================================

router.delete(

    "/:id",

    authMiddleware,

    roleMiddleware(
        "organizer",
        "admin"
    ),

    eventController.deleteEvent

);


// ========================================
// Get Organizer Event History
// Organizer Only
// ========================================

router.get(

    "/organizer/history",

    authMiddleware,

    roleMiddleware(
        "organizer"
    ),

    eventController.getOrganizerEventHistory

);


// ========================================
// Export
// ========================================

module.exports = router;