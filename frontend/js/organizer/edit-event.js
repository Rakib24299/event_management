// ========================================
// EventEase Edit Event
// ========================================


const API_URL =
    "http://localhost:5000/api/v1";



// ========================================
// Get Event ID
// ========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const eventId =
    urlParams.get("id");



// ========================================
// Elements
// ========================================

const editEventForm =
    document.getElementById(
        "editEventForm"
    );


const pageLoading =
    document.getElementById(
        "pageLoading"
    );


const pageError =
    document.getElementById(
        "pageError"
    );


const pageSuccess =
    document.getElementById(
        "pageSuccess"
    );


const saveButton =
    document.getElementById(
        "saveButton"
    );


const titleInput =
    document.getElementById(
        "title"
    );


const slugInput =
    document.getElementById(
        "slug"
    );


const categoryInput =
    document.getElementById(
        "category"
    );


const descriptionInput =
    document.getElementById(
        "description"
    );


const venueNameInput =
    document.getElementById(
        "venueName"
    );


const streetInput =
    document.getElementById(
        "street"
    );


const cityInput =
    document.getElementById(
        "city"
    );


const countryInput =
    document.getElementById(
        "country"
    );


const eventDateInput =
    document.getElementById(
        "eventDate"
    );


const startTimeInput =
    document.getElementById(
        "startTime"
    );


const endTimeInput =
    document.getElementById(
        "endTime"
    );


const eventTypeInput =
    document.getElementById(
        "eventType"
    );


const ticketPriceInput =
    document.getElementById(
        "ticketPrice"
    );


const totalSeatsInput =
    document.getElementById(
        "totalSeats"
    );


const maxTicketsInput =
    document.getElementById(
        "maxTicketsPerUser"
    );


const statusInput =
    document.getElementById(
        "status"
    );


const statusDisplay =
    document.getElementById(
        "statusDisplay"
    );



// ========================================
// Show Error
// ========================================

function showError(message) {

    pageError.textContent =
        message;

    pageError.classList.remove(
        "hidden"
    );

}



// ========================================
// Hide Error
// ========================================

function hideError() {

    pageError.textContent =
        "";

    pageError.classList.add(
        "hidden"
    );

}



// ========================================
// Show Success
// ========================================

function showSuccess(message) {

    pageSuccess.textContent =
        message;

    pageSuccess.classList.remove(
        "hidden"
    );

}



// ========================================
// Hide Loading
// ========================================

function hideLoading() {

    pageLoading.classList.add(
        "hidden"
    );

}



// ========================================
// Get Token
// ========================================

function getToken() {

    return localStorage.getItem(
        "token"
    );

}



// ========================================
// Format Date
// ========================================

function formatDateForInput(
    date
) {

    if (!date) {

        return "";

    }


    const formattedDate =
        new Date(date);


    const year =
        formattedDate.getFullYear();


    const month =
        String(
            formattedDate.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            formattedDate.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}



// ========================================
// Load Categories
// ========================================

async function loadCategories(
    selectedCategory
) {

    try {

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
            result.data || [];


        categoryInput.innerHTML =
            `<option value="">
                Select Category
            </option>`;


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


                if (
                    category._id ===
                    selectedCategory
                ) {

                    option.selected =
                        true;

                }


                categoryInput.appendChild(
                    option
                );

            }
        );

    } catch (error) {

        console.error(
            "Category Error:",
            error
        );

        throw error;

    }

}



// ========================================
// Load Event
// ========================================

async function loadEvent() {

    hideError();


    if (!eventId) {

        hideLoading();

        showError(
            "Event ID was not provided."
        );

        return;

    }


    const token =
        getToken();


    if (!token) {

        hideLoading();

        showError(
            "You are not logged in. Please login first."
        );

        return;

    }


    try {

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


        const result =
            await response.json();


        console.log(
            "Event Response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load event."
            );

        }


        const event =
            result.data;


        if (!event) {

            throw new Error(
                "Event information was not received."
            );

        }


        // ====================================
        // Load Categories
        // ====================================

        await loadCategories(
            event.category?._id ||
            event.category
        );


        // ====================================
        // Fill Form
        // ====================================

        titleInput.value =
            event.title || "";


        slugInput.value =
            event.slug || "";


        descriptionInput.value =
            event.description || "";


        venueNameInput.value =
            event.venue?.venueName || "";


        streetInput.value =
            event.venue?.street || "";


        cityInput.value =
            event.venue?.city || "";


        countryInput.value =
            event.venue?.country ||
            "Bangladesh";


        eventDateInput.value =
            formatDateForInput(
                event.eventDate
            );


        startTimeInput.value =
            event.startTime || "";


        endTimeInput.value =
            event.endTime || "";


        eventTypeInput.value =
            event.eventType || "paid";


        ticketPriceInput.value =
            event.ticketPrice ?? 0;


        totalSeatsInput.value =
            event.totalSeats ?? 1;


        maxTicketsInput.value =
            event.maxTicketsPerUser ?? 5;


        statusDisplay.textContent =
            event.status
                ? event.status.charAt(0).toUpperCase() +
                  event.status.slice(1)
                : "Draft";


        // ====================================
        // Show Form
        // ====================================

        hideLoading();

        editEventForm.classList.remove(
            "hidden"
        );

    } catch (error) {

        console.error(
            "Load Event Error:",
            error
        );


        hideLoading();


        showError(
            error.message ||
            "Something went wrong while loading the event."
        );

    }

}



