// EventEase Organizer
// Event Details

const API_URL =
    "http://localhost:5000/api/v1";


// Elements

const eventBanner =
    document.getElementById(
        "eventBanner"
    );

const eventTitle =
    document.getElementById(
        "eventTitle"
    );

const eventCategory =
    document.getElementById(
        "eventCategory"
    );

const eventStatus =
    document.getElementById(
        "eventStatus"
    );

const eventDescription =
    document.getElementById(
        "eventDescription"
    );

const venueName =
    document.getElementById(
        "venueName"
    );

const venueAddress =
    document.getElementById(
        "venueAddress"
    );

const eventDate =
    document.getElementById(
        "eventDate"
    );

const eventTime =
    document.getElementById(
        "eventTime"
    );

const eventType =
    document.getElementById(
        "eventType"
    );

const ticketPrice =
    document.getElementById(
        "ticketPrice"
    );

const totalSeats =
    document.getElementById(
        "totalSeats"
    );

const availableSeats =
    document.getElementById(
        "availableSeats"
    );

const maxTicketsPerUser =
    document.getElementById(
        "maxTicketsPerUser"
    );

const eventGallery =
    document.getElementById(
        "eventGallery"
    );

const eventLoading =
    document.getElementById(
        "eventLoading"
    );

const eventError =
    document.getElementById(
        "eventError"
    );

const editEventButton =
    document.getElementById(
        "editEventButton"
    );

const deleteEventButton =
    document.getElementById(
        "deleteEventButton"
    );


// Get Token

const token =
    localStorage.getItem(
        "token"
    );


// Get Logged In User

let loggedInUser = null;

try {

    loggedInUser =
        JSON.parse(
            localStorage.getItem(
                "user"
            )
        );

} catch (error) {

    loggedInUser = null;

}


// Check Authentication

if (!token || !loggedInUser) {

    window.location.href =
        "./organizer-login.html";

}


// Check Organizer Role

if (
    loggedInUser &&
    loggedInUser.role !== "organizer"
) {

    alert(
        "You are not authorized to view this page."
    );

    window.location.href =
        "./dashboard.html";

}


// Get Event ID

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const eventId =
    urlParams.get(
        "id"
    );


// Show Error

function showError(message) {

    if (!eventError) {
        return;
    }


    eventError.textContent =
        message;

    eventError.classList.remove(
        "hidden"
    );

}


// Hide Error

function hideError() {

    if (!eventError) {
        return;
    }


    eventError.textContent =
        "";

    eventError.classList.add(
        "hidden"
    );

}


// Show Loading

function showLoading() {

    if (!eventLoading) {
        return;
    }


    eventLoading.classList.remove(
        "hidden"
    );

}


// Hide Loading

function hideLoading() {

    if (!eventLoading) {
        return;
    }


    eventLoading.classList.add(
        "hidden"
    );

}


// Format Date

