const API_BASE_URL = "/api"; // Replace with your actual API base URL
const employeeId = localStorage.getItem("employeeId");

// Wait for DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    initializeNotifications();
    loadEmployeeTasks();
    setupTaskModal();
    checkTokenValidity();
    attachLogoutHandler();
});

/* ============================ NOTIFICATIONS ============================ */
let notificationCount = 0;
let notifications = [];

function initializeNotifications() {
    updateNotifications();
    sendLeaveApplicationNotification();
}

// Function to update notifications in the UI
function updateNotifications() {
    const notificationsList = document.getElementById("notificationsList");
    if (!notificationsList) return;

    notificationsList.innerHTML = ""; // Clear old notifications

    notifications.forEach(notification => {
        const li = document.createElement("li");
        li.textContent = notification.message;
        notificationsList.appendChild(li);
    });

    const notificationBell = document.getElementById("notificationBell");
    if (notificationBell) {
        notificationBell.classList.toggle("new-notification", notificationCount > 0);
    }
}

// Simulated function for receiving new notifications
function receiveNewNotification(message) {
    notifications.push({ message });
    notificationCount++;
    updateNotifications();
}

// Simulated function for leave application notification
function sendLeaveApplicationNotification() {
    receiveNewNotification("New leave application submitted.");
}

/* ============================ TASK MODAL HANDLING ============================ */
function setupTaskModal() {
    const taskModal = document.getElementById("taskDetailsModal");
    const closeTaskModal = document.getElementById("closeTaskModal");

    if (!taskModal || !closeTaskModal) return;

    closeTaskModal.addEventListener("click", () => taskModal.style.display = "none");
    window.addEventListener("click", (event) => {
        if (event.target === taskModal) taskModal.style.display = "none";
    });

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("task-title")) {
            event.preventDefault();
            fetchTaskDetails(event.target.dataset.employeeId, event.target.dataset.taskId);
        }
    });
}

// Fetch task details and display in modal
function fetchTaskDetails(employeeId, taskId) {
    fetch(`${API_BASE_URL}/tasks/${employeeId}`, {
        headers: { "Authorization": `Bearer ${getAuthToken()}` }
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch tasks");
            return response.json();
        })
        .then(tasks => {
            const task = tasks.find(t => t.id == taskId);
            if (!task) return alert("Task not found");

            document.getElementById("modalTaskId").textContent = task.id;
            document.getElementById("modalTaskTitle").textContent = task.title;
            document.getElementById("modalTaskDescription").textContent = task.description;
            document.getElementById("modalTaskStatus").textContent = task.status;
            document.getElementById("taskDetailsModal").style.display = "block";
        })
        .catch(error => {
            console.error("Error fetching task details:", error);
            alert("Failed to load task details.");
        });
}
function showTaskDetails(employeeId, taskId) {
    fetch(`${API_BASE_URL}/tasks/${employeeId}`, {
        headers: { "Authorization": `Bearer ${getAuthToken()}` }
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch task details");
            return response.json();
        })
        .then(tasks => {
            console.log("Tasks for Employee:", tasks); // Debugging: Log all tasks

            // Find the specific task by ID
            const task = tasks.find(t => t.id == taskId);
            if (!task) {
                alert("Task not found.");
                return;
            }

            console.log("Selected Task:", task);

            // Ensure employee details are available
            const employeeName = task.employee
                ? `${task.employee.firstName} ${task.employee.surname}`.trim()
                : "N/A";

            // Handle possible null values
            const assignedBy = task.assignedBy || "Not Assigned";
            const description = task.description || "No description provided";
            const dueDate = task.dueDate || "No due date";
            const startDate = task.startDate || "Not Started";
            const status = task.status || "Unknown";
            const assignedDate = task.createdDate ? task.createdDate.substring(0, 10) : "Not Available";
            const extensionReason = task.extensionReason || "No extension requested";
            const extensionApproved = task.extensionApproved ? "Approved" : "Not Approved";

            // Populate the modal with task details
            document.getElementById("popupTaskTitle").textContent = task.title;
            document.getElementById("popupTaskDescription").textContent = description;
            document.getElementById("popupAssignedBy").textContent = assignedBy;
            document.getElementById("popupEmployee").textContent = employeeName;
            document.getElementById("popupStatus").textContent = status;
            document.getElementById("popupDueDate").textContent = dueDate;
            document.getElementById("popupAssignedDate").textContent = assignedDate;
            document.getElementById("popupExtensionReason").textContent = extensionReason;
            document.getElementById("popupExtensionApproval").textContent = extensionApproved;

            // Show the modal
            document.getElementById("taskDetailsPopup").classList.remove("hidden");
        })
        .catch(error => {
            console.error("Error fetching task details:", error);
            alert("Failed to load task details.");
        });
}


