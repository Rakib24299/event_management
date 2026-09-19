// Organizer Edit Profile
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

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const phoneInput =
    document.getElementById("phone");

const addressInput =
    document.getElementById("address");

const organizationNameInput =
    document.getElementById("organizationName");


const profileForm =
    document.getElementById("profileForm");

const saveProfileButton =
    document.getElementById("saveProfileButton");

const profileMessage =
    document.getElementById("profileMessage");


const profileImageInput =
    document.getElementById("profileImageInput");

const deleteProfileImageButton =
    document.getElementById("deleteProfileImageButton");

const profileImageStatus =
    document.getElementById("profileImageStatus");


const organizationLogo =
    document.getElementById("organizationLogo");

const organizationLogoInput =
    document.getElementById("organizationLogoInput");

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


    // Token check

    if (!token) {

        throw new Error(
            "You are not logged in."
        );

    }


    const headers = {
        ...(options.headers || {}),
    };


    // JSON Content-Type
    // Do not add it for FormData

    if (!(options.body instanceof FormData)) {

        headers["Content-Type"] =
            "application/json";

    }


    // JWT Authorization

    headers["Authorization"] =
        `Bearer ${token}`;


    // Request

    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers,
            }
        );


    // Response Data

    let data = null;


    try {

        data =
            await response.json();

    } catch {

        data = null;

    }


    // Error

    if (!response.ok) {

        throw new Error(
            data?.message ||
            "Something went wrong."
        );

    }


    return data;

}


// Show Message

function showMessage(
    message,
    type = "success"
) {

    if (!profileMessage) {
        return;
    }


    profileMessage.textContent =
        message;


    profileMessage.classList.remove(
        "hidden",
        "bg-green-50",
        "text-green-700",
        "bg-red-50",
        "text-red-700"
    );


    if (type === "success") {

        profileMessage.classList.add(
            "bg-green-50",
            "text-green-700"
        );

    } else {

        profileMessage.classList.add(
            "bg-red-50",
            "text-red-700"
        );

    }


    setTimeout(() => {

        profileMessage.classList.add(
            "hidden"
        );

    }, 4000);

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


    // IMPORTANT SECURITY CHECK

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

    if (nameInput) {

        nameInput.value =
            user.name || "";

    }


    if (emailInput) {

        emailInput.value =
            user.email || "";

    }


    if (phoneInput) {

        phoneInput.value =
            user.phone || "";

    }


    if (addressInput) {

        addressInput.value =
            user.address || "";

    }


    if (organizationNameInput) {

        organizationNameInput.value =
            user.organizationName || "";

    }


    // Profile Image

    const profileImageUrl =
        user.profileImage?.url;


    if (profileImage) {

        profileImage.src =
            profileImageUrl ||
            getDefaultImage("profile");

    }


    // Show / Hide Delete Button

    if (deleteProfileImageButton) {

        if (profileImageUrl) {

            deleteProfileImageButton.classList.remove(
                "hidden"
            );

        } else {

            deleteProfileImageButton.classList.add(
                "hidden"
            );

        }

    }


    // Organization Logo

    const organizationLogoUrl =
        user.organizationLogo?.url;


    if (organizationLogo) {

        organizationLogo.src =
            organizationLogoUrl ||
            getDefaultImage("logo");

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

        // Loading

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


        // Get currently logged-in user
        //
        // Backend:
        // JWT → decoded.id → req.user.id
        // → User.findById(req.user.id)

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


        // Render Organizer

        renderProfile(user);


        // Show Content

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


// Update Organizer Profile

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            try {

                if (saveProfileButton) {

                    saveProfileButton.disabled =
                        true;

                    saveProfileButton.textContent =
                        "Saving...";

                }


                const payload = {

                    name:
                        nameInput?.value.trim() || "",

                    phone:
                        phoneInput?.value.trim() || "",

                    address:
                        addressInput?.value.trim() || "",

                };


                const response =
                    await apiRequest(
                        "/users/update-profile",
                        {
                            method: "PATCH",

                            body:
                                JSON.stringify(
                                    payload
                                ),
                        }
                    );


                const updatedUser =
                    response?.data;


                if (updatedUser) {

                    renderProfile(
                        updatedUser
                    );

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            updatedUser
                        )
                    );

                }


                showMessage(
                    response?.message ||
                    "Organizer profile updated successfully.",
                    "success"
                );

            } catch (error) {

                console.error(
                    "Update organizer profile error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to update organizer profile.",
                    "error"
                );

            } finally {

                if (saveProfileButton) {

                    saveProfileButton.disabled =
                        false;

                    saveProfileButton.textContent =
                        "Save Changes";

                }

            }

        }
    );

}


