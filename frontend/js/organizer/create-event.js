// ========================================
// EventEase Organizer
// Create Event
// ========================================

const API_URL =
    "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const createEventForm =
    document.getElementById("createEventForm");

const titleInput =
    document.getElementById("title");

const slugInput =
    document.getElementById("slug");

const categoryInput =
    document.getElementById("category");

const descriptionInput =
    document.getElementById("description");

const venueNameInput =
    document.getElementById("venueName");

const streetInput =
    document.getElementById("street");

const cityInput =
    document.getElementById("city");

const countryInput =
    document.getElementById("country");

const eventDateInput =
    document.getElementById("eventDate");

const startTimeInput =
    document.getElementById("startTime");

const endTimeInput =
    document.getElementById("endTime");

const eventTypeInput =
    document.getElementById("eventType");

const ticketPriceInput =
    document.getElementById("ticketPrice");

const totalSeatsInput =
    document.getElementById("totalSeats");

const maxTicketsInput =
    document.getElementById("maxTicketsPerUser");

const bannerImageInput =
    document.getElementById("bannerImage");

const galleryImagesInput =
    document.getElementById("galleryImages");

const createEventButton =
    document.getElementById("createEventButton");

const eventError =
    document.getElementById("eventError");

const eventSuccess =
    document.getElementById("eventSuccess");


// ========================================
// Get Token
// ========================================

const token =
    localStorage.getItem("token");


// ========================================
// Get Logged In User
// ========================================

let loggedInUser = null;

try {

    loggedInUser =
        JSON.parse(
            localStorage.getItem("user")
        );

} catch (error) {

    loggedInUser = null;

}


// ========================================
// Check Authentication
// ========================================

if (!token || !loggedInUser) {

    window.location.href =
        "./organizer-login.html";

}


// ========================================
// Check Organizer Role
// ========================================

if (
    loggedInUser &&
    loggedInUser.role !== "organizer"
) {

    alert(
        "You are not authorized to create an event."
    );

    window.location.href =
        "./dashboard.html";

}


// ========================================
// Show Error
// ========================================

function showError(message) {

    if (!eventError) {
        return;
    }

    eventError.textContent =
        message;

    eventError.classList.remove(
        "hidden"
    );

    if (eventSuccess) {

        eventSuccess.classList.add(
            "hidden"
        );

    }

}


// ========================================
// Hide Error
// ========================================

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


// ========================================
// Show Success
// ========================================

function showSuccess(message) {

    if (!eventSuccess) {
        return;
    }

    eventSuccess.textContent =
        message;

    eventSuccess.classList.remove(
        "hidden"
    );

    if (eventError) {

        eventError.classList.add(
            "hidden"
        );

    }

}


// ========================================
// Hide Success
// ========================================

function hideSuccess() {

    if (!eventSuccess) {
        return;
    }

    eventSuccess.textContent =
        "";

    eventSuccess.classList.add(
        "hidden"
    );

}


// ========================================
// Load Categories
// ========================================

async function loadCategories() {

    if (!categoryInput) {
        return;
    }

    try {

        categoryInput.innerHTML = `
            <option value="">
                Loading categories...
            </option>
        `;

        categoryInput.disabled = true;


        const response =
            await fetch(
                `${API_URL}/categories`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load categories."
            );

        }


        const categories =
            Array.isArray(result.data)
                ? result.data
                : [];


        categoryInput.innerHTML = `
            <option value="">
                Select Category
            </option>
        `;


        if (categories.length === 0) {

            categoryInput.innerHTML = `
                <option value="">
                    No categories available
                </option>
            `;

            categoryInput.disabled = true;

            return;
        }


        categories.forEach(
            (category) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category._id;

                option.textContent =
                    category.name;

                categoryInput.appendChild(
                    option
                );

            }
        );


        categoryInput.disabled =
            false;


    } catch (error) {

        console.error(
            "Load Categories Error:",
            error
        );


        categoryInput.innerHTML = `
            <option value="">
                Failed to load categories
            </option>
        `;

        categoryInput.disabled =
            true;


        showError(
            "Unable to load categories. Please make sure the backend server is running."
        );

    }

}


// ========================================
// Load Categories On Page Load
// ========================================

loadCategories();


// ========================================
// Create Slug
// ========================================

function createSlug(text) {

    return text
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9\s-]/g,
            ""
        )
        .replace(
            /\s+/g,
            "-"
        )
        .replace(
            /-+/g,
            "-"
        );

}


// ========================================
// Generate Slug From Title
// ========================================

if (
    titleInput &&
    slugInput
) {

    titleInput.addEventListener(
        "input",
        () => {

            if (
                !slugInput.dataset.edited
            ) {

                slugInput.value =
                    createSlug(
                        titleInput.value
                    );

            }

        }
    );


    slugInput.addEventListener(
        "input",
        () => {

            slugInput.dataset.edited =
                "true";

        }
    );

}


// ========================================
// Event Type Change
// ========================================

