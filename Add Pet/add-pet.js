/**
 * add-pet.js
 * JavaScript for the 'Add a Pet' page
 */

// 1. Get references to the key HTML elements we need to interact with
const petImageInput = document.querySelector('.pet-img');
const petInfoInputs = document.querySelectorAll('.pet-info input');
const addPetButton = document.querySelector('.addPetButton');
const mainContainer = document.querySelector('main'); // Used to find the main input fields

// --- 🖼️ Image Preview Functionality ---

/**
 * Handles showing a preview of the selected image file.
 */
function previewPetImage() {
    const file = petImageInput.files[0];
    
    // Check if a file was actually selected
    if (file) {
        const reader = new FileReader();
        
        // This function runs once the file is loaded (read)
        reader.onload = function(e) {
            // Set the background of the file input to the new image
            // and adjust styles so the image is fully visible.
            petImageInput.style.backgroundImage = `url('${e.target.result}')`;
            petImageInput.style.backgroundSize = 'cover';
            petImageInput.style.backgroundPosition = 'center';
            petImageInput.style.color = 'transparent'; // Hide the 'No file chosen' text
        };
        
        // Start reading the image file as a data URL
        reader.readAsDataURL(file);
    }
}

// Listen for a change on the file input (when the user selects a file)
petImageInput.addEventListener('change', previewPetImage);


// --- 💾 Add Pet Functionality ---

/**
 * Gathers pet data from the form inputs and attempts to "add" the pet.
 */
function addPetHandler() {
    // 1. Collect all the data from the text/date inputs
    const petName = mainContainer.querySelector('input[placeholder="Pet Name"]').value.trim();
    const petBirthday = mainContainer.querySelector('.birthday').value;
    const petSpecies = mainContainer.querySelector('input[placeholder="Species"]').value.trim();
    const petBreed = mainContainer.querySelector('input[placeholder="Breed"]').value.trim();
    
    // 2. Simple validation: check if the pet name is filled out
    if (!petName) {
        alert("Please enter your pet's name before adding!");
        return; // Stop the function if validation fails
    }

    // 3. Collect the image data (or just the file name/details)
    const petImageFile = petImageInput.files[0];
    const petImage = petImageFile ? {
        name: petImageFile.name,
        size: petImageFile.size,
        type: petImageFile.type
    } : null;

    // 4. Create an object with all the pet's information
    const newPet = {
        name: petName,
        birthday: petBirthday,
        species: petSpecies,
        breed: petBreed,
        id: crypto.randomUUID(), // Add an ID for the pet
        dateAdded: new Date().toISOString()
    };

    // Save image as data URL
    if (petImageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newPet.imageUrl = e.target.result; // Save image as data URL
            savePetToLocalStorage();
        };
        reader.readAsDataURL(petImageFile);
    } else {
        savePetToLocalStorage();
    }

    function savePetToLocalStorage() {
        // Get existing pets or initialize empty array
        let pets = JSON.parse(localStorage.getItem('pawpal_pets') || '[]');
        // Add new pet
        pets.push(newPet);
        // Save back to localStorage
        localStorage.setItem('pawpal_pets', JSON.stringify(pets));
        // Show success message
        alert(`Success! ${petName} has been added to your PawPal!`);
        // Redirect to pet selection page
        window.location.href = '../Pet Selection/pet-selection.html';
    }
}

// Listen for a click on the "Add Pet" button
addPetButton.addEventListener('click', addPetHandler);