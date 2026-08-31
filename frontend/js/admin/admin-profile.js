// ========================================
// EventEase Admin Profile
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

const profileContent =
    document.getElementById("profileContent");

const errorState =
    document.getElementById("errorState");

const errorMessage =
    document.getElementById("errorMessage");

const retryBtn =
    document.getElementById("retryBtn");

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
        "Please login as admin to access your profile."
    );

    window.location.href =
        "./admin-login.html";

}


// ========================================
// API Request
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


    // Try to parse JSON

    let data;

    try {

        data = await response.json();

    } catch (error) {

        throw new Error(
            "Server returned an invalid response."
        );

    }


    // Handle HTTP error

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

        return "-";

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
// Set Text
// ========================================

const setText = (
    id,
    value
) => {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value || "-";

    }

};


// ========================================
// Render Profile
// ========================================

const renderProfile = (
    user
) => {

    if (!user) {

        throw new Error(
            "Admin profile data was not found."
        );

    }


    // ------------------------------------
    // Basic Information
    // ------------------------------------

    const name =
        user.name || "Admin";


    const email =
        user.email || "-";


    const phone =
        user.phone || "-";


    const address =
        user.address || "-";


    const role =
        user.role || "admin";


    const status =
        user.status || "active";


    // ------------------------------------
    // Profile Name
    // ------------------------------------

    setText(
        "profileName",
        name
    );


    setText(
        "name",
        name
    );


    setText(
        "email",
        email
    );


    setText(
        "phone",
        phone
    );


    setText(
        "address",
        address
    );


    setText(
        "role",
        role
    );


    setText(
        "createdAt",
        formatDate(user.createdAt)
    );


    // ------------------------------------
    // Profile Initial
    // ------------------------------------

    const initialElement =
        document.getElementById(
            "profileInitial"
        );


    if (initialElement) {

        initialElement.textContent =
            name
                .trim()
                .charAt(0)
                .toUpperCase() || "A";

    }


    // ------------------------------------
    // Profile Image
    // ------------------------------------

    const imageContainer =
        document.getElementById(
            "profileImageContainer"
        );


    if (
        imageContainer &&
        user.profileImage &&
        user.profileImage.url
    ) {

        imageContainer.innerHTML = `

            <img
                src="${user.profileImage.url}"
                alt="Admin Profile"
                class="h-full w-full object-cover"
            >

        `;

    }


    // ------------------------------------
    // Status
    // ------------------------------------

    const statusElement =
        document.getElementById(
            "status"
        );


    if (statusElement) {

        statusElement.textContent =
            status.charAt(0).toUpperCase() +
            status.slice(1);


        if (status === "active") {

            statusElement.className =
                "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700";

        } else {

            statusElement.className =
                "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700";

        }

    }

};


// ========================================
// Load Admin Profile
// ========================================

const loadProfile = async () => {

    try {

        // -----------------------------
        // Show Loading
        // -----------------------------

        if (loadingState) {

            loadingState.classList.remove(
                "hidden"
            );

        }


        if (profileContent) {

            profileContent.classList.add(
                "hidden"
            );

        }


        if (errorState) {

            errorState.classList.add(
                "hidden"
            );

        }


        // -----------------------------
        // API Call
        // -----------------------------

        console.log(
            "Loading admin profile..."
        );


        console.log(
            "API:",
            `${API_BASE_URL}/user/me`
        );


        const result =
            await apiRequest(
                "/user/me"
            );


        console.log(
            "Admin profile response:",
            result
        );


        // -----------------------------
        // Get User Data
        // -----------------------------

        const user =
            result.data;


        // -----------------------------
        // Render
        // -----------------------------

        renderProfile(
            user
        );


        // -----------------------------
        // Hide Loading
        // -----------------------------

        if (loadingState) {

            loadingState.classList.add(
                "hidden"
            );

        }


        if (profileContent) {

            profileContent.classList.remove(
                "hidden"
            );

        }

    } catch (error) {

        console.error(
            "Admin profile error:",
            error
        );


        // -----------------------------
        // Hide Loading
        // -----------------------------

        if (loadingState) {

            loadingState.classList.add(
                "hidden"
            );

        }


        if (profileContent) {

            profileContent.classList.add(
                "hidden"
            );

        }


        // -----------------------------
        // Show Error
        // -----------------------------

        if (errorState) {

            errorState.classList.remove(
                "hidden"
            );

        }


        if (errorMessage) {

            errorMessage.textContent =
                error.message ||
                "Failed to load admin profile.";

        }

    }

};


// ========================================
// Retry
// ========================================

if (retryBtn) {

    retryBtn.addEventListener(
        "click",
        loadProfile
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
// Load Profile
// ========================================

loadProfile();