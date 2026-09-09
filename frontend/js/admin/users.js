// ========================================
// EventEase Admin Manage Users
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

const userList =
    document.getElementById("userList");

const emptyState =
    document.getElementById("emptyState");

const userCount =
    document.getElementById("userCount");

const searchInput =
    document.getElementById("searchInput");

const roleFilter =
    document.getElementById("roleFilter");

const statusFilter =
    document.getElementById("statusFilter");

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
// Escape HTML
// ========================================

const escapeHTML = (
    value
) => {

    if (
        value === null ||
        value === undefined
    ) {

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
// Format Date
// ========================================

const formatDate = (
    date
) => {

    if (!date) {

        return "N/A";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "N/A";

    }


    return parsedDate.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );

};


// ========================================
// Update User Count
// ========================================

const updateUserCount = (
    count
) => {

    if (!userCount) {

        return;

    }


    userCount.textContent =
        `${count} ${count === 1 ? "User" : "Users"}`;

};


// ========================================
// Get Status Badge
// ========================================

const getStatusBadge = (
    status
) => {

    if (status === "active") {

        return `

            <span
                class="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
            >
                <span>●</span>
                Active
            </span>

        `;

    }


    return `

        <span
            class="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
        >
            <span>●</span>
            Blocked
        </span>

    `;

};


// ========================================
// Get Role Badge
// ========================================

const getRoleBadge = (
    role
) => {

    if (role === "organizer") {

        return `

            <span
                class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
            >
                Organizer
            </span>

        `;

    }


    return `

        <span
            class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
        >
            User
        </span>

    `;

};


// ========================================
// Render Empty State
// ========================================

const renderEmptyState = () => {

    userList.innerHTML = "";

    emptyState.classList.remove(
        "hidden"
    );

};


// ========================================
// Render Users
// ========================================

const renderUsers = (
    users
) => {

    userList.innerHTML = "";

    emptyState.classList.add(
        "hidden"
    );


    if (
        !users ||
        users.length === 0
    ) {

        renderEmptyState();

        updateUserCount(0);

        return;

    }


    updateUserCount(
        users.length
    );


    users.forEach(
        (user) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "rounded-3xl bg-white p-6 shadow-soft";


            const profileImage =
                user.profileImage?.url ||
                "";


            const name =
                escapeHTML(
                    user.name ||
                    "Unnamed User"
                );


            const email =
                escapeHTML(
                    user.email ||
                    "No email"
                );


            const phone =
                escapeHTML(
                    user.phone ||
                    "Not provided"
                );


            const address =
                escapeHTML(
                    user.address ||
                    "Not provided"
                );


            const role =
                user.role ||
                "user";


            const status =
                user.status ||
                "active";


            const appliedDate =
                formatDate(
                    user.createdAt
                );


            card.innerHTML = `

                <div
                    class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
                >

                    <!-- ==================================
                         USER INFORMATION
                    =================================== -->

                    <div
                        class="flex min-w-0 items-start gap-4"
                    >

                        <!-- Profile Image -->

                        <div
                            class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primaryLight/20"
                        >

                            ${
                                profileImage
                                    ? `

                                        <img
                                            src="${escapeHTML(profileImage)}"
                                            alt="User"
                                            class="h-full w-full object-cover"
                                        >

                                      `
                                    : `

                                        <span class="text-2xl">
                                            <svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
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

                                ${getRoleBadge(role)}

                                ${getStatusBadge(status)}

                            </div>


                            <!-- Email -->

                            <p
                                class="mt-1 text-sm text-gray-500"
                            >
                                ${email}
                            </p>


                            <!-- User Details -->

                            <div
                                class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                            >

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


                                <!-- Address -->

                                <div>

                                    <p
                                        class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                                    >
                                        Address
                                    </p>

                                    <p
                                        class="mt-1 text-sm font-semibold text-gray-800"
                                    >
                                        ${address}
                                    </p>

                                </div>


                                <!-- Joined -->

                                <div>

                                    <p
                                        class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                                    >
                                        Joined
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

                        ${
                            status === "active"

                                ? `

                                    <button
                                        type="button"
                                        class="statusBtn w-full rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 lg:w-auto"
                                        data-id="${escapeHTML(user._id)}"
                                        data-status="active"
                                    >
                                        Block User
                                    </button>

                                  `

                                : `

                                    <button
                                        type="button"
                                        class="statusBtn w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primaryDark lg:w-auto"
                                        data-id="${escapeHTML(user._id)}"
                                        data-status="blocked"
                                    >
                                        Unblock User
                                    </button>

                                  `
                        }

                    </div>

                </div>

            `;


            userList.appendChild(
                card
            );

        }
    );


    attachStatusListeners();

};


// ========================================
// Attach Status Button Listeners
// ========================================

const attachStatusListeners = () => {

    const buttons =
        userList.querySelectorAll(
            ".statusBtn"
        );


    buttons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const userId =
                        button.dataset.id;

                    const currentStatus =
                        button.dataset.status;


                    updateUserStatus(
                        userId,
                        currentStatus,
                        button
                    );

                }
            );

        }
    );

};


// ========================================
// Update User Status
// ========================================

// ========================================
// Update User Status
// ========================================

const updateUserStatus = async (
    userId,
    currentStatus,
    button
) => {

    // =====================================
    // Validate User ID
    // =====================================

    if (!userId) {

        alert("Invalid user ID.");

        return;

    }


    // =====================================
    // Determine Action
    // =====================================

    const isBlocking =
        currentStatus === "active";

    const actionText =
        isBlocking
            ? "block"
            : "unblock";


    // =====================================
    // Confirmation
    // =====================================

    const confirmed =
        confirm(
            `Are you sure you want to ${actionText} this user?`
        );


    if (!confirmed) {

        return;

    }


    // =====================================
    // Disable Button
    // =====================================

    try {

        button.disabled = true;

        button.textContent =
            isBlocking
                ? "Blocking..."
                : "Unblocking...";


        // =================================
        // Correct Backend Endpoint
        // =================================

        const endpoint =
            isBlocking
                ? `/admin/users/${userId}/block`
                : `/admin/users/${userId}/unblock`;


        // =================================
        // API Request
        // =================================

        const result =
            await apiRequest(
                endpoint,
                {
                    method: "PATCH",
                }
            );


        // =================================
        // Success Message
        // =================================

        alert(
            result.message ||
            `User ${actionText}ed successfully.`
        );


        // =================================
        // Reload Users
        // =================================

        await loadUsers();


    } catch (error) {

        console.error(
            "Update user status error:",
            error
        );


        // =================================
        // Error Message
        // =================================

        alert(
            error.message ||
            `Failed to ${actionText} user.`
        );


        // =================================
        // Restore Button
        // =================================

        button.disabled = false;

        button.textContent =
            isBlocking
                ? "Block User"
                : "Activate User";

    }

};


// ========================================
// Filter Users
// ========================================

const filterUsers = () => {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedRole =
        roleFilter.value;


    const selectedStatus =
        statusFilter.value;


    const filteredUsers =
        allUsers.filter(
            (user) => {

                const name =
                    String(
                        user.name || ""
                    ).toLowerCase();


                const email =
                    String(
                        user.email || ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    email.includes(search);


                const matchesRole =
                    selectedRole === "all" ||
                    user.role === selectedRole;


                const matchesStatus =
                    selectedStatus === "all" ||
                    user.status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesRole &&
                    matchesStatus
                );

            }
        );


    renderUsers(
        filteredUsers
    );

};


// ========================================
// Load Users
// ========================================

let allUsers = [];


const loadUsers =
    async () => {

        try {

            // Loading state

            loadingState.classList.remove(
                "hidden"
            );

            content.classList.add(
                "hidden"
            );

            errorState.classList.add(
                "hidden"
            );


            // =================================
            // Get Users
            // =================================
            //
            // IMPORTANT:
            // This endpoint must match your backend.
            //
            // =================================

            const result =
                await apiRequest(
                    "/admin/users"
                );


            allUsers =
                result.data || [];


            renderUsers(
                allUsers
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
                "Load users error:",
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
                    "Failed to load users.";

            }

        }

    };


// ========================================
// Search Listener
// ========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterUsers
    );

}


// ========================================
// Role Filter
// ========================================

if (roleFilter) {

    roleFilter.addEventListener(
        "change",
        filterUsers
    );

}


// ========================================
// Status Filter
// ========================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterUsers
    );

}


// ========================================
// Retry
// ========================================

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        loadUsers
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

loadUsers();