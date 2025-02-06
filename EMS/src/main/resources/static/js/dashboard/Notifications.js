document.addEventListener("DOMContentLoaded", () => {
    const notificationsContainer = document.querySelector(".notifications-container");

    // Fetch the accessToken and employeeId from localStorage
    const accessToken = localStorage.getItem("accessToken"); // Get the accessToken
    const employeeId = localStorage.getItem("employeeId"); // Get the employeeId

    if (!accessToken || !employeeId) {
        console.error("Access token or employee ID not found in localStorage");
        return;
    }

    // Fetch notifications
    fetch(`/api/notifications/employee/${employeeId}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
        .then(response => response.json())
        .then(notifications => {
            notificationsContainer.innerHTML = "";
            notifications.forEach(notification => {
                const notificationElement = createNotificationElement(notification);
                notificationsContainer.appendChild(notificationElement);
            });
        })
        .catch(error => console.error("Error fetching notifications:", error));
});

// Create notification HTML
function createNotificationElement(notification) {
    const notificationItem = document.createElement("div");
    notificationItem.className = `notification-item ${notification.read ? "read" : "unread"}`;
    notificationItem.innerHTML = `
        <p class="notification-type">${notification.type}</p>
        <p class="notification-message">${notification.message}</p>
        <p class="notification-timestamp">Received on: ${new Date(notification.timestamp).toLocaleString()}</p>
        ${!notification.read ? `<button class="mark-read-btn" data-id="${notification.id}">Mark as Read</button>` : ""}
    `;
    if (!notification.read) {
        notificationItem.querySelector(".mark-read-btn").addEventListener("click", () => markAsRead(notification.id));
    }
    return notificationItem;
}

// Mark a notification as read
function markAsRead(notificationId) {
    const accessToken = localStorage.getItem("accessToken"); // Get the accessToken from localStorage

    if (!accessToken) {
        console.error("Access token not found in localStorage");
        return;
    }

    fetch(`/api/notifications/mark-read/${notificationId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (response.ok) {
                alert("Notification marked as read");
                location.reload(); // Reload to update the UI
            }
        })
        .catch(error => console.error("Error marking notification as read:", error));
}
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
