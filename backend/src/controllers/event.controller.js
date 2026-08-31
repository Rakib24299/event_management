const eventService =
    require("../services/event.service");

const catchAsync =
    require("../utils/catchAsync");

const jwt =
    require("jsonwebtoken");

const User =
    require("../models/User");


// ========================================
// Create Event
// ========================================

const createEvent =
    catchAsync(
        async (req, res) => {

            const result =
                await eventService.createEvent(

                    req.body,

                    req.user.id

                );


            return res.status(201).json({

                success: true,

                message:
                    "Event created successfully.",

                data: result,

            });

        }
    );


// ========================================
// Get My Events
// Organizer Only
// ========================================

const getMyEvents =
    catchAsync(
        async (req, res) => {

            const result =
                await eventService.getMyEvents(
                    req.user.id
                );


            return res.status(200).json({

                success: true,

                data: result,

            });

        }
    );


// ========================================
// Get All Events
// ========================================

const getAllEvents =
    catchAsync(
        async (req, res) => {

            const result =
                await eventService.getAllEvents();


            return res.status(200).json({

                success: true,

                data: result,

            });

        }
    );


// ========================================
// Get Single Event
// ========================================

const getSingleEvent =
    catchAsync(
        async (req, res) => {

            let userRole =
                null;


            const authHeader =
                req.headers.authorization;


            if (
                authHeader &&
                authHeader.startsWith(
                    "Bearer "
                )
            ) {

                try {

                    const token =
                        authHeader.split(
                            " "
                        )[1];

                    const decoded =
                        jwt.verify(
                            token,
                            process.env.JWT_SECRET
                        );

                    const user =
                        await User.findById(
                            decoded.id
                        );

                    if (
                        user &&
                        user.status !==
                            "blocked"
                    ) {

                        userRole =
                            user.role;

                    }

                } catch (
                    error
                ) {

                    userRole =
                        null;

                }

            }


            const result =
                await eventService.getSingleEvent(

                    req.params.id,

                    userRole

                );


            return res.status(200).json({

                success: true,

                data: result,

            });

        }
    );


// ========================================
// Update Event
// ========================================

const updateEvent =
    catchAsync(
        async (req, res) => {

            const result =
                await eventService.updateEvent(

                    req.params.id,

                    req.body,

                    req.user.id,

                    req.user.role

                );


            return res.status(200).json({

                success: true,

                message:
                    "Event updated successfully.",

                data: result,

            });

        }
    );


// ========================================
// Delete Event
// Soft Delete
// ========================================

const deleteEvent =
    catchAsync(
        async (req, res) => {

            const result =
                await eventService.deleteEvent(

                    req.params.id,

                    req.user.id,

                    req.user.role

                );


            return res.status(200).json({

                success: true,

                message:
                    result.message,

            });

        }
    );


// ========================================
// Publish / Approve Event
// Admin Only
// ========================================

const publishEvent =
    catchAsync(
        async (req, res) => {

            const result =
                await eventService.approveEvent(

                    req.params.id

                );


            return res.status(200).json({

                success: true,

                message:
                    "Event published successfully.",

                data: result,

            });

        }
    );


// ========================================
// Reject Event
// Admin Only
// ========================================

const rejectEvent =
    catchAsync(
        async (req, res) => {

            const result =
                await eventService.rejectEvent(

                    req.params.id

                );


            return res.status(200).json({

                success: true,

                message:
                    "Event rejected successfully.",

                data: result,

            });

        }
    );

    
// ========================================
// Cancel Event
// ========================================

const cancelEvent =
    catchAsync(
        async (req, res) => {

            const result =
                await eventService.cancelEvent(

                    req.params.id,

                    req.user.id,

                    req.user.role

                );


            return res.status(200).json({

                success: true,

                message:
                    "Event cancelled successfully.",

                data: result,

            });

        }
    );


// ========================================
// Export
// ========================================

module.exports = {

    createEvent,

    getMyEvents,

    getAllEvents,

    getSingleEvent,

    updateEvent,

    deleteEvent,

    publishEvent,

    rejectEvent,

    cancelEvent,

};