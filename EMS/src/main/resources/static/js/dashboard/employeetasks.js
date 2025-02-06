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

    // Update notifications on page loa
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
// Function to get the authorization token from localStorage
function getAuthToken() {
    return localStorage.getItem("accessToken");
}

// Function to check if the token is expired
function isTokenExpired(token) {
    if (!token) return true; // If no token exists, consider it expired

    // Decode the JWT token
    const decodedToken = decodeJwt(token);

    // Get the current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if the token has expired by comparing the expiration time with the current time
    return decodedToken.exp < currentTime;
}

// Decode the JWT token
function decodeJwt(token) {
    const base64Url = token.split('.')[1]; // Get the payload part of the JWT
    const base64 = base64Url.replace('-', '+').replace('_', '/'); // Fix URL encoding
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Redirect to home.html if the token is expired on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = getAuthToken();

    if (isTokenExpired(token)) {
        console.log('Token expired. Redirecting to home.html...');

        // Show an alert message to the user
        alert('Session expired. Please log in again.');

        // Redirect after a brief moment (you can adjust the delay if needed)
        setTimeout(() => {
            window.location.href = '/'; // Redirect to home.html
        }, 2000); // Delay the redirect by 2 seconds
    } else {
        console.log('Token is valid.');
    }
});
