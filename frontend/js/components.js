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

    } catch (error) {

        console.error(
            "Component loading error:",
            error
        );

    }
}