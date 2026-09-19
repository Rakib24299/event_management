// Organizer Profile (View Only)
// EventEase

const API_BASE_URL = "http://localhost:5000/api/v1";


// DOM Elements

const profileLoading =
    document.getElementById("profileLoading");

const profileError =
    document.getElementById("profileError");

const profileErrorMessage =
    document.getElementById("profileErrorMessage");

const retryProfileButton =
    document.getElementById("retryProfileButton");

const profileContent =
    document.getElementById("profileContent");


const profileImage =
    document.getElementById("profileImage");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileRole =
    document.getElementById("profileRole");


const viewName =
    document.getElementById("viewName");

const viewEmail =
    document.getElementById("viewEmail");

const viewPhone =
    document.getElementById("viewPhone");

const viewAddress =
    document.getElementById("viewAddress");

const viewOrganizationName =
    document.getElementById("viewOrganizationName");


const organizationLogo =
    document.getElementById("organizationLogo");

const organizationLogoStatus =
    document.getElementById("organizationLogoStatus");


const accountRole =
    document.getElementById("accountRole");

const accountStatus =
    document.getElementById("accountStatus");


// Get Logged-in User Token

function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken")
    );

}


// API Request Helper

async function apiRequest(
    endpoint,
    options = {}
) {

    const token = getToken();


    if (!token) {

        throw new Error(
            "You are not logged in."
        );

    }


    const headers = {
        ...(options.headers || {}),
    };


    if (!(options.body instanceof FormData)) {

        headers["Content-Type"] =
            "application/json";

    }


    headers["Authorization"] =
        `Bearer ${token}`;


    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers,
            }
        );


    let data = null;


    try {

        data =
            await response.json();

    } catch {

        data = null;

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            "Something went wrong."
        );

    }


    return data;

}


// Default Image

function getDefaultImage(
    type = "profile"
) {

    if (type === "logo") {

        return (
            "https://placehold.co/200x200?text=Logo"
        );

    }


    return (
        "https://placehold.co/200x200?text=Profile"
    );

}


// Render Organizer Profile

function renderProfile(user) {

    if (!user) {

        throw new Error(
            "Organizer profile data not found."
        );

    }


    if (user.role !== "organizer") {

        throw new Error(
            "The logged-in account is not an organizer."
        );

    }


    console.log(
        "Rendering Organizer Profile:",
        user
    );


    // Basic Information

    if (profileName) {

        profileName.textContent =
            user.name || "Organizer";

    }


    if (profileEmail) {

        profileEmail.textContent =
            user.email || "";

    }


    if (profileRole) {

        profileRole.textContent =
            "Organizer";

    }


    if (viewName) {

        viewName.textContent =
            user.name || "--";

    }


    if (viewEmail) {

        viewEmail.textContent =
            user.email || "--";

    }


    if (viewPhone) {

        viewPhone.textContent =
            user.phone || "--";

    }


    if (viewAddress) {

        viewAddress.textContent =
            user.address || "--";

    }


    if (viewOrganizationName) {

        viewOrganizationName.textContent =
            user.organizationName || "--";

    }


    // Profile Image

    const profileImageUrl =
        user.profileImage?.url;


    if (profileImage) {

        profileImage.src =
            profileImageUrl ||
            getDefaultImage("profile");

    }


    // Organization Logo

    const organizationLogoUrl =
        user.organizationLogo?.url;


    if (organizationLogo) {

        organizationLogo.src =
            organizationLogoUrl ||
            getDefaultImage("logo");

    }


    if (organizationLogoStatus) {

        organizationLogoStatus.textContent =
            organizationLogoUrl
                ? "Logo uploaded."
                : "No logo uploaded. Use Edit Profile to add one.";

    }


    // Account Information

    if (accountRole) {

        accountRole.textContent =
            "Organizer";

    }


    if (accountStatus) {

        accountStatus.textContent =
            user.isActive === false
                ? "Inactive"
                : "Active";

    }

}


// Load Logged-in Organizer Profile

async function loadProfile() {

    try {

        if (profileLoading) {

            profileLoading.classList.remove(
                "hidden"
            );

        }


        if (profileError) {

            profileError.classList.add(
                "hidden"
            );

        }


        if (profileContent) {

            profileContent.classList.add(
                "hidden"
            );

        }


        const response =
            await apiRequest(
                "/users/me"
            );


        const user =
            response?.data;


        if (!user) {

            throw new Error(
                "Unable to find logged-in organizer."
            );

        }


        console.log(
            "Logged-in User:",
            user
        );


        renderProfile(user);


        if (profileLoading) {

            profileLoading.classList.add(
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
            "Load organizer profile error:",
            error
        );


        if (profileLoading) {

            profileLoading.classList.add(
                "hidden"
            );

        }


        if (profileError) {

            profileError.classList.remove(
                "hidden"
            );

        }


        if (profileErrorMessage) {

            profileErrorMessage.textContent =
                error.message ||
                "Unable to load organizer profile.";

        }

    }

}


// Retry Profile

if (retryProfileButton) {

    retryProfileButton.addEventListener(
        "click",
        () => {

            loadProfile();

        }
    );

}


// Initial Load

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProfile();

    }
);


// Organizer Logout

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem("token");
            localStorage.removeItem("accessToken");


            window.location.href =
                "../organizer/organizer-login.html";

        }
    );

}
