const API_BASE_URL = "/api/admin";

document.addEventListener('DOMContentLoaded', () => {
    // Initialize notification variables
    let notificationCount = 0; // Track number of new notifications
    let notifications = []; // List of notifications

    // Function to update the notification bell icon
    function updateNotificationBell(count) {
        const notificationBell = document.getElementById('notificationBell');
        if (notificationBell) {
            if (count > 0) {
                notificationBell.classList.add('new-notification');
                notificationBell.setAttribute('data-count', count); // Show notification count
            } else {
                notificationBell.classList.remove('new-notification');
                notificationBell.removeAttribute('data-count');
            }
        } else {
            console.warn('Notification bell element not found!');
        }
    }

    // Simulate receiving a new notification
    function receiveNewNotification(message) {
        notifications.push({ message });
        notificationCount++;
        updateNotificationBell(notificationCount);
    }

    // Simulate a new notification
    receiveNewNotification('New leave application submitted.');

    // Modal Show and Hide Logic
    const modal = document.getElementById("assignTaskModal");
    modal.style.display = "none"; // Ensure the modal is hidden initially

    document.getElementById("openModalBtn").addEventListener("click", () => {
        modal.style.display = "block"; // Show the modal
    });

    document.getElementById("closeModalBtn").addEventListener("click", () => {
        modal.style.display = "none"; // Hide the modal
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Submit form for assigning tasks
    document.getElementById("assignTaskForm").addEventListener("submit", (event) => {
        event.preventDefault();

        const employeeEmail = document.getElementById("employeeEmail").value;
        const taskTitle = document.getElementById("taskTitle").value;
        const taskDescription = document.getElementById("taskDescription").value;
        const dueDate = document.getElementById("dueDate").value;

        fetch(`${API_BASE_URL}/assign-task`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({ email: employeeEmail, title: taskTitle, description: taskDescription, dueDate }),
        })
            .then((response) => {
                if (response.ok) {
                    alert("Task assigned successfully!");
                    loadTasks(); // Reload tasks after assignment
                    modal.style.display = "none"; // Close the modal
                } else {
                    alert("Failed to assign the task. Please try again.");
                }
            })
            .catch((error) => console.error("Error assigning task:", error));
    });

    // Function to load tasks and display them in the table
    function loadTasks() {
        fetch(`${API_BASE_URL}/all_tasks`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) throw new Error('Failed to load tasks.');
                return response.json();
            })
            .then((tasks) => {
                const taskTableBody = document.querySelector("#taskTable tbody");
                taskTableBody.innerHTML = ""; // Clear the table body

                tasks.forEach((task) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${task.id}</td>
                        <td><a href="#" onclick="showTaskDetails(${task.id})">${task.title}</a></td>
                        <td>${task.assignedBy || "Admin"}</td>
                        <td>${task.employee ? `${task.employee.firstName} ${task.employee.surname}` : "Unassigned"}</td>
                        <td>${task.status}</td>
                        <td>
                            <button onclick="approveExtension(${task.id}, true)">Approve Extension</button>
                            <button onclick="approveExtension(${task.id}, false)">Reject Extension</button>
                        </td>
                    `;
                    taskTableBody.appendChild(row);
                });
            })
            .catch((error) => console.error("Error loading tasks:", error));
    }

    // Show Task Details in Modal
    window.showTaskDetails = (taskId) => {
        fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch task details.');
                return response.json();
            })
            .then((task) => {
                document.getElementById("popupTaskTitle").textContent = task.title;
                document.getElementById("popupTaskDescription").textContent = task.description;
                document.getElementById("popupAssignedBy").textContent = task.assignedBy || "Admin";
                document.getElementById("popupEmployee").textContent = task.employee
                    ? `${task.employee.firstName} ${task.employee.surname}`
                    : "Unassigned";
                document.getElementById("popupStatus").textContent = task.status;
                document.getElementById("popupDueDate").textContent = task.dueDate || "Not Set";
                document.getElementById("popupAssignedDate").textContent = task.createdDate || "Not Available";

                document.getElementById("taskDetailsPopup").classList.remove("hidden");
            })
            .catch((error) => console.error("Error fetching task details:", error));
    };

    // Close the Task Details Popup
    window.closePopup = () => {
        document.getElementById("taskDetailsPopup").classList.add("hidden");
    };

    // Approve or reject a task extension
    window.approveExtension = (taskId, approve) => {
        fetch(`${API_BASE_URL}/approve-extension/${taskId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({ approve }),
        })
            .then((response) => {
                if (response.ok) {
                    alert(approve ? "Extension approved!" : "Extension rejected!");
                    loadTasks();
                } else {
                    alert("Error processing extension.");
                }
            })
            .catch((error) => console.error("Error processing extension:", error));
    };

    // Load tasks on page load
    loadTasks();
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
