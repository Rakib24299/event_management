// ========================================
// Load HTML Components
// ========================================

async function loadComponent(elementId, filePath) {

    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    try {

        const response = await fetch(filePath);

        if (!response.ok) {
            throw new Error(
                `Failed to load component: ${filePath}`
            );
        }

        const html = await response.text();

        element.innerHTML = html;


        if (elementId === "user-header") {

            updateNotificationBadge();

            attachLogoutListener();

        }


        window.dispatchEvent(
            new CustomEvent("componentLoaded", {
                detail: {
                    elementId: elementId,
                    filePath: filePath
                }
            })
        );

    } catch (error) {

        console.error(
            "Component loading error:",
            error
        );

    }

}


// ========================================
// Update Notification Badge
// ========================================

async function updateNotificationBadge() {

    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (!badge) {
        return;
    }


    const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");


    if (!token) {

        badge.classList.add(
            "hidden"
        );

        badge.textContent = "0";

        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/v1/notifications/unread-count",
                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`,

                    },

                }
            );


        const result =
            await response.json();


        if (
            response.ok &&
            result.success &&
            result.data
        ) {

            const count =
                result.data.unreadCount ||
                0;


            badge.textContent = count;


            if (count > 0) {

                badge.classList.remove(
                    "hidden"
                );

            } else {

                badge.classList.add(
                    "hidden"
                );

            }

        } else {

            badge.classList.add(
                "hidden"
            );

            badge.textContent = "0";

        }

    } catch (error) {

        console.error(
            "Notification badge error:",
            error
        );

    }

}


// ========================================
// Auto-Update Badge on Load
// ========================================

updateNotificationBadge();


// ========================================
// Attach Logout Listener
// ========================================

function attachLogoutListener() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (!logoutBtn) {

        return;

    }


    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            sessionStorage.removeItem(
                "token"
            );


            window.location.replace(
                "./user-login.html"
            );

        }
    );
}


updateNotificationBadge();
