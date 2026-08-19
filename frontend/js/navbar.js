const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const mobileMenu =
    document.getElementById("mobileMenu");


if (mobileMenuButton && mobileMenu) {

    mobileMenuButton.addEventListener("click", () => {

        mobileMenu.classList.toggle("hidden");

    });

}