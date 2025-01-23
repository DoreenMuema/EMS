const API_BASE_URL = "/api"; // Replace with your actual API base URL
const employeeId = localStorage.getItem("employeeId");
document.addEventListener('DOMContentLoaded', () => {
    // Initialize notification variables
    let notificationCount = 0; // Track number of new notifications
    let notifications = []; // List of notifications

    // Function to display notifications in the sidebar
    function updateNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        if (!notificationsList) {
            console.warn('Notifications list element not found!');
            return; // Ensure notificationsList exists
        }
        notificationsList.innerHTML = ''; // Clear current notifications

        // Add each notification to the list
        notifications.forEach(notification => {
            const li = document.createElement('li');
            li.textContent = notification.message;
            notificationsList.appendChild(li);
        });

        // Update notification bell icon if there are new notifications
        const notificationBell = document.getElementById('notificationBell');
        if (notificationBell) {
            if (notificationCount > 0) {
                notificationBell.classList.add('new-notification');
            } else {
                notificationBell.classList.remove('new-notification');
            }
        } else {
            console.warn('Notification bell element not found!');
        }
    }

    // Simulate receiving a new notification
    function receiveNewNotification(message) {
        notifications.push({ message });
        notificationCount++;
        updateNotifications();
    }

    // Simulate calling this function when a new leave application is submitted
    function sendLeaveApplicationNotification() {
        // Simulate sending a notification to admin and employee
        receiveNewNotification('New leave application submitted.');
    }

    // Simulate calling this function to show an example notification
    sendLeaveApplicationNotification();

    // Update notifications on page load
    updateNotifications();
});

function logout() {
    // Clear user data from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("employeeId");

    // Redirect to the home page
    window.location.href = "/";
}

// Attach the logout function to the logout link
document.addEventListener("DOMContentLoaded", () => {
    const logoutLink = document.querySelector("a[href='#']");
    if (logoutLink) {
        logoutLink.addEventListener("click", logout);
    }
});


// Load tasks for the logged-in employee
function loadEmployeeTasks() {
    fetch(`${API_BASE_URL}/tasks/${employeeId}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('accessToken')}`, // Include token if needed
        },
    })
        .then(response => response.json())
        .then(tasks => {
            const taskTableBody = document.querySelector("#taskTable tbody"); // Targeting tbody inside the table
            taskTableBody.innerHTML = ""; // Clear previous rows

            tasks.forEach(task => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${task.id}</td>
                    <td>${task.title}</td>
                    <td>${task.description}</td>
                    <td>${task.status}</td>
                    <td>
                        <button class="action-btn" onclick="markTaskAsCompleted(${task.id}, this)">Mark as Completed</button>
                        <button class="action-btn" onclick="showExtensionRequest(${task.id})">Request Extension</button>
                    </td>
                `;
                taskTableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error loading tasks:", error));
}

// Function to mark a task as completed
function markTaskAsCompleted(taskId, buttonElement) {
    fetch(`${API_BASE_URL}/tasks/complete/${taskId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('accessToken')}`, // Include token if needed
            "Content-Type": "application/json",
        },
    })
        .then(response => {
            if (response.ok) {
                buttonElement.textContent = "Completed";
                buttonElement.disabled = true; // Disable the button to show completion
            } else {
                alert("Failed to mark the task as completed.");
            }
        })
        .catch(error => console.error("Error marking task as completed:", error));
}

// Function to show a dialog for requesting an extension
function showExtensionRequest(taskId) {
    const reason = prompt("Enter the reason for requesting an extension:");
    if (reason) {
        requestTaskExtension(taskId, reason);
    }
}

// Function to request an extension for a task
function requestTaskExtension(taskId, reason) {
    fetch(`${API_BASE_URL}/tasks/extension-request/${taskId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('accessToken')}`, // Include token if needed
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reason),
    })
        .then(response => {
            if (response.ok) {
                alert("Extension request submitted successfully.");
            } else {
                alert("Failed to request an extension.");
            }
        })
        .catch(error => console.error("Error requesting task extension:", error));
}

// Load tasks on page load
window.addEventListener("DOMContentLoaded", loadEmployeeTasks);
