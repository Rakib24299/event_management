// ========================================
// EventEase Login
// ========================================

const API_URL = "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginError =
    document.getElementById("loginError");

const togglePassword =
    document.getElementById("togglePassword");

const rememberMe =
    document.getElementById("rememberMe");


// ========================================
// Show Error
// ========================================

function showError(message) {

    loginError.textContent = message;

    loginError.classList.remove("hidden");
}


// ========================================
// Hide Error
// ========================================

function hideError() {

    loginError.textContent = "";

    loginError.classList.add("hidden");
}


// ========================================
// Password Show / Hide
// ========================================

togglePassword.addEventListener(
    "click",
    () => {

        const isPassword =
            passwordInput.type === "password";


        passwordInput.type =
            isPassword
                ? "text"
                : "password";


        togglePassword.setAttribute(
            "aria-label",
            isPassword
                ? "Hide password"
                : "Show password"
        );

    }
);


// ========================================
// Login Submit
// ========================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        hideError();


        // ====================================
        // Get Input Values
        // ====================================

        const email =
            emailInput.value.trim().toLowerCase();

        const password =
            passwordInput.value;


        // ====================================
        // Basic Validation
        // ====================================

        if (!email) {

            showError(
                "Please enter your email address."
            );

            emailInput.focus();

            return;
        }


        if (!password) {

            showError(
                "Please enter your password."
            );

            passwordInput.focus();

            return;
        }


        // ====================================
        // Loading State
        // ====================================

        loginButton.disabled = true;

        loginButton.textContent =
            "Signing In...";


        try {

            // ====================================
            // API Request
            // ====================================

            const response =
                await fetch(
                    `${API_URL}/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );


            const result =
                await response.json();


            console.log(
                "Login Response:",
                result
            );


            // ====================================
            // API Error
            // ====================================

            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Login failed. Please check your credentials."
                );

            }


            // ====================================
            // Get User
            // ====================================

            const user =
                result.data?.user;


            // ====================================
            // Get Token
            // ====================================

            const token =
                result.data?.token;


            if (!user) {

                throw new Error(
                    "User information was not received."
                );

            }


            if (!token) {

                throw new Error(
                    "Login successful, but authentication token was not received."
                );

            }


            // ====================================
            // Save Token
            // ====================================

            localStorage.setItem(
                "token",
                token
            );


            // ====================================
            // Save User Data
            // ====================================

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            // ====================================
            // Remember Me
            // ====================================

            localStorage.setItem(
                "rememberMe",
                rememberMe.checked
                    ? "true"
                    : "false"
            );


            // ====================================
            // Get User Role
            // ====================================

            const role =
                user.role;


            console.log(
                "Logged in user:",
                user
            );

            console.log(
                "User role:",
                role
            );


            // ====================================
            // Login Successful
            // ====================================

            loginButton.textContent =
                "Login Successful";


            // ====================================
            // Role Based Redirect
            // ====================================

            setTimeout(() => {


                // ================================
                // Admin
                // ================================

                if (role === "admin") {

                    window.location.href =
                        "./admin/dashboard.html";

                    return;
                }


                // ================================
                // Organizer
                // ================================

                if (role === "organizer") {

                    window.location.href =
                        "./organizer/dashboard.html";

                    return;
                }


                // ================================
                // User
                // ================================

                if (role === "user") {

                    window.location.href =
                        "./user/dashboard.html";

                    return;
                }


                // ================================
                // Unknown Role
                // ================================

                showError(
                    "Your account role is not recognized."
                );

                loginButton.disabled = false;

                loginButton.textContent =
                    "Sign In";

            }, 700);


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );


            showError(
                error.message ||
                "Something went wrong. Please try again."
            );


            loginButton.disabled = false;

            loginButton.textContent =
                "Sign In";

        }

    }
);