// EventEase Admin Profile Management

const API_BASE_URL = "http://localhost:5000/api/v1";

// DOM Elements
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const retryBtn = document.getElementById("retryBtn");
const profileContent = document.getElementById("profileContent");
const alertBox = document.getElementById("alertBox");

// View / Edit Containers
const profileViewSection = document.getElementById("profileViewSection");
const profileEditSection = document.getElementById("profileEditSection");

// View Mode Elements
const viewAvatarContainer = document.getElementById("viewAvatarContainer");
const viewAvatarInitial = document.getElementById("viewAvatarInitial");
const viewHeroName = document.getElementById("viewHeroName");
const viewHeroEmail = document.getElementById("viewHeroEmail");
const viewStatusBadge = document.getElementById("viewStatusBadge");

const viewName = document.getElementById("viewName");
const viewEmail = document.getElementById("viewEmail");
const viewPhone = document.getElementById("viewPhone");
const viewRole = document.getElementById("viewRole");
const viewAddress = document.getElementById("viewAddress");
const viewStatusText = document.getElementById("viewStatusText");
const viewCreatedAt = document.getElementById("viewCreatedAt");

// Edit Mode Elements
const openEditBtn = document.getElementById("openEditBtn");
const cancelEditTopBtn = document.getElementById("cancelEditTopBtn");
const cancelEditBottomBtn = document.getElementById("cancelEditBottomBtn");
const editProfileForm = document.getElementById("editProfileForm");
const editAvatarContainer = document.getElementById("editAvatarContainer");
const editAvatarInitial = document.getElementById("editAvatarInitial");
const choosePhotoBtn = document.getElementById("choosePhotoBtn");
const removePhotoBtn = document.getElementById("removePhotoBtn");
const photoFileInput = document.getElementById("photoFileInput");

const editName = document.getElementById("editName");
const editEmail = document.getElementById("editEmail");
const editPhone = document.getElementById("editPhone");
const editAddress = document.getElementById("editAddress");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const saveBtnSpinner = document.getElementById("saveBtnSpinner");

// Error Spans
const nameError = document.getElementById("nameError");
const phoneError = document.getElementById("phoneError");
const addressError = document.getElementById("addressError");

const logoutBtn = document.getElementById("logoutBtn");

// State
let currentAdmin = null;

// Authentication
const getToken = () => {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken")
    );
};

const token = getToken();
if (!token) {
    alert("Please log in as an administrator to access your profile.");
    window.location.href = "./admin-login.html";
}

// API Request Helper
const apiRequest = async (endpoint, options = {}) => {
    const activeToken = getToken();
    const isFormData = options.body instanceof FormData;
    const headers = {
        Authorization: `Bearer ${activeToken}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    let data;
    try {
        data = await response.json();
    } catch (e) {
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status} (${response.statusText})`);
        }
        throw new Error("Server returned an invalid response format.");
    }

    if (!response.ok) {
        throw new Error(data.message || "An unexpected error occurred.");
    }

    return data;
};

// Utility Functions
const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

