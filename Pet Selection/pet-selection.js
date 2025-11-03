import { db, getPetsCollectionPath, getCurrentUserId } from '../firebase-config.js';
import { collection, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

const petContainer = document.getElementById('pet-list-container');
const placeholderPetImage = "https://placehold.co/150x150/7378D3/ffffff?text=Pet";

function createPetCard(pet) {
    const card = document.createElement('div');
    card.className = 'pet-card';
    card.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        margin: 10px;
        background-color: #CFD9FF;
        border: 2px solid #7378D3;
        border-radius: 10px;
        cursor: pointer;
        width: 200px;
    `;

    const img = document.createElement('img');
    img.src = pet.imageUrl || placeholderPetImage;
    img.alt = `${pet.name}'s profile picture`;
    img.style.cssText = `
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 10px;
    `;
    img.onerror = () => img.src = placeholderPetImage;

    const name = document.createElement('h3');
    name.textContent = pet.name;
    name.style.margin = '0';

    card.appendChild(img);
    card.appendChild(name);

    card.addEventListener('click', () => {
        localStorage.setItem('activePetId', pet.id);
        window.location.href = `../Dashboard/dash.html?petId=${pet.id}`;
    });

    return card;
}

async function initializePetSelection() {
    try {
        await getCurrentUserId(); // Wait for auth
        const petsPath = getPetsCollectionPath();
        if (!petsPath) {
            alert("Could not get pets collection path. Are you signed in?");
            console.error("No petsPath", { petsPath });
            return;
        }

        const petsQuery = collection(db, petsPath);

        // Set up real-time listener
        onSnapshot(petsQuery, (snapshot) => {
            // Clear existing pet cards but keep the add-pet button
            const existingCards = document.querySelectorAll('.pet-card');
            existingCards.forEach(card => card.remove());

            let found = false;
            snapshot.forEach((doc) => {
                found = true;
                const pet = { id: doc.id, ...doc.data() };
                const card = createPetCard(pet);
                // Insert before the add-pet button
                petContainer.insertBefore(card, document.querySelector('.add-pet'));
            });
            if (!found) {
                const msg = document.createElement('p');
                msg.textContent = "No pets found. Add one!";
                msg.style.color = '#2E4088';
                petContainer.insertBefore(msg, document.querySelector('.add-pet'));
            }
        }, (err) => {
            alert("Error loading pets: " + err.message);
            console.error("onSnapshot error:", err);
        });

    } catch (error) {
        alert("Error loading pets: " + error.message);
        console.error("Error loading pets:", error);
        const errorMsg = document.createElement('p');
        errorMsg.textContent = "Sorry, we couldn't load your pets. Please try refreshing the page.";
        errorMsg.style.color = 'red';
        petContainer.insertBefore(errorMsg, document.querySelector('.add-pet'));
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializePetSelection);