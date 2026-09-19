// EventEase Admin Category Management

// Configuration

const API_BASE_URL = "http://localhost:5000/api/v1";

// DOM Elements

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const retryBtn = document.getElementById("retryBtn");

const content = document.getElementById("content");
const categoryList = document.getElementById("categoryList");
const emptyState = document.getElementById("emptyState");
const emptyAddCategoryBtn =
    document.getElementById("emptyAddCategoryBtn");

const categoryCount = document.getElementById("categoryCount");
const searchInput = document.getElementById("searchInput");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Modal Elements

const categoryModal = document.getElementById("categoryModal");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const categoryForm = document.getElementById("categoryForm");
const categoryId = document.getElementById("categoryId");
const categoryName = document.getElementById("categoryName");

const saveCategoryBtn =
    document.getElementById("saveCategoryBtn");

const formError = document.getElementById("formError");

// Get Token

const getToken = () => {
    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );
};

// Authentication Check

const token = getToken();

if (!token) {
    alert("Please login as admin to access this page.");
    window.location.href = "./admin-login.html";
}

// API Request Helper

const apiRequest = async (endpoint, options = {}) => {
    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`,

                ...(options.headers || {}),
            },
        }
    );

    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong."
        );
    }

    return data;
};

// Generate Slug

const generateSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-");
};

// Escape HTML

const escapeHTML = (value) => {
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

// Update Category Count

const updateCategoryCount = (count) => {
    if (!categoryCount) {
        return;
    }

    categoryCount.textContent =
        `${count} ${
            count === 1
                ? "Category"
                : "Categories"
        }`;
};

// Open Add Modal

const openAddModal = () => {
    categoryForm.reset();

    categoryId.value = "";

    modalTitle.textContent = "Add Category";

    saveCategoryBtn.textContent = "Save Category";

    formError.classList.add("hidden");

    formError.textContent = "";

    categoryModal.classList.remove("hidden");

    categoryModal.classList.add("flex");

    setTimeout(() => {
        categoryName.focus();
    }, 100);
};

// Open Edit Modal

const openEditModal = (category) => {
    categoryId.value = category._id || "";

    categoryName.value = category.name || "";

    modalTitle.textContent = "Edit Category";

    saveCategoryBtn.textContent = "Update Category";

    formError.classList.add("hidden");

    formError.textContent = "";

    categoryModal.classList.remove("hidden");

    categoryModal.classList.add("flex");

    setTimeout(() => {
        categoryName.focus();
    }, 100);
};

// Close Modal

const closeModal = () => {
    categoryModal.classList.add("hidden");

    categoryModal.classList.remove("flex");

    categoryForm.reset();

    categoryId.value = "";

    formError.classList.add("hidden");

    formError.textContent = "";
};

// Show Form Error

const showFormError = (message) => {
    formError.textContent = message;

    formError.classList.remove("hidden");
};

// Get Category Status

const getCategoryStatus = (category) => {
    if (
        category.isDeleted === true ||
        category.status === "inactive"
    ) {
        return {
            text: "Inactive",
            className: "bg-red-100 text-red-700",
        };
    }

    return {
        text: "Active",
        className: "bg-green-100 text-green-700",
    };
};

// Render Empty State

const renderEmptyState = () => {
    categoryList.innerHTML = "";

    emptyState.classList.remove("hidden");
};

// Render Categories

const renderCategories = (categories) => {
    categoryList.innerHTML = "";

    emptyState.classList.add("hidden");

    if (
        !categories ||
        categories.length === 0
    ) {
        renderEmptyState();

        updateCategoryCount(0);

        return;
    }

    updateCategoryCount(categories.length);

    categories.forEach((category) => {
        const card = document.createElement("div");

        card.className =
            "rounded-3xl bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg";

        const name = escapeHTML(
            category.name || "Unnamed Category"
        );

        const id = escapeHTML(
            category._id
        );

        const slug = escapeHTML(
            category.slug || generateSlug(category.name || "")
        );

        const status =
            getCategoryStatus(category);

        card.innerHTML = `
            <div
                class="flex items-start justify-between gap-4"
            >

                <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primaryLight/15 text-xl"
                >
                    <svg class="h-5 w-5 text-current inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>

                <span
                    class="rounded-full px-3 py-1 text-xs font-semibold ${status.className}"
                >
                    ${status.text}
                </span>

            </div>

            <div class="mt-5">

                <h2
                    class="break-words text-xl font-bold text-gray-900"
                >
                    ${name}
                </h2>

                <p
                    class="mt-2 text-xs text-gray-400"
                >
                    Slug
                </p>

                <p
                    class="mt-1 truncate text-xs font-medium text-gray-500"
                    title="${slug}"
                >
                    ${slug}
                </p>

                <p
                    class="mt-3 text-xs text-gray-400"
                >
                    Category ID
                </p>

                <p
                    class="mt-1 truncate text-xs font-medium text-gray-500"
                    title="${id}"
                >
                    ${id}
                </p>

            </div>

            <div
                class="mt-6 flex gap-3"
            >

                <button
                    type="button"
                    class="editCategoryBtn flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    data-id="${id}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="deleteCategoryBtn flex-1 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    data-id="${id}"
                >
                    Delete
                </button>

            </div>
        `;

        categoryList.appendChild(card);
    });

    attachCategoryListeners();
};

// Attach Category Listeners

const attachCategoryListeners = () => {
    const editButtons =
        categoryList.querySelectorAll(
            ".editCategoryBtn"
        );

    const deleteButtons =
        categoryList.querySelectorAll(
            ".deleteCategoryBtn"
        );

    editButtons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                const id =
                    button.dataset.id;

                const category =
                    allCategories.find(
                        (item) =>
                            item._id === id
                    );

                if (!category) {
                    alert(
                        "Category not found."
                    );

                    return;
                }

                openEditModal(category);
            }
        );
    });

    deleteButtons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                const id =
                    button.dataset.id;

                deleteCategory(
                    id,
                    button
                );
            }
        );
    });
};

// Create / Update Category

const saveCategory = async (event) => {
    event.preventDefault();

    const name =
        categoryName.value.trim();

    const id =
        categoryId.value.trim();

    // Validation

    if (!name) {
        showFormError(
            "Category name is required."
        );

        categoryName.focus();

        return;
    }

    if (name.length < 2) {
        showFormError(
            "Category name must contain at least 2 characters."
        );

        categoryName.focus();

        return;
    }

    if (name.length > 100) {
        showFormError(
            "Category name cannot exceed 100 characters."
        );

        categoryName.focus();

        return;
    }

    // Generate Slug

    const slug = generateSlug(name);

    if (!slug) {
        showFormError(
            "Invalid category name."
        );

        categoryName.focus();

        return;
    }

    // Disable Button

    saveCategoryBtn.disabled = true;

    saveCategoryBtn.textContent =
        id
            ? "Updating..."
            : "Saving...";

    formError.classList.add("hidden");

    try {

        // UPDATE

        if (id) {
            const result =
                await apiRequest(
                    `/categories/${id}`,
                    {
                        method: "PATCH",

                        body: JSON.stringify({
                            name: name,
                            slug: slug,
                        }),
                    }
                );

            alert(
                result.message ||
                "Category updated successfully."
            );
        }

        // CREATE

        else {
            const result =
                await apiRequest(
                    "/categories",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            name: name,
                            slug: slug,
                        }),
                    }
                );

            alert(
                result.message ||
                "Category created successfully."
            );
        }

        closeModal();

        await loadCategories();

    } catch (error) {
        console.error(
            "Save category error:",
            error
        );

        showFormError(
            error.message ||
            "Failed to save category."
        );

    } finally {
        saveCategoryBtn.disabled = false;

        saveCategoryBtn.textContent =
            id
                ? "Update Category"
                : "Save Category";
    }
};

// Delete Category

const deleteCategory = async (
    id,
    button
) => {
    if (!id) {
        alert(
            "Invalid category ID."
        );

        return;
    }

    const category =
        allCategories.find(
            (item) =>
                item._id === id
        );

    const categoryNameText =
        category?.name ||
        "this category";

    const confirmed =
        confirm(
            `Are you sure you want to delete "${categoryNameText}"?`
        );

    if (!confirmed) {
        return;
    }

    try {
        button.disabled = true;

        button.textContent = "Deleting...";

        const result =
            await apiRequest(
                `/categories/${id}`,
                {
                    method: "DELETE",
                }
            );

        alert(
            result.message ||
            "Category deleted successfully."
        );

        await loadCategories();

    } catch (error) {
        console.error(
            "Delete category error:",
            error
        );

        alert(
            error.message ||
            "Failed to delete category."
        );

        button.disabled = false;

        button.textContent = "Delete";
    }
};

// Filter Categories

const filterCategories = () => {
    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const filteredCategories =
        allCategories.filter(
            (category) => {
                const name =
                    String(
                        category.name || ""
                    ).toLowerCase();

                const slug =
                    String(
                        category.slug || ""
                    ).toLowerCase();

                return (
                    name.includes(search) ||
                    slug.includes(search)
                );
            }
        );

    renderCategories(
        filteredCategories
    );
};

// Load Categories

let allCategories = [];

const loadCategories = async () => {
    try {
        loadingState.classList.remove(
            "hidden"
        );

        content.classList.add(
            "hidden"
        );

        errorState.classList.add(
            "hidden"
        );

        // API Request

        const result =
            await apiRequest(
                "/categories"
            );

        // Store Data

        allCategories =
            Array.isArray(result.data)
                ? result.data
                : [];

        // Render

        renderCategories(
            allCategories
        );

        // Show Content

        loadingState.classList.add(
            "hidden"
        );

        content.classList.remove(
            "hidden"
        );

    } catch (error) {
        console.error(
            "Load categories error:",
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
                "Failed to load categories.";
        }
    }
};

// Search Listener

if (searchInput) {
    searchInput.addEventListener(
        "input",
        filterCategories
    );
}

// Add Category

if (addCategoryBtn) {
    addCategoryBtn.addEventListener(
        "click",
        openAddModal
    );
}

if (emptyAddCategoryBtn) {
    emptyAddCategoryBtn.addEventListener(
        "click",
        openAddModal
    );
}

// Close Modal

if (closeModalBtn) {
    closeModalBtn.addEventListener(
        "click",
        closeModal
    );
}

if (cancelModalBtn) {
    cancelModalBtn.addEventListener(
        "click",
        closeModal
    );
}

// Form Submit

if (categoryForm) {
    categoryForm.addEventListener(
        "submit",
        saveCategory
    );
}

// Outside Modal Click

if (categoryModal) {
    categoryModal.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                categoryModal
            ) {
                closeModal();
            }
        }
    );
}

// Escape Key

document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape" &&
            categoryModal &&
            !categoryModal.classList.contains(
                "hidden"
            )
        ) {
            closeModal();
        }
    }
);

// Retry

if (retryBtn) {
    retryBtn.addEventListener(
        "click",
        loadCategories
    );
}

// Logout

if (logoutBtn) {
    logoutBtn.addEventListener(
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

            sessionStorage.removeItem("token");

            window.location.href =
                "./admin-login.html";
        }
    );
}

// Initial Load

loadCategories();