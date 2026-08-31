// ========================================
// EventEase User Profile
// ========================================

const API_URL = "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const profileImage =
    document.getElementById("profileImage");

const profileImageInput =
    document.getElementById("profileImageInput");

const changeImageButton =
    document.getElementById("changeImageButton");

const deleteImageButton =
    document.getElementById("deleteImageButton");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileRole =
    document.getElementById("profileRole");

const profileMessage =
    document.getElementById("profileMessage");

const editProfileButton =
    document.getElementById("editProfileButton");

const cancelEditButton =
    document.getElementById("cancelEditButton");

const profileView =
    document.getElementById("profileView");

const editProfileForm =
    document.getElementById("editProfileForm");

const editName =
    document.getElementById("editName");

const editEmail =
    document.getElementById("editEmail");

const editPhone =
    document.getElementById("editPhone");

const editAddress =
    document.getElementById("editAddress");

const saveProfileButton =
    document.getElementById("saveProfileButton");

const viewName =
    document.getElementById("viewName");

const viewEmail =
    document.getElementById("viewEmail");

const viewPhone =
    document.getElementById("viewPhone");

const viewAddress =
    document.getElementById("viewAddress");

const viewStatus =
    document.getElementById("viewStatus");

const viewVerification =
    document.getElementById("viewVerification");


// ========================================
// Variables
// ========================================

let currentUser = null;


// ========================================
// Token
// ========================================

const token =
    localStorage.getItem("token");


// ========================================
// Authentication Check
// ========================================

if (!token) {

    window.location.replace(
        "./user-login.html"
    );

}


window.addEventListener(
    "pageshow",
    () => {

        const currentToken =
            localStorage.getItem(
                "token"
            );


        if (!currentToken) {

            window.location.replace(
                "./user-login.html"
            );

        }

    }
);


// ========================================
// Show Message
// ========================================

function showMessage(message, type = "success") {

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


// ========================================
// Format Empty Value
// ========================================

function displayValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "Not provided";
    }

    return value;
}


// ========================================
// Get Profile
// ========================================

async function getMyProfile() {

    try {

        const response =
            await fetch(
                `${API_URL}/users/me`,
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
            "Profile Response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load profile."
            );
        }


        currentUser =
            result.data;


        displayProfile(
            currentUser
        );


    } catch (error) {

        console.error(
            "Get Profile Error:",
            error
        );


        showMessage(
            error.message ||
            "Failed to load profile.",
            "error"
        );
    }
}


// ========================================
// Display Profile
// ========================================

function displayProfile(user) {

    // ====================================
    // Profile Image
    // ====================================

    if (
        user.profileImage &&
        user.profileImage.url
    ) {

        profileImage.src =
            user.profileImage.url;

    } else {

        profileImage.src =
            "https://via.placeholder.com/150?text=User";
    }


    // ====================================
    // Header Information
    // ====================================

    profileName.textContent =
        displayValue(user.name);

    profileEmail.textContent =
        displayValue(user.email);

    profileRole.textContent =
        user.role || "user";


    // ====================================
    // View Information
    // ====================================

    viewName.textContent =
        displayValue(user.name);

    viewEmail.textContent =
        displayValue(user.email);

    viewPhone.textContent =
        displayValue(user.phone);

    viewAddress.textContent =
        displayValue(user.address);

    viewStatus.textContent =
        user.status === "active"
            ? "Active"
            : "Blocked";


    viewVerification.textContent =
        user.isVerified
            ? "Verified"
            : "Not Verified";
}


// ========================================
// Open Edit Mode
// ========================================

function openEditMode() {

    if (!currentUser) {
        return;
    }


    editName.value =
        currentUser.name || "";

    editEmail.value =
        currentUser.email || "";

    editPhone.value =
        currentUser.phone || "";

    editAddress.value =
        currentUser.address || "";


    profileView.classList.add(
        "hidden"
    );

    editProfileForm.classList.remove(
        "hidden"
    );

    editProfileButton.classList.add(
        "hidden"
    );
}


// ========================================
// Close Edit Mode
// ========================================

function closeEditMode() {

    profileView.classList.remove(
        "hidden"
    );

    editProfileForm.classList.add(
        "hidden"
    );

    editProfileButton.classList.remove(
        "hidden"
    );

    clearValidationErrors();
}


// ========================================
// Clear Validation Errors
// ========================================

function clearValidationErrors() {

    const errors = [
        "nameError",
        "phoneError",
        "addressError"
    ];


    errors.forEach((id) => {

        const element =
            document.getElementById(id);

        element.textContent =
            "";

        element.classList.add(
            "hidden"
        );
    });
}


// ========================================
// Update Profile
// ========================================

