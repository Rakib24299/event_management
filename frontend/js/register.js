// ========================================
// EventEase Registration
// ========================================

const API_URL = "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const registerForm =
    document.getElementById("registerForm");

const registerButton =
    document.getElementById("registerButton");

const registerError =
    document.getElementById("registerError");

const registerSuccess =
    document.getElementById("registerSuccess");

const organizerFields =
    document.getElementById("organizerFields");

const organizationName =
    document.getElementById("organizationName");

const tradeLicense =
    document.getElementById("tradeLicense");


// ========================================
// Role Change
// ========================================

const roleInputs =
    document.querySelectorAll(
        'input[name="role"]'
    );


roleInputs.forEach((input) => {

    input.addEventListener("change", () => {

        if (input.value === "organizer" && input.checked) {

            organizerFields.classList.remove("hidden");

            organizationName.required = true;

            tradeLicense.required = true;

        } else {

            organizerFields.classList.add("hidden");

            organizationName.required = false;

            tradeLicense.required = false;

        }

    });

});


// ========================================
// Error
// ========================================

function showError(message) {

    registerSuccess.classList.add("hidden");

    registerError.textContent = message;

    registerError.classList.remove("hidden");

}


// ========================================
// Success
// ========================================

function showSuccess(message) {

    registerError.classList.add("hidden");

    registerSuccess.textContent = message;

    registerSuccess.classList.remove("hidden");

}


// ========================================
// Form Submit
// ========================================

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        registerError.classList.add("hidden");

        registerSuccess.classList.add("hidden");


        // ========================================
        // Get Values
        // ========================================

        const name =
            document.getElementById("name")
                .value
                .trim();

        const email =
            document.getElementById("email")
                .value
                .trim()
                .toLowerCase();

        const phone =
            document.getElementById("phone")
                .value
                .trim();

        const address =
            document.getElementById("address")
                .value
                .trim();

        const password =
            document.getElementById("password")
                .value;

        const confirmPassword =
            document.getElementById("confirmPassword")
                .value;

        const role =
            document.querySelector(
                'input[name="role"]:checked'
            ).value;


        // ========================================
        // Password Check
        // ========================================

        if (password !== confirmPassword) {

            showError(
                "Passwords do not match."
            );

            return;
        }


        if (password.length < 8) {

            showError(
                "Password must be at least 8 characters."
            );

            return;
        }


        // ========================================
        // Phone Check
        // ========================================

        const phoneRegex =
            /^(\+8801|01)[3-9]\d{8}$/;


        if (!phoneRegex.test(phone)) {

            showError(
                "Please enter a valid Bangladeshi phone number."
            );

            return;
        }


        // ========================================
        // Request Data
        // ========================================

        let requestData = {

            name,

            email,

            phone,

            password,

            address

        };


        // ========================================
        // Organizer Data
        // ========================================

        let endpoint =
            "/auth/register";


        if (role === "organizer") {

            endpoint =
                "/auth/register-organizer";


            requestData.organizationName =
                organizationName.value.trim();


            requestData.tradeLicense =
                tradeLicense.value.trim();


            if (!requestData.organizationName) {

                showError(
                    "Organization name is required."
                );

                return;
            }


            if (!requestData.tradeLicense) {

                showError(
                    "Trade license is required."
                );

                return;
            }

        }


        // ========================================
        // Loading
        // ========================================

        registerButton.disabled = true;

        registerButton.textContent =
            "Creating Account...";


        try {

            // ========================================
            // API Request
            // ========================================

            const response =
                await fetch(
                    `${API_URL}${endpoint}`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                requestData
                            )

                    }
                );


            const result =
                await response.json();


            console.log(
                "Registration Response:",
                result
            );


            // ========================================
            // API Error
            // ========================================

            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Registration failed."
                );

            }


            // ========================================
            // Success
            // ========================================

            showSuccess(
                result.message ||
                "Registration successful."
            );


            registerButton.textContent =
                "Account Created";


            // ========================================
            // Redirect to Verify Email
            // ========================================

            setTimeout(() => {

                window.location.href =
                    `./verify-email.html?email=${encodeURIComponent(email)}`;

            }, 1000);


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );


            showError(
                error.message ||
                "Something went wrong. Please try again."
            );


            registerButton.disabled = false;

            registerButton.textContent =
                "Create Account";

        }

    }
);