if (
    eventTypeInput &&
    ticketPriceInput &&
    totalSeatsInput &&
    maxTicketsInput
) {

    const ticketFields =
        [
            ticketPriceInput,
            totalSeatsInput,
            maxTicketsInput
        ];


    eventTypeInput.addEventListener(
        "change",
        () => {

            if (
                eventTypeInput.value ===
                "free"
            ) {

                ticketPriceInput.value =
                    "0";

                totalSeatsInput.value =
                    "";

                maxTicketsInput.value =
                    "";

                ticketFields.forEach(
                    (field) => {

                        field.disabled =
                            true;

                        field.removeAttribute(
                            "required"
                        );

                    }
                );

            } else {

                ticketFields.forEach(
                    (field) => {

                        field.disabled =
                            false;

                        field.setAttribute(
                            "required",
                            "required"
                        );

                    }
                );

            }

        }
    );

}


// ========================================
// Initial Ticket Price State
// ========================================

if (
    eventTypeInput &&
    ticketPriceInput &&
    totalSeatsInput &&
    maxTicketsInput
) {

    const ticketFields =
        [
            ticketPriceInput,
            totalSeatsInput,
            maxTicketsInput
        ];


    if (
        eventTypeInput.value ===
        "free"
    ) {

        ticketPriceInput.value =
            "0";

        totalSeatsInput.value =
            "";

        maxTicketsInput.value =
            "";

        ticketFields.forEach(
            (field) => {

                field.disabled =
                    true;

                field.removeAttribute(
                    "required"
                );

            }
        );

    } else {

        ticketFields.forEach(
            (field) => {

                field.disabled =
                    false;

                field.setAttribute(
                    "required",
                    "required"
                );

            }
        );

    }

}


// ========================================
// Validate Form
// ========================================

function validateForm() {

    const title =
        titleInput.value.trim();

    const slug =
        slugInput.value.trim();

    const category =
        categoryInput.value.trim();

    const description =
        descriptionInput.value.trim();

    const venueName =
        venueNameInput.value.trim();

    const eventDate =
        eventDateInput.value;

    const startTime =
        startTimeInput.value;

    const endTime =
        endTimeInput.value;

    const eventType =
        eventTypeInput.value;

    const ticketPrice =
        Number(
            ticketPriceInput.value
        );

    const totalSeats =
        Number(
            totalSeatsInput.value
        );

    const maxTickets =
        Number(
            maxTicketsInput.value
        );


    // ====================================
    // Required Fields
    // ====================================

    if (!title) {

        showError(
            "Please enter the event title."
        );

        titleInput.focus();

        return false;

    }


    if (title.length < 3) {

        showError(
            "Event title must be at least 3 characters."
        );

        titleInput.focus();

        return false;

    }


    if (!slug) {

        showError(
            "Please enter the event slug."
        );

        slugInput.focus();

        return false;

    }


    if (!category) {

        showError(
            "Please select a category."
        );

        categoryInput.focus();

        return false;

    }


    if (!description) {

        showError(
            "Please enter the event description."
        );

        descriptionInput.focus();

        return false;

    }


    if (description.length < 10) {

        showError(
            "Description must be at least 10 characters."
        );

        descriptionInput.focus();

        return false;

    }


    if (!venueName) {

        showError(
            "Please enter the venue name."
        );

        venueNameInput.focus();

        return false;

    }


    if (!eventDate) {

        showError(
            "Please select the event date."
        );

        eventDateInput.focus();

        return false;

    }


    if (!startTime) {

        showError(
            "Please select the start time."
        );

        startTimeInput.focus();

        return false;

    }


    if (!endTime) {

        showError(
            "Please select the end time."
        );

        endTimeInput.focus();

        return false;

    }


    // ====================================
    // Date Validation
    // ====================================

    const selectedDate =
        new Date(
            `${eventDate}T00:00:00`
        );

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    if (
        selectedDate <
        today
    ) {

        showError(
            "Event date cannot be in the past."
        );

        eventDateInput.focus();

        return false;

    }


    // ====================================
    // Time Validation
    // ====================================

    if (
        startTime >= endTime
    ) {

        showError(
            "End time must be later than start time."
        );

        endTimeInput.focus();

        return false;

    }


    // ====================================
    // Ticket Validation
    // ====================================

    if (eventType !== "free") {

        if (
            ticketPrice <= 0
        ) {

            showError(
                "Paid events must have a ticket price greater than 0."
            );

            ticketPriceInput.focus();

            return false;

        }


        if (
            !totalSeats ||
            totalSeats < 1
        ) {

            showError(
                "Total seats must be at least 1."
            );

            totalSeatsInput.focus();

            return false;

        }


        if (
            !maxTickets ||
            maxTickets < 1
        ) {

            showError(
                "Maximum tickets per user must be at least 1."
            );

            maxTicketsInput.focus();

            return false;

        }


        if (
            maxTickets >
            totalSeats
        ) {

            showError(
                "Maximum tickets per user cannot exceed total seats."
            );

            maxTicketsInput.focus();

            return false;

        }


        if (
            maxTickets > 20
        ) {

            showError(
                "Maximum tickets per user cannot exceed 20."
            );

            maxTicketsInput.focus();

            return false;

        }

    }


    return true;

}


