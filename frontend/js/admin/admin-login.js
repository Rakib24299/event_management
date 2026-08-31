// ========================================
// EventEase Admin Login
// ========================================

const API_URL =
    "http://localhost:5000/api/v1";


// ========================================
// Elements
// ========================================

const loginForm =
    document.getElementById(
        "loginForm"
    );

const emailInput =
    document.getElementById(
        "email"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const loginButton =
    document.getElementById(
        "loginButton"
    );

const loginError =
    document.getElementById(
        "loginError"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
    );

const rememberMe =
    document.getElementById(
        "rememberMe"
    );


// ========================================
// Show Error
// ========================================

function showError(message) {

    if (!loginError) {

        alert(message);

        return;
    }


    loginError.textContent =
        message;

    loginError.classList.remove(
        "hidden"
    );

}


// ========================================
// Hide Error
// ========================================

function hideError() {

    if (!loginError) {
        return;
    }


    loginError.textContent =
        "";

    loginError.classList.add(
        "hidden"
    );

}


// ========================================
// Password Show / Hide
// ========================================

if (
    togglePassword &&
    passwordInput
) {

    togglePassword.addEventListener(
        "click",
        () => {

            const isPassword =
                passwordInput.type ===
                "password";


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

}


// ========================================
// Login Submit
// ========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            hideError();


            // ====================================
            // Get Input Values
            // ====================================

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

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

            loginButton.disabled =
                true;

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

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );


                // ====================================
                // Read API Response
                // ====================================

                const result =
                    await response.json();


                console.log(
                    "Admin Login Response:",
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
                        "Login failed. Please check your email and password."
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
                        "Admin information was not received."
                    );

                }


                if (!token) {

                    throw new Error(
                        "Authentication token was not received."
                    );

                }


                // ====================================
                // Check Admin Role
                // ====================================

                if (
                    user.role !==
                    "admin"
                ) {

                    throw new Error(
                        "This login page is only for administrators."
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

                if (rememberMe) {

                    localStorage.setItem(
                        "rememberMe",
                        rememberMe.checked
                            ? "true"
                            : "false"
                    );

                }


                // ====================================
                // Login Successful
                // ====================================

                loginButton.textContent =
                    "Login Successful ✓";


                console.log(
                    "Admin logged in successfully:",
                    user
                );


                // ====================================
                // Redirect Admin
                // ====================================

                setTimeout(
                    () => {

                        window.location.href =
                            "./dashboard.html";

                    },
                    700
                );


            } catch (error) {

                console.error(
                    "Admin Login Error:",
                    error
                );


                // ====================================
                // Connection Error
                // ====================================

                if (
                    error instanceof TypeError
                ) {

                    showError(
                        "Unable to connect to the server. Please make sure the backend server is running."
                    );

                } else {

                    showError(
                        error.message ||
                        "Something went wrong. Please try again."
                    );

                }


                // ====================================
                // Reset Button
                // ====================================

                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "Sign In";

            }

        }
    );

}