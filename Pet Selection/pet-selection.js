// Only use localStorage for pet display
const petContainer = document.getElementById('pet-list-container');
const placeholderPetImage = "https://placehold.co/150x150/7378D3/ffffff?text=Pet";

/**
 * Calculates the pet's current age in years and months from their birthday.
 * @param {string} birthdayString - The pet's birthday in 'YYYY-MM-DD' format.
 * @returns {string} The calculated age (e.g., '1 year, 3 months' or '5 years').
 */
function calculateAge(birthdayString) {
    if (!birthdayString) {
        return 'Age Unknown';
    }
    const today = new Date();
    const birthDate = new Date(birthdayString);
    
    // Check if the date is valid
    if (isNaN(birthDate.getTime())) {
        return 'Age Unknown';
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust months and years if necessary
    if (days < 0) {
        months--;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    // Rule: Show months for pets under 2 years old
    if (years < 2) {
        if (years === 1) {
            // e.g., "1 year, 5 months"
            const yearText = years === 1 ? '1 year' : `${years} years`;
            const monthText = months === 1 ? '1 month' : `${months} months`;
            
            if (months === 0) {
                 return yearText; // Exactly 1 year
            }
            return `${yearText}, ${monthText}`;
        } else if (years === 0) {
            // e.g., "7 months"
            if (months === 0) {
                 return 'Newborn'; // Less than 1 month
            }
            const monthText = months === 1 ? '1 month' : `${months} months`;
            return monthText;
        }
    }

    // Default: Show years for pets 2 years and older
    const yearText = years === 1 ? '1 year' : `${years} years`;
    return yearText;
}


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
        transition: all 0.3s ease;
        transform-origin: center;
    `;
    
    // Add hover effects
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.05)';
        card.style.boxShadow = '0 4px 8px rgba(115, 120, 211, 0.2)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1)';
        card.style.boxShadow = 'none';
    });

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
    name.style.margin = '0 0 5px 0'; // Added bottom margin

    // --- Display Breed ---
    const breed = document.createElement('p');
    // Use the stored breed, defaulting to Species if breed is missing, or 'Unknown Breed'
    const breedText = pet.breed && pet.breed.trim() !== '' ? pet.breed : (pet.species || 'Unknown Breed');
    breed.textContent = breedText;
    breed.style.cssText = `
        font-size: 0.9em;
        color: #2E4088;
        margin: 0 0 3px 0;
        font-weight: bold;
    `;
    
    // --- Display Age (Now with Months) ---
    const age = document.createElement('p');
    age.textContent = calculateAge(pet.birthday);
    age.style.cssText = `
        font-size: 0.9em;
        color: #555;
        margin: 0;
    `;
    
    // Append new elements to the card
    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(breed);
    card.appendChild(age);

    card.addEventListener('click', () => {
        localStorage.setItem('activePetId', pet.id);
        window.location.href = `../Dashboard/dash.html?petId=${pet.id}`;
    });

    return card;
}

function initializePetSelection() {
    // Remove existing pet cards (but keep the add-pet button)
    const existingCards = document.querySelectorAll('.pet-card');
    existingCards.forEach(card => card.remove());
    const oldMsgs = document.querySelectorAll('.pet-list-msg');
    oldMsgs.forEach(msg => msg.remove());

    let pets = [];
    try {
        pets = JSON.parse(localStorage.getItem('pawpal_pets') || '[]');
    } catch (e) {
        pets = [];
    }

    if (pets.length === 0) {
        const msg = document.createElement('p');
        msg.textContent = "No pets found. Add one!";
        msg.className = 'pet-list-msg';
        msg.style.color = '#2E4088';
        petContainer.insertBefore(msg, document.querySelector('.add-pet'));
        return;
    }

    pets.forEach(pet => {
        const card = createPetCard(pet);
        petContainer.insertBefore(card, document.querySelector('.add-pet'));
    });
}

document.addEventListener('DOMContentLoaded', initializePetSelection);