// ========================================
// Upload Single Image
// ========================================

async function uploadSingleImage(file) {

    if (!file) {

        return null;

    }


    const formData =
        new FormData();


    formData.append(
        "image",
        file
    );


    const response =
        await fetch(
            `${API_URL}/upload/single`,
            {

                method: "POST",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                },

                body:
                    formData

            }
        );


    const result =
        await response.json();


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            "Failed to upload banner image."
        );

    }


    return result.data;

}


// ========================================
// Upload Multiple Images
// ========================================

async function uploadMultipleImages(files) {

    if (
        !files ||
        files.length === 0
    ) {

        return [];

    }


    const formData =
        new FormData();


    Array.from(
        files
    ).forEach(
        (file) => {

            formData.append(
                "images",
                file
            );

        }
    );


    const response =
        await fetch(
            `${API_URL}/upload/multiple`,
            {

                method: "POST",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                },

                body:
                    formData

            }
        );


    const result =
        await response.json();


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            "Failed to upload gallery images."
        );

    }


    return result.data || [];

}


// ========================================
// Create Event
// ========================================

if (createEventForm) {

    createEventForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            hideError();

            hideSuccess();


            // ====================================
            // Validate
            // ====================================

            if (!validateForm()) {

                return;

            }


            // ====================================
            // Loading State
            // ====================================

            createEventButton.disabled =
                true;

            createEventButton.textContent =
                "Creating Event...";


            try {

                // ====================================
                // Get Values
                // ====================================

                const title =
                    titleInput.value.trim();

                const slug =
                    slugInput.value.trim();

                const category =
                    categoryInput.value.trim();

                const description =
                    descriptionInput.value.trim();

                const venueName =
                    venueNameInput.value.trim();

                const street =
                    streetInput.value.trim();

                const city =
                    cityInput.value.trim();

                const country =
                    countryInput.value.trim();

                const eventDate =
                    eventDateInput.value;

                const startTime =
                    startTimeInput.value;

                const endTime =
                    endTimeInput.value;

                const eventType =
                    eventTypeInput.value;

                const ticketPrice =
                    Number(
                        ticketPriceInput.value
                    );

                const totalSeats =
                    Number(
                        totalSeatsInput.value
                    );

                const maxTicketsPerUser =
                    Number(
                        maxTicketsInput.value
                    );


                // ====================================
                // Upload Images
                // ====================================

                createEventButton.textContent =
                    "Uploading Images...";


                let bannerImageData =
                    null;

                const galleryImagesData =
                    [];


                if (
                    bannerImageInput &&
                    bannerImageInput.files &&
                    bannerImageInput.files[0]
                ) {

                    bannerImageData =
                        await uploadSingleImage(
                            bannerImageInput.files[0]
                        );

                }


                if (
                    galleryImagesInput &&
                    galleryImagesInput.files &&
                    galleryImagesInput.files.length >
                    0
                ) {

                    galleryImagesData.push(
                        ...(await uploadMultipleImages(
                            galleryImagesInput.files
                        ))
                    );

                }


                // ====================================
                // Event Data
                // ====================================

                const eventData = {

                    title,

                    slug,

                    category,

                    description,

                    venue: {

                        venueName,

                        street,

                        city,

                        country

                    },

                    eventDate,

                    startTime,

                    endTime,

                    eventType,

                    ...(eventType === "paid"
                        ? {

                            ticketPrice,

                            totalSeats,

                            maxTicketsPerUser

                        }
                        : {}),

                };


                if (bannerImageData) {

                    eventData.bannerImage =
                        bannerImageData;

                }


                if (
                    galleryImagesData.length >
                    0
                ) {

                    eventData.galleryImages =
                        galleryImagesData;

                }


                console.log(
                    "Create Event Data:",
                    eventData
                );


                // ====================================
                // API Request
                // ====================================

                createEventButton.textContent =
                    "Creating Event...";


                const response =
                    await fetch(
                        `${API_URL}/events`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify(
                                    eventData
                                )

                        }
                    );


                // ====================================
                // Read Response
                // ====================================

                const result =
                    await response.json();


                console.log(
                    "Create Event Response:",
                    result
                );


                // ====================================
                // API Error
                // ====================================

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Failed to create event."
                    );

                }


                // ====================================
                // Success
                // ====================================

                showSuccess(
                    "Event created successfully."
                );


                createEventButton.textContent =
                    "Event Created";


                // ====================================
                // Redirect
                // ====================================

                setTimeout(
                    () => {

                        window.location.href =
                            "./my-events.html";

                    },
                    1000
                );


            } catch (error) {

                console.error(
                    "Create Event Error:",
                    error
                );


                // ====================================
                // Show Error
                // ====================================

                if (
                    error instanceof TypeError
                ) {

                    showError(
                        "Unable to connect to the server. Please make sure the backend server is running."
                    );

                } else {

                    showError(
                        error.message ||
                        "Something went wrong. Please try again."
                    );

                }


                // ====================================
                // Reset Button
                // ====================================

                createEventButton.disabled =
                    false;

                createEventButton.textContent =
                    "Create Event";

            }

        }
    );

}