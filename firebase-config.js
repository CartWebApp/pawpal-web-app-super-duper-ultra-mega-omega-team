import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, onSnapshot, query, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global variables provided by the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserId = null;
let isAuthReady = false;

/**
 * Initializes authentication and sets up the user state.
 */
async function initializeAuth() {
    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            // Fallback to anonymous sign-in if token is missing
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Error during initial sign-in:", error);
        // If sign-in fails, we fall back to a random ID for unauthenticated use
        currentUserId = crypto.randomUUID();
        isAuthReady = true;
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserId = user.uid;
        } else if (!currentUserId) {
            // Fallback for an explicitly signed-out state or initial failure
            currentUserId = crypto.randomUUID();
        }
        isAuthReady = true;
        console.log("Firebase Auth Ready. User ID:", currentUserId);
    });
}

// Start the auth process immediately
initializeAuth();


/**
 * Gets the path to the user's private pets collection in Firestore.
 * @returns {string} The Firestore collection path.
 */
export function getPetsCollectionPath() {
    if (!currentUserId) {
        console.error("User ID not yet available.");
        return null;
    }
    // Storage path: /artifacts/{appId}/users/{userId}/pets
    return `artifacts/${appId}/users/${currentUserId}/pets`;
}

/**
 * Utility to wait until the currentUserId is determined.
 * @returns {Promise<string>} The current user ID.
 */
export function getCurrentUserId() {
    return new Promise(resolve => {
        const check = () => {
            if (isAuthReady) {
                resolve(currentUserId);
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

// Export the necessary Firebase instances
export { db, auth, getPetsCollectionPath, app };