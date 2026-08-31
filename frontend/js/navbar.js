// ========================================
// Mobile Menu
// ========================================

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const mobileMenu =
    document.getElementById("mobileMenu");


if (mobileMenuButton && mobileMenu) {

    mobileMenuButton.addEventListener("click", () => {

        mobileMenu.classList.toggle("hidden");

    });

}


// ========================================
// Desktop Login Dropdown
// ========================================

const loginDropdownButton =
    document.getElementById("loginDropdownButton");

const loginDropdown =
    document.getElementById("loginDropdown");


if (loginDropdownButton && loginDropdown) {

    loginDropdownButton.addEventListener("click", (event) => {

        event.stopPropagation();

        loginDropdown.classList.toggle("hidden");

    });


    document.addEventListener("click", (event) => {

        if (
            !loginDropdown.contains(event.target) &&
            !loginDropdownButton.contains(event.target)
        ) {

            loginDropdown.classList.add("hidden");

        }

    });

}


// ========================================
// Mobile Login Dropdown
// ========================================

const mobileLoginButton =
    document.getElementById("mobileLoginButton");

const mobileLoginOptions =
    document.getElementById("mobileLoginOptions");


if (mobileLoginButton && mobileLoginOptions) {

    mobileLoginButton.addEventListener("click", () => {

        mobileLoginOptions.classList.toggle("hidden");

    });

}


// ========================================
// Fix Navbar Links
// ========================================

function adjustNavbarLinks() {

    const currentPath = window.location.pathname;
    const currentDir =
        currentPath.substring(0, currentPath.lastIndexOf("/") + 1);

    document.querySelectorAll("#navbar a[href]").forEach((link) => {

        let href = link.getAttribute("href");

        if (
            !href ||
            href.startsWith("http") ||
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("javascript") ||
            href.startsWith("/") ||
            href.startsWith("../")
        ) {
            return;
        }

        const cleanHref = href.replace(/^\.\//, "");

        const pagesIdx = currentPath.indexOf("/pages/");
        const rootDir =
            pagesIdx !== -1
                ? currentPath.substring(0, pagesIdx) + "/"
                : currentPath.substring(0, currentPath.lastIndexOf("/") + 1);

        const absoluteTarget = rootDir + cleanHref;

        const currentParts = currentDir.split("/").filter((p) => p);
        const targetParts = absoluteTarget.split("/").filter((p) => p);

        let commonLen = 0;

        while (
            commonLen < currentParts.length &&
            commonLen < targetParts.length &&
            currentParts[commonLen] === targetParts[commonLen]
        ) {
            commonLen++;
        }

        let relativePath = "";

        for (let i = commonLen; i < currentParts.length; i++) {
            relativePath += "../";
        }

        for (let i = commonLen; i < targetParts.length; i++) {
            relativePath += targetParts[i] + "/";
        }

        relativePath = relativePath.replace(/\/$/, "");

        if (!relativePath) {
            relativePath = "./";
        }

        link.setAttribute("href", relativePath);

    });

}

adjustNavbarLinks();
