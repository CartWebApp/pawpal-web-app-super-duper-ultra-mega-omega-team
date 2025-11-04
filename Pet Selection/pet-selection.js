// Only use localStorage for pet display
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
    name.style.margin = '0';

    card.appendChild(img);
    card.appendChild(name);

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