function formatDate(date) {

    if (!date) {
        return "--";
    }


    const formattedDate =
        new Date(date);


    if (
        Number.isNaN(
            formattedDate.getTime()
        )
    ) {

        return date;

    }


    return formattedDate.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


// Format Ticket Price

function formatTicketPrice(
    price,
    type
) {

    if (
        type === "free" ||
        Number(price) === 0
    ) {

        return "Free";

    }


    return `৳ ${Number(price).toLocaleString(
        "en-BD"
    )}`;

}


// Format Status

function updateStatus(
    status
) {

    if (!eventStatus) {
        return;
    }


    eventStatus.textContent =
        status || "Draft";


    eventStatus.className =
        "inline-flex rounded-full px-4 py-1.5 text-xs font-bold";


    if (
        status === "published"
    ) {

        eventStatus.classList.add(
            "bg-green-100",
            "text-green-600"
        );

        return;

    }


    if (
        status === "completed"
    ) {

        eventStatus.classList.add(
            "bg-blue-100",
            "text-blue-600"
        );

        return;

    }


    if (
        status === "cancelled"
    ) {

        eventStatus.classList.add(
            "bg-red-100",
            "text-red-600"
        );

        return;

    }


    eventStatus.classList.add(
        "bg-orange-100",
        "text-orange-600"
    );

}


// Display Gallery

function displayGallery(
    galleryImages
) {

    if (!eventGallery) {
        return;
    }


    eventGallery.innerHTML =
        "";


    if (
        !galleryImages ||
        galleryImages.length === 0
    ) {

        eventGallery.innerHTML = `

            <div
                class="col-span-full rounded-2xl bg-gray-50 p-8 text-center"
            >

                <p
                    class="text-sm text-gray-500"
                >
                    No gallery images available.
                </p>

            </div>

        `;

        return;

    }


    galleryImages.forEach(
        (image) => {

            if (!image || !image.url) {
                return;
            }


            const imageContainer =
                document.createElement(
                    "div"
                );


            imageContainer.className =
                "h-48 overflow-hidden rounded-2xl bg-gray-100";


            const imageElement =
                document.createElement(
                    "img"
                );


            imageElement.src =
                image.url;

            imageElement.alt =
                "Event Gallery Image";

            imageElement.className =
                "h-full w-full object-cover transition duration-300 hover:scale-105";


            imageContainer.appendChild(
                imageElement
            );


            eventGallery.appendChild(
                imageContainer
            );

        }
    );

}


// Display Event

function displayEvent(
    event
) {

    if (!event) {

        showError(
            "Event information was not found."
        );

        return;

    }


    // Payment Type

    const isPaidEvent =
        event.eventType === "paid";


    // Banner

    if (
        eventBanner &&
        event.bannerImage &&
        event.bannerImage.url
    ) {

        eventBanner.src =
            event.bannerImage.url;

    } else if (eventBanner) {

        eventBanner.src =
            "https://via.placeholder.com/1200x500?text=Event+Banner";

    }


    // Title

    if (eventTitle) {

        eventTitle.textContent =
            event.title || "Untitled Event";

    }


    // Category

    if (eventCategory) {

        if (
            event.category &&
            typeof event.category ===
                "object"
        ) {

            eventCategory.textContent =
                event.category.name ||
                "Uncategorized";

        } else {

            eventCategory.textContent =
                "Uncategorized";

        }

    }


    // Status

    updateStatus(
        event.status
    );


    // Description

    if (eventDescription) {

        eventDescription.textContent =
            event.description ||
            "No description available.";

    }


    // Venue

    if (venueName) {

        venueName.textContent =
            event.venue?.venueName ||
            "Venue not available";

    }


    if (venueAddress) {

        const addressParts = [

            event.venue?.street,

            event.venue?.city,

            event.venue?.country

        ].filter(Boolean);


        venueAddress.textContent =
            addressParts.length > 0
                ? addressParts.join(
                    ", "
                )
                : "Address not available";

    }


    // Date

    if (eventDate) {

        eventDate.textContent =
            formatDate(
                event.eventDate
            );

    }


    // Time

    if (eventTime) {

        const startTime =
            event.startTime ||
            "--";

        const endTime =
            event.endTime ||
            "--";


        eventTime.textContent =
            `${startTime} - ${endTime}`;

    }


    // Event Type

    if (eventType) {

        eventType.textContent =
            event.eventType ||
            "--";

    }


    // Ticket Price (hide for free events)

    if (ticketPrice) {

        if (isPaidEvent) {

            ticketPrice.textContent =
                formatTicketPrice(
                    event.ticketPrice,
                    event.eventType
                );


            ticketPrice.parentElement.classList.remove(
                "hidden"
            );

        } else {

            ticketPrice.parentElement.classList.add(
                "hidden"
            );

        }

    }


    // Seat Fields (paid events only)

    if (totalSeats) {

        totalSeats.textContent =
            isPaidEvent
                ? event.totalSeats ?? "--"
                : "";

        totalSeats.parentElement.classList.toggle(
            "hidden",
            !isPaidEvent
        );

    }


    if (availableSeats) {

        availableSeats.textContent =
            isPaidEvent
                ? event.availableSeats ?? "--"
                : "";

        availableSeats.parentElement.classList.toggle(
            "hidden",
            !isPaidEvent
        );

    }


    if (maxTicketsPerUser) {

        maxTicketsPerUser.textContent =
            isPaidEvent
                ? event.maxTicketsPerUser ?? "--"
                : "";

        maxTicketsPerUser.parentElement.classList.toggle(
            "hidden",
            !isPaidEvent
        );

    }


    // Gallery

    displayGallery(
        event.galleryImages
    );


    // Edit Button

    if (editEventButton) {

        editEventButton.href =
            `./edit-event.html?id=${event._id}`;

    }

}


// Load Event Details

async function loadEventDetails() {

    if (!eventId) {

        hideLoading();

        showError(
            "Event ID is missing."
        );

        return;

    }


    showLoading();

    hideError();


    try {

        // API Request

        const response =
            await fetch(
                `${API_URL}/events/${eventId}`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        // Read Response

        const result =
            await response.json();


        console.log(
            "Event Details Response:",
            result
        );


        // API Error

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load event details."
            );

        }


        // Get Event

        const event =
            result.data;


        // Check Organizer

        if (
            event.organizer &&
            typeof event.organizer ===
                "object" &&
            event.organizer._id
        ) {

            if (
                event.organizer._id !==
                loggedInUser._id
            ) {

                hideLoading();

                showError(
                    "You are not authorized to view this event."
                );

                return;

            }

        }


        // Display Event

        displayEvent(
            event
        );


    } catch (error) {

        console.error(
            "Load Event Error:",
            error
        );


        if (
            error instanceof TypeError
        ) {

            showError(
                "Unable to connect to the server. Please make sure the backend server is running."
            );

        } else {

            showError(
                error.message ||
                "Something went wrong while loading the event."
            );

        }

    } finally {

        hideLoading();

    }

}


// Delete Event

if (deleteEventButton) {

    deleteEventButton.addEventListener(
        "click",
        async () => {

            if (!eventId) {

                showError(
                    "Event ID is missing."
                );

                return;

            }


            // Confirmation

            const confirmed =
                confirm(
                    "Are you sure you want to delete this event?"
                );


            if (!confirmed) {
                return;
            }


            // Loading State

            deleteEventButton.disabled =
                true;

            deleteEventButton.textContent =
                "Deleting...";


            hideError();


            try {

                // API Request

                const response =
                    await fetch(
                        `${API_URL}/events/${eventId}`,
                        {

                            method: "DELETE",

                            headers: {

                                "Authorization":
                                    `Bearer ${token}`

                            }

                        }
                    );


                // Read Response

                const result =
                    await response.json();


                console.log(
                    "Delete Event Response:",
                    result
                );


                // API Error

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Failed to delete event."
                    );

                }


                // Success

                deleteEventButton.textContent =
                    "Deleted";


                alert(
                    "Event deleted successfully."
                );


                // Redirect

                window.location.href =
                    "./my-events.html";


            } catch (error) {

                console.error(
                    "Delete Event Error:",
                    error
                );


                showError(
                    error.message ||
                    "Something went wrong while deleting the event."
                );


                deleteEventButton.disabled =
                    false;

                deleteEventButton.textContent =
                    "Delete Event";

            }

        }
    );

}


// Load Event On Page Load

loadEventDetails();