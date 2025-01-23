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
