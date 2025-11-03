import { auth } from '../firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.querySelector('.create').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    if (!email || !username || !password || !confirm) {
        alert('Please fill out all fields.');
        return;
    }
    if (password !== confirm) {
        alert('Passwords do not match.');
        return;
    }
    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: username });
        window.location.href = "../Pet Selection/pet-selection.html";
    } catch (err) {
        alert(err.message);
    }
});