// ========================================
// Event Type Change
// ========================================

eventTypeInput.addEventListener(
    "change",
    () => {

        if (
            eventTypeInput.value ===
            "free"
        ) {

            ticketPriceInput.value =
                0;

            ticketPriceInput.disabled =
                true;

        } else {

            ticketPriceInput.disabled =
                false;

        }

    }
);



// ========================================
// Submit Form
// ========================================

editEventForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        hideError();

        pageSuccess.classList.add(
            "hidden"
        );


        const token =
            getToken();


        if (!token) {

            showError(
                "You are not logged in. Please login first."
            );

            return;

        }


        // ====================================
        // Get Values
        // ====================================

        const title =
            titleInput.value.trim();


        const slug =
            slugInput.value.trim()
            .toLowerCase();


        const category =
            categoryInput.value;


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
        // Basic Validation
        // ====================================

        if (!title) {

            showError(
                "Please enter event title."
            );

            titleInput.focus();

            return;

        }


        if (!slug) {

            showError(
                "Please enter event slug."
            );

            slugInput.focus();

            return;

        }


        if (!category) {

            showError(
                "Please select a category."
            );

            categoryInput.focus();

            return;

        }


        if (!description) {

            showError(
                "Please enter event description."
            );

            descriptionInput.focus();

            return;

        }


        if (!venueName) {

            showError(
                "Please enter venue name."
            );

            venueNameInput.focus();

            return;

        }


        if (!eventDate) {

            showError(
                "Please select event date."
            );

            eventDateInput.focus();

            return;

        }


        if (!startTime) {

            showError(
                "Please select start time."
            );

            startTimeInput.focus();

            return;

        }


        if (!endTime) {

            showError(
                "Please select end time."
            );

            endTimeInput.focus();

            return;

        }


        if (
            eventType === "paid" &&
            ticketPrice <= 0
        ) {

            showError(
                "Paid events must have a ticket price greater than 0."
            );

            ticketPriceInput.focus();

            return;

        }


        if (
            eventType === "free"
        ) {

            ticketPriceInput.value =
                0;

        }


        if (
            totalSeats < 1
        ) {

            showError(
                "Total seats must be at least 1."
            );

            totalSeatsInput.focus();

            return;

        }


        if (
            maxTicketsPerUser < 1
        ) {

            showError(
                "Maximum tickets per user must be at least 1."
            );

            maxTicketsInput.focus();

            return;

        }


        if (
            maxTicketsPerUser >
            totalSeats
        ) {

            showError(
                "Maximum tickets per user cannot exceed total seats."
            );

            maxTicketsInput.focus();

            return;

        }



        // ====================================
        // Loading State
        // ====================================

        saveButton.disabled =
            true;


        saveButton.textContent =
            "Saving Changes...";



        try {

            // =================================
            // API Request
            // =================================

            const response =
                await fetch(
                    `${API_URL}/events/${eventId}`,
                    {
                        method: "PATCH",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({

                                title,

                                slug,

                                category,

                                description,

                                venue: {

                                    venueName,

                                    street,

                                    city,

                                    country,

                                },

                                eventDate,

                                startTime,

                                endTime,

                                eventType,

                                ticketPrice:
                                    eventType === "free"
                                        ? 0
                                        : ticketPrice,

                                totalSeats,

                                maxTicketsPerUser,

                            })

                    }
                );


            const result =
                await response.json();


            console.log(
                "Update Event Response:",
                result
            );


            // =================================
            // API Error
            // =================================

            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Failed to update event."
                );

            }


            // =================================
            // Success
            // =================================

            showSuccess(
                "Event updated successfully."
            );


            saveButton.textContent =
                "Updated Successfully ✓";


            // =================================
            // Redirect
            // =================================

            setTimeout(
                () => {

                    window.location.href =
                        `./event-details.html?id=${encodeURIComponent(eventId)}`;

                },
                1000
            );


        } catch (error) {

            console.error(
                "Update Event Error:",
                error
            );


            showError(
                error.message ||
                "Something went wrong. Please try again."
            );


            saveButton.disabled =
                false;


            saveButton.textContent =
                "Save Changes";

        }

    }
);



// ========================================
// Initial Load
// ========================================

loadEvent();