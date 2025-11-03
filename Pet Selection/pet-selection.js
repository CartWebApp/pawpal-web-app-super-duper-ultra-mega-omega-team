import { db, getPetsCollectionPath, getCurrentUserId } from './firebase-config.js';
import { collection, query, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// Reference to the container where pet cards will be added
const petContainer = document.querySelector('.add-pet').parentNode; 
const addPetBox = document.querySelector('.add-pet');
const placeholderPetImage = "https://placehold.co/150x150/7378D3/ffffff?text=Pet"; // A nice placeholder

// Wait for authentication before trying to load data
getCurrentUserId().then(userId => {
    loadPets(userId);
});

/**
 * Creates an HTML element for a single pet card.
 * @param {Object} pet - The pet data object.
 * @returns {HTMLElement} The created pet card element.
 */
function createPetCard(pet) {
    const card = document.createElement('div');
    card.className = 'pet-card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.gap = '10px';
    card.style.padding = '20px';
    card.style.backgroundColor = '#CFD9FF';
    card.style.border = '2px solid #7378D3';
    card.style.borderRadius = '10px';
    card.style.cursor = 'pointer';
    card.style.width = '200px';

    const petImage = document.createElement('img');
    petImage.src = pet.imageUrl || placeholderPetImage;
    petImage.alt = `${pet.name} profile picture`;
    petImage.width = 150;
    petImage.height = 150;
    petImage.style.borderRadius = '50%';
    petImage.style.objectFit = 'cover';
    petImage.onerror = function() {
        this.src = placeholderPetImage;
    };


    const petName = document.createElement('h3');
    petName.textContent = pet.name;
    petName.style.margin = '0';

    // Set up the click handler to navigate to the dashboard with the pet's ID
    card.addEventListener('click', () => {
        // We use localStorage to save the active pet ID temporarily for the dashboard
        localStorage.setItem('activePetId', pet.id);
        window.location.href = `../Dash/dash.html?petId=${pet.id}`;
    });

    card.appendChild(petImage);
    card.appendChild(petName);

    return card;
}


/**
 * Sets up a real-time listener to load and display pets from Firestore.
 */
function loadPets() {
    const petsCollectionPath = getPetsCollectionPath();
    if (!petsCollectionPath) return;

    const petsQuery = query(collection(db, petsCollectionPath));

    // onSnapshot listens for real-time changes
    onSnapshot(petsQuery, (querySnapshot) => {
        console.log("Real-time pet data update received.");
        // Clear all existing pet cards before rendering the new list, 
        // but keep the 'Add a Pet' box.
        
        // Find all elements that are NOT the addPetBox or the initial header/nav
        const existingCards = petContainer.querySelectorAll('.pet-card');
        existingCards.forEach(card => card.remove());

        querySnapshot.forEach((doc) => {
            const pet = doc.data();
            const petCard = createPetCard(pet);
            
            // Insert the new pet card *before* the 'Add a Pet' box
            petContainer.insertBefore(petCard, addPetBox);
        });

        if (querySnapshot.empty) {
            console.log("No pets found. Time to add one!");
        }
    }, (error) => {
        console.error("Error listening to pets collection:", error);
    });
}