// Upload Profile Image

if (profileImageInput) {

    profileImageInput.addEventListener(
        "change",
        async () => {

            const file =
                profileImageInput.files[0];


            if (!file) {

                return;

            }


            try {

                if (profileImageStatus) {

                    profileImageStatus.textContent =
                        "Uploading profile image...";

                }


                const formData =
                    new FormData();


                formData.append(
                    "profileImage",
                    file
                );


                const response =
                    await apiRequest(
                        "/users/profile-image",
                        {
                            method: "PATCH",
                            body: formData,
                        }
                    );


                const updatedUser =
                    response?.data;


                if (updatedUser) {

                    renderProfile(
                        updatedUser
                    );

                }


                if (profileImageStatus) {

                    profileImageStatus.textContent =
                        "Profile image uploaded successfully.";

                }

            } catch (error) {

                console.error(
                    "Profile image upload error:",
                    error
                );


                if (profileImageStatus) {

                    profileImageStatus.textContent =
                        error.message ||
                        "Unable to upload profile image.";

                }

            } finally {

                profileImageInput.value =
                    "";

            }

        }
    );

}


// Delete Profile Image

if (deleteProfileImageButton) {

    deleteProfileImageButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    "Are you sure you want to remove your profile image?"
                );


            if (!confirmed) {

                return;

            }


            try {

                deleteProfileImageButton.disabled =
                    true;

                deleteProfileImageButton.textContent =
                    "Removing...";


                const response =
                    await apiRequest(
                        "/users/profile-image",
                        {
                            method: "DELETE",
                        }
                    );


                if (profileImage) {

                    profileImage.src =
                        getDefaultImage("profile");

                }


                deleteProfileImageButton.classList.add(
                    "hidden"
                );


                if (profileImageStatus) {

                    profileImageStatus.textContent =
                        response?.message ||
                        "Profile image deleted successfully.";

                }

            } catch (error) {

                console.error(
                    "Delete profile image error:",
                    error
                );


                if (profileImageStatus) {

                    profileImageStatus.textContent =
                        error.message ||
                        "Unable to delete profile image.";

                }

            } finally {

                deleteProfileImageButton.disabled =
                    false;

                deleteProfileImageButton.textContent =
                    "Remove Profile Image";

            }

        }
    );

}


// Upload Organization Logo

if (organizationLogoInput) {

    organizationLogoInput.addEventListener(
        "change",
        async () => {

            const file =
                organizationLogoInput.files[0];


            if (!file) {

                return;

            }


            try {

                if (organizationLogoStatus) {

                    organizationLogoStatus.textContent =
                        "Uploading organization logo...";

                }


                const formData =
                    new FormData();


                formData.append(
                    "organizationLogo",
                    file
                );


                const response =
                    await apiRequest(
                        "/users/organization-logo",
                        {
                            method: "PATCH",
                            body: formData,
                        }
                    );


                const updatedUser =
                    response?.data;


                if (updatedUser) {

                    renderProfile(
                        updatedUser
                    );

                }


                if (organizationLogoStatus) {

                    organizationLogoStatus.textContent =
                        "Organization logo uploaded successfully.";

                }

            } catch (error) {

                console.error(
                    "Organization logo upload error:",
                    error
                );


                if (organizationLogoStatus) {

                    organizationLogoStatus.textContent =
                        error.message ||
                        "Unable to upload organization logo.";

                }

            } finally {

                organizationLogoInput.value =
                    "";

            }

        }
    );

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


            // Remove authentication token

            localStorage.removeItem("token");
            localStorage.removeItem("accessToken");


            // Redirect to Organizer Login

            window.location.href =
                "../auth/organizer-login.html";

        }
    );

}