const showAlert = (message, type = "success") => {
    if (!alertBox) return;
    alertBox.classList.remove("hidden", "bg-green-50", "text-green-800", "border-green-200", "bg-red-50", "text-red-800", "border-red-200", "border");
    alertBox.classList.add("border");

    if (type === "success") {
        alertBox.classList.add("bg-green-50", "text-green-800", "border-green-200");
    } else {
        alertBox.classList.add("bg-red-50", "text-red-800", "border-red-200");
    }

    alertBox.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="text-base">${type === "success" ? "✓" : "✕"}</span>
            <span>${message}</span>
        </div>
    `;

    alertBox.scrollIntoView({ behavior: "smooth", block: "nearest" });

    setTimeout(() => {
        alertBox.classList.add("hidden");
    }, 4000);
};

const clearErrors = () => {
    [nameError, phoneError, addressError].forEach(el => {
        if (el) {
            el.textContent = "";
            el.classList.add("hidden");
        }
    });
};

// Render Profile
const renderProfile = (user) => {
    currentAdmin = user;
    if (!user) return;

    const name = user.name || "Administrator";
    const email = user.email || "--";
    const phone = user.phone || "--";
    const address = user.address || "--";
    const role = user.role || "admin";
    const status = user.status || "active";
    const createdAt = formatDate(user.createdAt);
    const initial = name.trim().charAt(0).toUpperCase() || "A";

    // View Header Card
    if (viewHeroName) viewHeroName.textContent = name;
    if (viewHeroEmail) viewHeroEmail.textContent = email;

    // View Avatar
    let photoUrl = "";
    if (typeof user.profileImage === "string") {
        photoUrl = user.profileImage;
    } else if (user.profileImage && typeof user.profileImage === "object") {
        photoUrl = user.profileImage.url || user.profileImage.secure_url || "";
    } else if (typeof user.image === "string") {
        photoUrl = user.image;
    } else if (user.image && typeof user.image === "object") {
        photoUrl = user.image.url || user.image.secure_url || "";
    }

    if (photoUrl) {
        viewAvatarContainer.innerHTML = `
            <img src="${photoUrl}" alt="${name}" class="h-full w-full object-cover">
        `;
        editAvatarContainer.innerHTML = `
            <img src="${photoUrl}" alt="${name}" class="h-full w-full object-cover">
        `;
        if (removePhotoBtn) removePhotoBtn.classList.remove("hidden");
    } else {
        viewAvatarContainer.innerHTML = `
            <span id="viewAvatarInitial" class="text-3xl sm:text-4xl font-extrabold text-primary">${initial}</span>
        `;
        editAvatarContainer.innerHTML = `
            <span id="editAvatarInitial" class="text-2xl sm:text-3xl font-bold text-primary">${initial}</span>
        `;
        if (removePhotoBtn) removePhotoBtn.classList.add("hidden");
    }

    // Status Badge
    if (viewStatusBadge) {
        viewStatusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        viewStatusBadge.className = status === "active"
            ? "rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-700"
            : "rounded-full bg-red-100 px-3.5 py-1 text-xs font-bold text-red-700";
    }

    // View Information Details
    if (viewName) viewName.textContent = name;
    if (viewEmail) viewEmail.textContent = email;
    if (viewPhone) viewPhone.textContent = phone;
    if (viewRole) viewRole.textContent = role === "admin" ? "Administrator" : role;
    if (viewAddress) viewAddress.textContent = address;
    if (viewStatusText) {
        viewStatusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        viewStatusText.className = status === "active"
            ? "mt-2 font-semibold text-emerald-600"
            : "mt-2 font-semibold text-red-600";
    }
    if (viewCreatedAt) viewCreatedAt.textContent = createdAt;

    // Populate Edit Form
    if (editName) editName.value = user.name || "";
    if (editEmail) editEmail.value = user.email || "";
    if (editPhone) editPhone.value = user.phone || "";
    if (editAddress) editAddress.value = user.address || "";
};

// Mode Switching
const showEditMode = () => {
    clearErrors();
    profileViewSection.classList.add("hidden");
    profileEditSection.classList.remove("hidden");
    if (editName) editName.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const showViewMode = () => {
    clearErrors();
    profileEditSection.classList.add("hidden");
    profileViewSection.classList.remove("hidden");
    if (currentAdmin) renderProfile(currentAdmin);
    window.scrollTo({ top: 0, behavior: "smooth" });
};

// Load Admin Profile
const loadProfile = async () => {
    try {
        if (loadingState) loadingState.classList.remove("hidden");
        if (errorState) errorState.classList.add("hidden");
        if (profileContent) profileContent.classList.add("hidden");

        const result = await apiRequest("/users/me");
        renderProfile(result.data);

        if (loadingState) loadingState.classList.add("hidden");
        if (profileContent) profileContent.classList.remove("hidden");
    } catch (err) {
        console.error("Load Admin Profile Error:", err);
        if (loadingState) loadingState.classList.add("hidden");
        if (errorState) errorState.classList.remove("hidden");
        if (errorMessage) errorMessage.textContent = err.message || "Failed to load admin profile.";
    }
};

// Update Profile Form Submission
if (editProfileForm) {
    editProfileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearErrors();

        const nameVal = editName.value.trim();
        const phoneVal = editPhone.value.trim();
        const addressVal = editAddress.value.trim();

        // Validation
        if (!nameVal || nameVal.length < 3) {
            nameError.textContent = "Full name must be at least 3 characters.";
            nameError.classList.remove("hidden");
            return;
        }

        if (phoneVal && !/^(\+8801|01)[3-9]\d{8}$/.test(phoneVal)) {
            phoneError.textContent = "Please enter a valid phone number (e.g. 01712345678).";
            phoneError.classList.remove("hidden");
            return;
        }

        try {
            saveProfileBtn.disabled = true;
            if (saveBtnSpinner) saveBtnSpinner.classList.remove("hidden");

            const payload = {
                name: nameVal,
                ...(phoneVal ? { phone: phoneVal } : {}),
                ...(addressVal ? { address: addressVal } : {})
            };

            const result = await apiRequest("/users/update-profile", {
                method: "PATCH",
                body: JSON.stringify(payload)
            });

            renderProfile(result.data);
            showViewMode();
            showAlert("Profile updated successfully!", "success");
        } catch (err) {
            console.error("Update Profile Error:", err);
            showAlert(err.message || "Failed to update profile.", "error");
        } finally {
            saveProfileBtn.disabled = false;
            if (saveBtnSpinner) saveBtnSpinner.classList.add("hidden");
        }
    });
}

// Upload Photo (Inside Edit Profile)
if (choosePhotoBtn && photoFileInput) {
    choosePhotoBtn.addEventListener("click", () => {
        photoFileInput.click();
    });

    photoFileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showAlert("Please select an image file (JPG, PNG, etc).", "error");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showAlert("Image size must be less than 5MB.", "error");
            return;
        }

        const formData = new FormData();
        formData.append("profileImage", file);

        try {
            showAlert("Uploading photo...", "success");
            const result = await apiRequest("/users/profile-image", {
                method: "PATCH",
                body: formData
            });

            renderProfile(result.data);
            showAlert("Photo uploaded successfully!", "success");
        } catch (err) {
            console.error("Avatar Upload Error:", err);
            showAlert(err.message || "Failed to upload photo.", "error");
        } finally {
            photoFileInput.value = "";
        }
    });
}

// Remove Photo (Inside Edit Profile)
if (removePhotoBtn) {
    removePhotoBtn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to remove your profile picture?")) return;

        try {
            await apiRequest("/users/profile-image", {
                method: "DELETE"
            });

            if (currentAdmin) {
                currentAdmin.profileImage = null;
                renderProfile(currentAdmin);
            }
            showAlert("Profile picture removed.", "success");
        } catch (err) {
            console.error("Delete Avatar Error:", err);
            showAlert(err.message || "Failed to remove photo.", "error");
        }
    });
}

// Button Listeners
if (openEditBtn) openEditBtn.addEventListener("click", showEditMode);
if (cancelEditTopBtn) cancelEditTopBtn.addEventListener("click", showViewMode);
if (cancelEditBottomBtn) cancelEditBottomBtn.addEventListener("click", showViewMode);
if (retryBtn) retryBtn.addEventListener("click", loadProfile);

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("accessToken");
        window.location.href = "./admin-login.html";
    });
}

// Initial Load
loadProfile();