async function updateProfile(event) {

    event.preventDefault();

    clearValidationErrors();


    if (!currentUser) {
        return;
    }


    const name =
        editName.value.trim();

    const phone =
        editPhone.value.trim();

    const address =
        editAddress.value.trim();


    // ====================================
    // Frontend Validation
    // ====================================

    if (name.length < 3) {

        const error =
            document.getElementById(
                "nameError"
            );

        error.textContent =
            "Name must be at least 3 characters.";

        error.classList.remove(
            "hidden"
        );

        return;
    }


    if (name.length > 50) {

        const error =
            document.getElementById(
                "nameError"
            );

        error.textContent =
            "Name cannot exceed 50 characters.";

        error.classList.remove(
            "hidden"
        );

        return;
    }


    const phoneRegex =
        /^(\+8801|01)[3-9]\d{8}$/;


    if (!phoneRegex.test(phone)) {

        const error =
            document.getElementById(
                "phoneError"
            );

        error.textContent =
            "Please enter a valid Bangladesh phone number.";

        error.classList.remove(
            "hidden"
        );

        return;
    }


    if (address.length > 200) {

        const error =
            document.getElementById(
                "addressError"
            );

        error.textContent =
            "Address cannot exceed 200 characters.";

        error.classList.remove(
            "hidden"
        );

        return;
    }


    // ====================================
    // Payload
    // ====================================

    const payload = {

        name: name,

        phone: phone,

        address: address

    };


    console.log(
        "Update Profile Payload:",
        payload
    );


    saveProfileButton.disabled =
        true;

    saveProfileButton.textContent =
        "Saving...";


    try {

        const response =
            await fetch(
                `${API_URL}/users/update-profile`,
                {
                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const result =
            await response.json();


        console.log(
            "Update Profile Response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Profile update failed."
            );
        }


        currentUser =
            result.data;


        displayProfile(
            currentUser
        );


        closeEditMode();


        showMessage(
            result.message ||
            "Profile updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Update Profile Error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to update profile.",
            "error"
        );


    } finally {

        saveProfileButton.disabled =
            false;

        saveProfileButton.textContent =
            "Save Changes";
    }
}


// ========================================
// Upload Profile Image
// ========================================

async function uploadProfileImage(file) {

    if (!file) {
        return;
    }


    // ====================================
    // File Validation
    // ====================================

    if (!file.type.startsWith("image/")) {

        showMessage(
            "Please select a valid image file.",
            "error"
        );

        return;
    }


    const formData =
        new FormData();

    formData.append(
        "profileImage",
        file
    );


    changeImageButton.disabled =
        true;


    try {

        const response =
            await fetch(
                `${API_URL}/users/profile-image`,
                {
                    method: "PATCH",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: formData
                }
            );


        const result =
            await response.json();


        console.log(
            "Upload Profile Image Response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Profile image upload failed."
            );
        }


        currentUser =
            result.data;


        displayProfile(
            currentUser
        );


        showMessage(
            result.message ||
            "Profile image uploaded successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Upload Profile Image Error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to upload profile image.",
            "error"
        );


    } finally {

        changeImageButton.disabled =
            false;

        profileImageInput.value =
            "";
    }
}


// ========================================
// Delete Profile Image
// ========================================

async function deleteProfileImage() {

    if (!currentUser) {
        return;
    }


    if (
        !currentUser.profileImage ||
        !currentUser.profileImage.publicId
    ) {

        showMessage(
            "No profile image found.",
            "error"
        );

        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to remove your profile picture?"
        );


    if (!confirmed) {
        return;
    }


    deleteImageButton.disabled =
        true;

    deleteImageButton.textContent =
        "Removing...";


    try {

        const response =
            await fetch(
                `${API_URL}/users/profile-image`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const result =
            await response.json();


        console.log(
            "Delete Profile Image Response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to remove profile image."
            );
        }


        currentUser.profileImage = {

            url: "",

            publicId: ""
        };


        displayProfile(
            currentUser
        );


        showMessage(
            result.message ||
            "Profile image deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete Profile Image Error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to delete profile image.",
            "error"
        );


    } finally {

        deleteImageButton.disabled =
            false;

        deleteImageButton.textContent =
            "Remove Picture";
    }
}


// ========================================
// Event Listeners
// ========================================

editProfileButton.addEventListener(
    "click",
    openEditMode
);


cancelEditButton.addEventListener(
    "click",
    closeEditMode
);


editProfileForm.addEventListener(
    "submit",
    updateProfile
);


changeImageButton.addEventListener(
    "click",
    () => {

        profileImageInput.click();

    }
);


profileImageInput.addEventListener(
    "change",
    () => {

        const file =
            profileImageInput.files[0];

        uploadProfileImage(file);
    }
);


deleteImageButton.addEventListener(
    "click",
    deleteProfileImage
);


// ========================================
// Initialize
// ========================================

async function initializeProfilePage() {

    if (!token) {
        return;
    }

    await getMyProfile();
}


initializeProfilePage();