// Get a reference to the "Get Started" button
const getStartedButton = document.querySelector('.start a');

if (getStartedButton) {
    // We already know the URL is relative to the Pet Selection directory
    getStartedButton.href = "Pet Selection/pet-selection.html";
}

// The original script.js file had placeholder content. This replaces it with useful navigation logic.
