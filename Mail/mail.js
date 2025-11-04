// --- Firebase Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, query, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Global Variables (Provided by Canvas) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let db;
let auth;
let userId = null;
let allMessages = []; // Cache all messages for filtering

const messagesContainer = document.getElementById('messages-container');
const filterButtons = document.querySelectorAll('.filter-button');
const COLLECTION_PATH = `artifacts/${appId}/users`;

// --- Utility Functions ---

/**
 * Formats an ISO date string into a readable date and time string.
 * @param {string} isoString 
 * @returns {{datePart: string, timePart: string}}
 */
function formatDateTime(isoString) {
    const date = new Date(isoString);
    const datePart = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { datePart, timePart };
}

// --- Message Rendering ---

function renderMessages(messages) {
    messagesContainer.innerHTML = '';
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<p class="message-empty">Inbox is empty. Time for a treat!</p>';
        return;
    }

    // Sort by timestamp descending (most recent first)
    messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    messages.forEach(message => {
        const { datePart, timePart } = formatDateTime(message.timestamp);
        
        const card = document.createElement('div');
        card.className = 'mail-card';
        card.setAttribute('data-is-important', message.isImportant || 'false');
        
        card.innerHTML = `
            <div class="mail-header">
                <h3 class="mail-subject">${message.subject || 'No Subject'}</h3>
                <span class="mail-datetime">${datePart} at ${timePart}</span>
            </div>
            <p class="mail-content">${message.content || 'No content.'}</p>
        `;

        messagesContainer.appendChild(card);
    });
}

// --- Filtering Logic ---

function filterMessages(filterType) {
    // Remove active class from all buttons
    filterButtons.forEach(btn => btn.classList.remove('active'));
    // Add active class to the clicked button
    document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');

    let filteredList = [...allMessages]; // Start with a copy of all messages

    const today = new Date();

    switch (filterType) {
        case 'recent':
            // Already sorted by timestamp in renderMessages, so no action needed here.
            break;
        case 'last-week':
            const sevenDaysAgo = today.getTime() - (7 * 24 * 60 * 60 * 1000);
            filteredList = filteredList.filter(msg => new Date(msg.timestamp).getTime() > sevenDaysAgo);
            break;
        case 'important':
            filteredList = filteredList.filter(msg => msg.isImportant === true);
            break;
    }

    renderMessages(filteredList);
}

// --- Firebase Initialization and Auth ---

async function initFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }

        userId = auth.currentUser.uid;
        
        // Start listening for mail messages
        listenForMessages();
        
        // Add initial mock messages if none exist
        addInitialMessagesIfEmpty();

    } catch (error) {
        console.error("Firebase initialization failed:", error);
        messagesContainer.innerHTML = '<p class="message-empty" style="color: red;">Error loading mail: Could not connect to the database.</p>';
    }
}

// --- Firestore Listener ---

function listenForMessages() {
    const messagesRef = collection(db, `${COLLECTION_PATH}/${userId}/mail_messages`);
    const q = query(messagesRef);

    onSnapshot(q, (snapshot) => {
        const fetchedMessages = [];
        snapshot.forEach((doc) => {
            // Include the Firestore document ID in the data object
            fetchedMessages.push({ id: doc.id, ...doc.data() });
        });
        
        allMessages = fetchedMessages; // Update the cache
        // Re-render the messages with the current filter applied
        const currentFilter = document.querySelector('.filter-button.active').getAttribute('data-filter');
        filterMessages(currentFilter);

    }, (error) => {
        console.error("Error listening to mail messages:", error);
        messagesContainer.innerHTML = '<p class="message-empty" style="color: red;">Error listening for updates.</p>';
    });
}

// --- Mock Data Insertion ---

async function addInitialMessagesIfEmpty() {
     const messagesRef = collection(db, `${COLLECTION_PATH}/${userId}/mail_messages`);
     
     // Simple check to see if we need to add mock data (onSnapshot will load the real data)
     if (allMessages.length === 0) {
         const now = new Date();
         const mockMessages = [
             {
                 sender: 'System', subject: 'Welcome to PawPal!', isImportant: true, isRead: false,
                 content: 'We are so excited to have you and your companion! Check out the dashboard to manage their daily tasks and appointments.',
                 timestamp: now.toISOString()
             },
             {
                 sender: 'PawPal', subject: 'New Feature Alert: Dashboard Widgets!', isImportant: false, isRead: false,
                 content: 'You can now customize your pet\'s dashboard with new widgets, including a daily steps tracker and a mood log. Give it a try!',
                 timestamp: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString() // 3 days ago
             },
             {
                 sender: 'System', subject: 'Account Verified Successfully', isImportant: false, isRead: true,
                 content: 'Your PawPal account and profile settings have been successfully verified. You are ready to go!',
                 timestamp: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString() // 10 days ago
             },
             {
                 sender: 'Support', subject: 'Urgent: Appointment Reminder', isImportant: true, isRead: false,
                 content: 'Remember your upcoming vet appointment for Rex on Friday at 2:00 PM. Please ensure all vaccinations are up to date!',
                 timestamp: new Date(now.getTime() - (1 * 60 * 60 * 1000)).toISOString() // 1 hour ago
             },
         ];

         for (const msg of mockMessages) {
             await addDoc(messagesRef, msg).catch(e => console.error("Error adding mock data:", e));
         }
         console.log("Mock data added to Firestore.");
     }
 }


// --- Event Listeners ---

function setupListeners() {
    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const filterType = event.target.getAttribute('data-filter');
            filterMessages(filterType);
        });
    });
}


// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    setupListeners();
    initFirebase();
});