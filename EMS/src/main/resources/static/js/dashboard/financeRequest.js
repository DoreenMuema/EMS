const API_BASE_URL = "/api/admin"; // Replace with your actual API base URL

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

// Function to get the authentication token
function getAuthToken() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        alert("Unauthorized access. Please log in again.");
        window.location.href = "/login"; // Redirect to login if no token
    }
    return token;
}

// Function to get the employee ID
function getEmployeeId() {
    const employeeId = localStorage.getItem("employeeId");
    if (!employeeId) {
        alert("Missing employee ID. Please log in again.");
        window.location.href = "/login"; // Redirect to login if no employee ID
    }
    return employeeId;
}

// Function to load financial requests
function loadFinanceRequests(filter = {}) {
    const { status, type } = filter;
    const employeeId = getEmployeeId(); // Ensure the employee ID is included in the request

    // Construct the API URL dynamically based on the filters
    let url = `${API_BASE_URL}/all-financeRequests`;

    if (status) {
        url = `${API_BASE_URL}/finance-requests/status/${status}`;
    } else if (type) {
        url = `${API_BASE_URL}/requests/type/${type}`;
    }

    fetch(url, {
        headers: {
            "Authorization": `Bearer ${getAuthToken()}`,
            "X-Employee-ID": employeeId, // Include employee ID in every request
        },
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    alert("Session expired. Please log in again.");
                    window.location.href = "/home";
                }
                throw new Error(`Failed to load finance requests: ${response.statusText}`);
            }
            return response.json();
        })
        .then(requests => {
            console.log("Fetched finance requests:", requests);
            const tableBody = document.querySelector("#requestsTable tbody");
            tableBody.innerHTML = ""; // Clear previous rows

            if (requests.length === 0) {
                // Display a message if no requests are found
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center;">No requests found</td>
                    </tr>
                `;
                return;
            }

            // Populate the table with the fetched requests
            requests.forEach(request => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${request.id}</td>
                    <td>${request.employee.firstName} ${request.employee.surname}</td>
                    <td>${request.itemDescription}</td>
                    <td>${request.type || "N/A"}</td>
                    <td>${request.status}</td>
                     <td>
                    ${request.proofFileUrl ?
                    `<a href="${request.proofFileUrl}" target="_blank">Download Proof</a>` :
                    'No proof file'}
                </td>
                    <td>
                        <button class="approve-btn" onclick="approveRequest(${request.id})">Approve</button>
                        <button class="reject-btn" onclick="rejectRequest(${request.id})">Reject</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error loading finance requests:", error));
}

// Function to approve a financial request
function approveRequest(requestId) {
    const employeeId = getEmployeeId(); // Include employee ID

    fetch(`${API_BASE_URL}/requests/${requestId}/approve`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${getAuthToken()}`,
            "X-Employee-ID": employeeId,
            "Content-Type": "application/json",
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to approve request");
            }
            return response.json();
        })
        .then(data => {
            alert(data.message || "Request approved successfully.");
            loadFinanceRequests(); // Reload the table
        })
        .catch(error => console.error("Error approving request:", error));
}

// Function to reject a financial request
function rejectRequest(requestId) {
    const employeeId = getEmployeeId(); // Include employee ID

    fetch(`${API_BASE_URL}/requests/${requestId}/reject`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${getAuthToken()}`,
            "X-Employee-ID": employeeId,
            "Content-Type": "application/json",
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to reject request");
            }
            return response.json();
        })
        .then(data => {
            alert(data.message || "Request rejected successfully.");
            loadFinanceRequests(); // Reload the table
        })
        .catch(error => console.error("Error rejecting request:", error));
}

// Apply filters to fetch filtered requests
function applyFilters() {
    const status = document.getElementById("requestStatus").value;
    const type = document.getElementById("requestType").value;

    loadFinanceRequests({ status, type });
}

// Load requests on page load
window.addEventListener("DOMContentLoaded", () => {
    loadFinanceRequests(); // Load all requests initially

    // Attach event listener to the filter button
    document.querySelector("button").addEventListener("click", applyFilters);
});

// Logout function
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
