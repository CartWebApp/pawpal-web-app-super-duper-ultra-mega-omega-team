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
        image: petImage,
        dateAdded: new Date().toISOString()
    };

    // 5. This is where you would typically save the data
    //    For now, we'll just show it in the browser's console!
    console.log("🥳 New Pet Added (Data):", newPet);
    
    // You could also add a success message to the user here!
    alert(`Success! ${petName} has been added to your PawPal!`);
    
    // 6. Optional: Clear the form after submission
    // window.location.reload(); // A simple way to reset the whole page
}

// Listen for a click on the "Add Pet" button
addPetButton.addEventListener('click', addPetHandler);