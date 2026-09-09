const getEventEndDateTime = (event) => {

    if (!event || !event.eventDate) {

        return null;

    }


    const dateTime =
        new Date(
            event.eventDate
        );


    if (
        Number.isNaN(
            dateTime.getTime()
        )
    ) {

        return null;

    }


    const endTime =
        event.endTime;


    if (endTime) {

        const timeParts =
            String(endTime)
                .split(":")
                .map(Number);


        if (
            timeParts.length >=
            2 &&
            !Number.isNaN(
                timeParts[0]
            ) &&
            !Number.isNaN(
                timeParts[1]
            )
        ) {

            dateTime.setHours(

                timeParts[0],

                timeParts[1] ||
                    0,

                0,

                0

            );

        }

    }


    return dateTime;

};


const isEventExpired = (event) => {

    const endDateTime =
        getEventEndDateTime(event);


    return (
        endDateTime !==
        null &&
        endDateTime <
        new Date()
    );

};


const isEventUpcoming = (event) => {

    const endDateTime =
        getEventEndDateTime(event);


    return (
        endDateTime !==
        null &&
        endDateTime >=
        new Date()
    );

};


const isEventInAdminHistory = (event) => {

    const endDateTime =
        getEventEndDateTime(event);


    if (
        !endDateTime
    ) {

        return false;

    }


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


    return (
        endDateTime <
        now &&
        endDateTime >=
        cutoff
    );

};


module.exports = {

    getEventEndDateTime,

    isEventExpired,

    isEventUpcoming,

    isEventInAdminHistory,

};
