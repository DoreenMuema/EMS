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
function toggleDropdown(event) {
    event.preventDefault(); // Prevent navigation
    const dropdown = event.target.closest(".finance-dropdown").querySelector(".dropdown-menu");
    dropdown.classList.toggle("show"); // Toggle dropdown visibility
}


// Fetch and populate financial requests (claims or requisitions)
function loadFinanceRequests(type) {
    fetch(`${API_BASE_URL}/${type}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAuthToken()}`
        }
    })
        .then(response => response.json())
        .then(data => {
            if (type === "CLAIM") {
                populateClaimsTable(data);
            } else if (type === "REQUISITION") {
                populateRequisitionsTable(data);
            }
        })
        .catch(error => console.error(`Error fetching ${type}:`, error));
}

// Function to populate Claims table
function populateClaimsTable(claims) {
    const tableBody = document.querySelector("#claimsTable tbody");
    if (!tableBody) {
        console.error("Claims table not found.");
        return;
    }
    tableBody.innerHTML = ""; // Clear old data

    claims.forEach(claim => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${claim.id}</td>
            <td>${claim.employeeName}</td>
            <td>${claim.itemDescription}</td>
            <td>${claim.amount}</td>
            <td>${claim.status}</td>
            <td><button onclick="downloadProof(${claim.id})">Download</button></td>
            <td>
                <button onclick="approveClaim(${claim.id})" class="approve-btn">Approve</button>
                <button onclick="rejectClaim(${claim.id})" class="reject-btn">Reject</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to populate Requisitions table
function populateRequisitionsTable(requisitions) {
    const tableBody = document.querySelector("#requisitionsTable tbody");
    if (!tableBody) {
        console.error("Requisitions table not found.");
        return;
    }
    tableBody.innerHTML = ""; // Clear old data

    requisitions.forEach(requisition => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${requisition.id}</td>
            <td>${requisition.employeeName}</td>
            <td>${requisition.itemDescription}</td>
            <td>${requisition.amount}</td>
            <td>${requisition.status}</td>
            <td><button onclick="downloadProof(${requisition.id})">Download</button></td>
            <td>
                <button onclick="approveRequisition(${requisition.id})" class="approve-btn">Approve</button>
                <button onclick="rejectRequisition(${requisition.id})" class="reject-btn">Reject</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// Populate table with data
function populateTable(type, requests) {
    const tableBody = document.querySelector(`#${type}Table tbody`);
    tableBody.innerHTML = ""; // Clear previous data

    requests.forEach(request => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${request.id}</td>
            <td>${request.employeeName}</td>
            <td>${request.itemDescription}</td>
            <td>${request.amount}</td>
            <td>${request.status}</td>
            <td><button onclick="downloadProof(${request.id})">Download</button></td>
            <td>
                <button onclick="approveRequest(${request.id})" class="approve-btn">Approve</button>
                <button onclick="rejectRequest(${request.id})" class="reject-btn">Reject</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to download proof with token
function downloadProof(requestId) {
    const token = getAuthToken(); // Retrieve token from localStorage
    if (!token) {
        alert("You are not authenticated. Please log in again.");
        return;
    }

    const url = `${API_BASE_URL}/download-proof/${requestId}`;

    fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.statusText}`);
            }
            return response.blob(); // Convert response to Blob
        })
        .then(blob => {
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `proof_${requestId}.pdf`; // Customize filename
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl); // Clean up
        })
        .catch(error => {
            console.error("Error downloading proof file:", error);
            alert("Failed to download proof file.");
        });
}


// Function to approve a financial request
function approveRequest(requestId, employeeId) {
    fetch(`${API_BASE_URL}/requests/${requestId}/approve`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${getAuthToken()}`,
            "X-Employee-ID": employeeId, // Use the employeeId from the request data
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
function rejectRequest(requestId, employeeId) {
    fetch(`${API_BASE_URL}/requests/${requestId}/reject`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${getAuthToken()}`,
            "X-Employee-ID": employeeId, // Use the employeeId from the request data
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
