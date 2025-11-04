// Get the pet ID from the URL
const params = new URLSearchParams(window.location.search);
const petId = params.get('petId');

// Load the pet's data from localStorage when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set up modal elements
    const taskModal = document.getElementById('taskModal');
    const apptModal = document.getElementById('appointmentModal');
    const addTaskBtn = document.getElementById('addTaskButton');
    const addApptBtn = document.getElementById('addApptBtn');
    const taskInput = document.getElementById('taskInput');
    const apptTitleInput = document.getElementById('apptTitle');
    const apptDateInput = document.getElementById('apptDate');
    const apptTimeInput = document.getElementById('apptTime');

    // Set default date and time for appointment inputs
    const now = new Date();
    apptDateInput.value = now.toISOString().split('T')[0];
    apptTimeInput.value = now.toTimeString().slice(0, 5);

    // Task Modal Event Listeners
    addTaskBtn.addEventListener('click', () => {
        taskModal.style.display = 'block';
        taskInput.focus();
    });

    document.getElementById('cancelTask').addEventListener('click', () => {
        taskModal.style.display = 'none';
        taskInput.value = '';
    });

    document.getElementById('saveTask').addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            addNewTask(taskText);
            taskModal.style.display = 'none';
            taskInput.value = '';
        }
    });

    // Appointment Modal Event Listeners
    addApptBtn.addEventListener('click', () => {
        apptModal.style.display = 'block';
        apptTitleInput.focus();
    });

    document.getElementById('cancelAppt').addEventListener('click', () => {
        apptModal.style.display = 'none';
        clearApptInputs();
    });

    document.getElementById('saveAppt').addEventListener('click', () => {
        const title = apptTitleInput.value.trim();
        const date = apptDateInput.value;
        const time = apptTimeInput.value;
        
        if (title && date && time) {
            addNewAppointment(title, date, time);
            apptModal.style.display = 'none';
            clearApptInputs();
        }
    });

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === taskModal) {
            taskModal.style.display = 'none';
            taskInput.value = '';
        }
        if (event.target === apptModal) {
            apptModal.style.display = 'none';
            clearApptInputs();
        }
    });

    // Handle Enter key in inputs
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const taskText = taskInput.value.trim();
            if (taskText) {
                addNewTask(taskText);
                taskModal.style.display = 'none';
                taskInput.value = '';
            }
        }
    });

    if (!petId) {
        alert('No pet selected! Redirecting to pet selection...');
        window.location.href = '../Pet Selection/pet-selection.html';
        return;
    }

    // Get pets from localStorage
    const pets = JSON.parse(localStorage.getItem('pawpal_pets') || '[]');
    const pet = pets.find(p => p.id === petId);

    if (!pet) {
        alert('Pet not found! Redirecting to pet selection...');
        window.location.href = '../Pet Selection/pet-selection.html';
        return;
    }

    // Update the page with the pet's information
    document.title = `${pet.name}'s Dashboard`;
    document.querySelector('h1').textContent = pet.name;
    
    const petImg = document.querySelector('.petImg');
    if (petImg) {
        petImg.src = pet.imageUrl || '../imgs/default-pet.png';
        petImg.alt = `${pet.name}'s picture`;
    }

    // Load or initialize the pet's tasks
    let tasks = JSON.parse(localStorage.getItem(`tasks_${petId}`) || '[]');
    if (tasks.length === 0) {
        // Initialize default tasks for new pets
        tasks = [
            { id: 'lunch', text: `Give ${pet.name} lunch`, checked: false },
            { id: 'walk', text: `Take ${pet.name} on a walk`, checked: false },
            { id: 'treat', text: `Give ${pet.name} a treat`, checked: false },
            { id: 'bath', text: `Give ${pet.name} a bath`, checked: false },
            { id: 'park', text: `Take ${pet.name} to the park!`, checked: false }
        ];
        localStorage.setItem(`tasks_${petId}`, JSON.stringify(tasks));
    }

    // Filter out already checked tasks for display
    let uncheckedTasks = tasks.filter(task => !task.checked);
    
    // Create the tasks checklist
    const tasksList = document.querySelector('.daily-tasks ul');
    tasksList.innerHTML = ''; // Clear existing tasks
    uncheckedTasks.forEach(task => { // Only loop through unchecked tasks
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" id="${task.id}" name="tasks" value="${task.id}" ${task.checked ? 'checked' : ''}>
            <label for="${task.id}">${task.text}</label>
        `;
        
        // Add change listener to save task state and remove li
        const checkbox = li.querySelector('input');
        checkbox.addEventListener('change', () => {
            // Find the *original* task object to update its checked status
            const originalTask = tasks.find(t => t.id === task.id);
            if (originalTask) {
                originalTask.checked = checkbox.checked;
                localStorage.setItem(`tasks_${petId}`, JSON.stringify(tasks));

                if (checkbox.checked) {
                    updateRecentActivity(pet.name, originalTask.text, true);
                    // === NEW: Remove the list item from the DOM ===
                    li.remove(); 
                }
            }
        });
        
        tasksList.appendChild(li);
    });

    // Load or initialize recent activity
    let recentActivity = JSON.parse(localStorage.getItem(`activity_${petId}`) || '[]');
    updateActivityList(recentActivity);

    // Load appointments
    const appointments = JSON.parse(localStorage.getItem(`appointments_${petId}`) || '[]');
    updateAppointmentsList(appointments);
});

// === UPDATED: Strikethrough instead of "You [did X]" ===
function updateRecentActivity(petName, taskText, completed) {
    if (!completed) return; // Only add when task is completed

    // The petId is a global constant, so it's accessible here
    let recentActivity = JSON.parse(localStorage.getItem(`activity_${petId}`) || '[]');

    // Add new completed task with strikethrough style
    recentActivity.unshift({
        text: taskText,
        date: new Date().toISOString()
    });

    // Keep only the 5 most recent
    recentActivity = recentActivity.slice(0, 5);

    localStorage.setItem(`activity_${petId}`, JSON.stringify(recentActivity));
    updateActivityList(recentActivity);
}

function updateActivityList(activities) {
    const recentList = document.querySelector('.recent ul');
    recentList.innerHTML = '';

    if (activities.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No recent activities';
        recentList.appendChild(li);
        return;
    }

    activities.forEach(activity => {
        const li = document.createElement('li');
        
        // Use <s> tag for strikethrough
        const striked = document.createElement('s');
        striked.textContent = activity.text;
        striked.style.color = '#888'; // Optional: muted color
        striked.style.fontStyle = 'italic';
        
        li.appendChild(striked);
        recentList.appendChild(li);
    });
}

function addNewTask(taskText) {
    // The petId is a global constant, so it's accessible here
    let tasks = JSON.parse(localStorage.getItem(`tasks_${petId}`) || '[]');
    
    const newTask = {
        id: 'task_' + Date.now(),
        text: taskText,
        checked: false
    };
    
    tasks.push(newTask);
    localStorage.setItem(`tasks_${petId}`, JSON.stringify(tasks));
    
    const tasksList = document.querySelector('.daily-tasks ul');
    const li = document.createElement('li');
    li.innerHTML = `
        <input type="checkbox" id="${newTask.id}" name="tasks" value="${newTask.id}">
        <label for="${newTask.id}">${newTask.text}</label>
    `;
    
    const checkbox = li.querySelector('input');
    checkbox.addEventListener('change', () => {
        newTask.checked = checkbox.checked;
        localStorage.setItem(`tasks_${petId}`, JSON.stringify(tasks));

        if (checkbox.checked) {
            // Get the pet's name from the h1 for the activity log
            const petName = document.querySelector('h1').textContent;
            updateRecentActivity(petName, newTask.text, true);
            // === NEW: Remove the list item from the DOM ===
            li.remove();
        }
    });
    
    tasksList.appendChild(li);
}

function addNewAppointment(title, date, time) {
    // The petId is a global constant, so it's accessible here
    let appointments = JSON.parse(localStorage.getItem(`appointments_${petId}`) || '[]');
    
    const newAppt = {
        id: 'appt_' + Date.now(),
        title: title,
        date: date,
        time: time,
        timestamp: new Date(date + 'T' + time).getTime()
    };
    
    appointments.push(newAppt);
    appointments.sort((a, b) => a.timestamp - b.timestamp);
    
    localStorage.setItem(`appointments_${petId}`, JSON.stringify(appointments));
    updateAppointmentsList(appointments);
}

function updateAppointmentsList(appointments) {
    const appointmentsList = document.querySelector('.appointments ul');
    appointmentsList.innerHTML = '';
    
    if (appointments.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No upcoming appointments';
        appointmentsList.appendChild(li);
        return;
    }

    appointments.forEach(appt => {
        const li = document.createElement('li');
        const date = new Date(appt.timestamp);
        li.textContent = `${appt.title} - ${date.toLocaleDateString()} at ${appt.time}`;
        appointmentsList.appendChild(li);
    });
}

function clearApptInputs() {
    document.getElementById('apptTitle').value = '';
    const now = new Date();
    document.getElementById('apptDate').value = now.toISOString().split('T')[0];
    document.getElementById('apptTime').value = now.toTimeString().slice(0, 5);
}