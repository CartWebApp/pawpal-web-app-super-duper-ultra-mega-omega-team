import { auth } from '../firebase-config.js';
import { updateProfile, updateEmail, updatePassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

document.getElementById('save-name').onclick = async () => {
    const name = document.getElementById('profile-name').value.trim();
    if (!name) return alert("Enter a name.");
    try {
        await updateProfile(auth.currentUser, { displayName: name });
        alert("Name updated!");
    } catch (err) { alert(err.message); }
};

document.getElementById('add-image').onclick = () => {
    document.getElementById('profile-image').click();
};

document.getElementById('save-image').onclick = async () => {
    const file = document.getElementById('profile-image').files[0];
    if (!file) return alert("Choose an image.");
    try {
        const storage = getStorage();
        const storageRef = ref(storage, `profile/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await updateProfile(auth.currentUser, { photoURL: url });
        alert("Profile image updated!");
    } catch (err) { alert(err.message); }
};

document.getElementById('save-email').onclick = async () => {
    const email = document.getElementById('profile-email').value.trim();
    if (!email) return alert("Enter an email.");
    try {
        await updateEmail(auth.currentUser, email);
        alert("Email updated!");
    } catch (err) { alert(err.message); }
};

document.getElementById('save-password').onclick = async () => {
    const pw = document.getElementById('profile-password').value;
    if (!pw) return alert("Enter a password.");
    try {
        await updatePassword(auth.currentUser, pw);
        alert("Password updated!");
    } catch (err) { alert(err.message); }
};

// Phone number update is not implemented (requires phone auth setup)
document.getElementById('save-phone').onclick = () => {
    alert("Phone number update not implemented.");
};