/* ============================ TASK MANAGEMENT ============================ */
// Load tasks for the logged-in employee
function loadEmployeeTasks() {
    fetch(`${API_BASE_URL}/tasks/${employeeId}`, {
        headers: { "Authorization": `Bearer ${getAuthToken()}` }
    })
        .then(response => response.json())
        .then(tasks => {
            const taskTableBody = document.querySelector("#taskTable tbody");
            if (!taskTableBody) return;

            taskTableBody.innerHTML = ""; // Clear old tasks
            tasks.forEach(task => {
                const row = document.createElement("tr");
                row.innerHTML = `
                <td>${task.id}</td>
                <td>
                    <a href="#" class="task-title" onclick="showTaskDetails(${task.employee.id}, ${task.id})">
                        ${task.title}
                    </a>
                </td>
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

function closePopup() {
    document.getElementById("taskDetailsPopup").classList.add("hidden");
}

function toggleDropdown(event, dropdownClass) {
    event.preventDefault(); // Prevent page reload

    const dropdown = document.querySelector(`.${dropdownClass} .dropdown-menu`);

    // Close all other dropdowns
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
        if (menu !== dropdown) menu.classList.remove("show");
    });

    // Toggle the selected dropdown
    dropdown.classList.toggle("show");
}


// Mark a task as completed
function markTaskAsCompleted(taskId, buttonElement) {
    fetch(`${API_BASE_URL}/tasks/complete/${taskId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to mark task as completed");
            buttonElement.textContent = "Completed";
            buttonElement.disabled = true;
        })
        .catch(error => {
            console.error("Error marking task as completed:", error);
            alert("Failed to mark the task as completed.");
        });
}

// Show a prompt for requesting a task extension
function showExtensionRequest(taskId) {
    const reason = prompt("Enter the reason for requesting an extension:");
    if (reason) requestTaskExtension(taskId, reason);
}

// Request an extension for a task
function requestTaskExtension(taskId, reason) {
    fetch(`${API_BASE_URL}/tasks/extension-request/${taskId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason }) // Wrapped reason in an object
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to request extension");
            alert("Extension request submitted successfully.");
        })
        .catch(error => {
            console.error("Error requesting task extension:", error);
            alert("Failed to request an extension.");
        });
}

/* ============================ AUTHENTICATION & LOGOUT ============================ */
function getAuthToken() {
    return localStorage.getItem("accessToken");
}

// Check if JWT token is expired
function isTokenExpired(token) {
    if (!token) return true;

    try {
        const decodedToken = decodeJwt(token);
        return decodedToken.exp < Math.floor(Date.now() / 1000);
    } catch (error) {
        console.error("Error decoding token:", error);
        return true;
    }
}

// Decode JWT token
function decodeJwt(token) {
    const base64Url = token.split(".")[1];
    if (!base64Url) throw new Error("Invalid token format");

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(atob(base64).split("").map(c =>
        "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(""));

    return JSON.parse(jsonPayload);
}

// Redirect user to login if token is expired
function checkTokenValidity() {
    if (isTokenExpired(getAuthToken())) {
        alert("Session expired. Please log in again.");
        setTimeout(() => window.location.href = "/", 2000);
    }
}

// Logout functionality
function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("employeeId");
    window.location.href = "/";
}

function attachLogoutHandler() {
    const logoutLink = document.querySelector("a[href='#']");
    if (logoutLink) logoutLink.addEventListener("click", logout);
}
