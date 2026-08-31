// ========================================
// EventEase Admin Organizer Approval
// ========================================


// ========================================
// Configuration
// ========================================

const API_BASE_URL =
    "http://localhost:5000/api/v1";


// ========================================
// DOM Elements
// ========================================

const loadingState =
    document.getElementById("loadingState");

const errorState =
    document.getElementById("errorState");

const errorMessage =
    document.getElementById("errorMessage");

const retryBtn =
    document.getElementById("retryBtn");

const content =
    document.getElementById("content");

const organizerList =
    document.getElementById("organizerList");

const pendingCount =
    document.getElementById("pendingCount");

const logoutBtn =
    document.getElementById("logoutBtn");


// ========================================
// Get Token
// ========================================

const getToken = () => {

    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );

};


// ========================================
// Authentication Check
// ========================================

const token = getToken();


if (!token) {

    alert(
        "Please login as admin to access this page."
    );

    window.location.href =
        "./admin-login.html";

}


// ========================================
// API Request Helper
// ========================================

const apiRequest = async (
    endpoint,
    options = {}
) => {

    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {

                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`,

                    ...(options.headers || {}),

                },

            }
        );


    let data = {};

    try {

        data =
            await response.json();

    } catch (error) {

        data = {};

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Something went wrong."
        );

    }


    return data;

};


// ========================================
// Format Date
// ========================================

const formatDate = (
    date
) => {

    if (!date) {

        return "N/A";

    }


    return new Date(date)
        .toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );

};


// ========================================
// Escape HTML
// ========================================

const escapeHTML = (
    value
) => {

    if (value === null || value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

};


// ========================================
// Update Pending Count
// ========================================

const updatePendingCount = (
    count
) => {

    if (!pendingCount) {

        return;

    }


    pendingCount.textContent =
        `${count} Pending`;

};


// ========================================
// Render Empty State
// ========================================

const renderEmptyState = () => {

    organizerList.innerHTML = `

        <div
            class="rounded-3xl bg-white p-10 text-center shadow-soft"
        >

            <div
                class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl"
            >
                ✅
            </div>


            <h2
                class="mt-5 text-xl font-bold text-gray-900"
            >
                No Pending Organizers
            </h2>


            <p
                class="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500"
            >
                There are currently no organizer registration requests waiting for approval.
            </p>

        </div>

    `;

};


// ========================================
// Render Organizer List
// ========================================

const renderOrganizers = (
    organizers
) => {

    organizerList.innerHTML = "";


    if (
        !organizers ||
        organizers.length === 0
    ) {

        renderEmptyState();

        updatePendingCount(0);

        return;

    }


    updatePendingCount(
        organizers.length
    );


    organizers.forEach(
        (organizer) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "rounded-3xl bg-white p-6 shadow-soft";


            const profileImage =
                organizer.profileImage?.url ||
                "";


            const name =
                escapeHTML(
                    organizer.name ||
                    "Organizer"
                );


            const email =
                escapeHTML(
                    organizer.email ||
                    "No email available"
                );


            const organizationName =
                escapeHTML(
                    organizer.organizationName ||
                    "Organization not provided"
                );


            const phone =
                escapeHTML(
                    organizer.phone ||
                    "Not provided"
                );


            const appliedDate =
                formatDate(
                    organizer.createdAt
                );


            card.innerHTML = `

                <div
                    class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
                >

                    <!-- ==================================
                         ORGANIZER INFORMATION
                    =================================== -->

                    <div
                        class="flex min-w-0 items-start gap-4"
                    >

                        <!-- Profile -->

                        <div
                            class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primaryLight/20"
                        >

                            ${
                                profileImage
                                    ? `
                                        <img
                                            src="${escapeHTML(profileImage)}"
                                            alt="Organizer"
                                            class="h-full w-full object-cover"
                                        >
                                      `
                                    : `
                                        <span class="text-2xl">
                                            🧑‍💼
                                        </span>
                                      `
                            }

                        </div>


                        <!-- Details -->

                        <div class="min-w-0">

                            <div
                                class="flex flex-wrap items-center gap-2"
                            >

                                <h2
                                    class="truncate text-lg font-bold text-gray-900"
                                >
                                    ${name}
                                </h2>


                                <span
                                    class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
                                >
                                    Pending
                                </span>

                            </div>


                            <p
                                class="mt-1 text-sm text-gray-500"
                            >
                                ${email}
                            </p>


                            <div
                                class="mt-4 grid gap-3 sm:grid-cols-2"
                            >

                                <!-- Organization -->

                                <div>

                                    <p
                                        class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                                    >
                                        Organization
                                    </p>

                                    <p
                                        class="mt-1 text-sm font-semibold text-gray-800"
                                    >
                                        ${organizationName}
                                    </p>

                                </div>


                                <!-- Phone -->

                                <div>

                                    <p
                                        class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                                    >
                                        Phone
                                    </p>

                                    <p
                                        class="mt-1 text-sm font-semibold text-gray-800"
                                    >
                                        ${phone}
                                    </p>

                                </div>


                                <!-- Applied Date -->

                                <div>

                                    <p
                                        class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                                    >
                                        Applied
                                    </p>

                                    <p
                                        class="mt-1 text-sm font-semibold text-gray-800"
                                    >
                                        ${appliedDate}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>


                    <!-- ==================================
                         ACTION
                    =================================== -->

                    <div
                        class="flex shrink-0 lg:ml-6"
                    >

                        <button
                            type="button"
                            class="approveBtn w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                            data-id="${organizer._id}"
                        >
                            Approve Organizer
                        </button>

                    </div>

                </div>

            `;


            organizerList.appendChild(
                card
            );

        }
    );


    // Attach approve listeners

    const approveButtons =
        organizerList.querySelectorAll(
            ".approveBtn"
        );


    approveButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const organizerId =
                        button.dataset.id;


                    approveOrganizer(
                        organizerId,
                        button
                    );

                }
            );

        }
    );

};


// ========================================
// Load Pending Organizers
// ========================================

const loadPendingOrganizers =
    async () => {

        try {

            // Loading

            loadingState.classList.remove(
                "hidden"
            );

            content.classList.add(
                "hidden"
            );

            errorState.classList.add(
                "hidden"
            );


            // API

            const result =
                await apiRequest(
                    "/admin/pending-organizers"
                );


            const organizers =
                result.data || [];


            // Render

            renderOrganizers(
                organizers
            );


            // Show content

            loadingState.classList.add(
                "hidden"
            );

            content.classList.remove(
                "hidden"
            );

        } catch (error) {

            console.error(
                "Load organizers error:",
                error
            );


            loadingState.classList.add(
                "hidden"
            );

            content.classList.add(
                "hidden"
            );

            errorState.classList.remove(
                "hidden"
            );


            if (errorMessage) {

                errorMessage.textContent =
                    error.message ||
                    "Failed to load organizer applications.";

            }

        }

    };


// ========================================
// Approve Organizer
// ========================================

const approveOrganizer =
    async (
        organizerId,
        button
    ) => {

        if (!organizerId) {

            alert(
                "Invalid organizer ID."
            );

            return;

        }


        const confirmed =
            confirm(
                "Are you sure you want to approve this organizer?"
            );


        if (!confirmed) {

            return;

        }


        try {

            // Disable button

            button.disabled = true;

            button.textContent =
                "Approving...";


            // API

            const result =
                await apiRequest(
                    `/admin/approve-organizer/${organizerId}`,
                    {
                        method: "PATCH",
                    }
                );


            console.log(
                "Organizer approved:",
                result
            );


            alert(
                result.message ||
                "Organizer approved successfully."
            );


            // Reload list

            await loadPendingOrganizers();

        } catch (error) {

            console.error(
                "Approve organizer error:",
                error
            );


            alert(
                error.message ||
                "Failed to approve organizer."
            );


            // Restore button

            button.disabled = false;

            button.textContent =
                "Approve Organizer";

        }

    };


// ========================================
// Retry
// ========================================

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        loadPendingOrganizers
    );

}


// ========================================
// Logout
// ========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            sessionStorage.removeItem(
                "token"
            );


            window.location.href =
                "./admin-login.html";

        }
    );

}


// ========================================
// Initial Load
// ========================================

loadPendingOrganizers();