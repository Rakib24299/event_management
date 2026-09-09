const cron =
    require("node-cron");

const Event =
    require("../models/Event");

const {
  getEventEndDateTime,
} = require("../utils/eventDateTime");


// ======================================================
// EVENT HISTORY CLEANUP JOB
// ======================================================
// Hard-deletes events whose end datetime is older
// than 30 days.
// ======================================================

const cleanupExpiredEvents =
    async () => {

        try {

            console.log(
                "[EVENT HISTORY CLEANUP] Starting cleanup..."
            );


            const now =
                new Date();


            const cutoff =
                new Date(
                    now.getTime() -
                        30 *
                        24 *
                        60 *
                        60 *
                        1000
                );


            const events =
                await Event.find({
                    isDeleted: false,
                });


            const expiredEvents =
                events.filter(
                    (event) => {

                        const endDateTime =
                            getEventEndDateTime(
                                event
                            );


                        if (
                            !endDateTime
                        ) {

                            return false;

                        }


                        return (
                            endDateTime <
                            cutoff
                        );

                    }
                );


            if (
                expiredEvents.length ===
                0
            ) {

                console.log(
                    "[EVENT HISTORY CLEANUP] No expired events found older than 30 days."
                );

                return {
                    found: 0,
                    deleted: 0,
                };

            }


            console.log(
                `[EVENT HISTORY CLEANUP] Found: ${expiredEvents.length} expired event(s) older than 30 days`
            );


            let deletedCount =
                0;


            for (
                const event of
                expiredEvents
            ) {

                try {

                    await Event.findByIdAndDelete(
                        event._id
                    );


                    deletedCount++;

                } catch (error) {

                    console.error(
                        `[EVENT HISTORY CLEANUP] Failed to delete event ${event._id}:`,
                        error.message
                    );

                }

            }


            console.log(
                `[EVENT HISTORY CLEANUP] Deleted: ${deletedCount}`
            );


            return {
                found:
                    expiredEvents
                        .length,
                deleted:
                    deletedCount,
            };

        } catch (error) {

            console.error(
                "[EVENT HISTORY CLEANUP] Error:",
                error.message
            );


            return {
                found: 0,
                deleted: 0,
                error:
                    error.message,
            };

        }

    };


// ======================================================
// START CLEANUP JOB
// ======================================================
// Runs daily at 00:00
// ======================================================

const startEventHistoryCleanupJob =
    () => {

        console.log(
            "[EVENT HISTORY CLEANUP] Automatic event history cleanup job started."
        );


        cron.schedule(
            "0 0 * * *",
            cleanupExpiredEvents
        );

    };


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    cleanupExpiredEvents,

    startEventHistoryCleanupJob,

};
