function getAuthToken() {
    return localStorage.getItem('accessToken');
}

// Function to get the employee ID from local storage
function getEmployeeId() {
    return localStorage.getItem('employeeId');
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded event fired!');

    // Get elements
    const modal = document.getElementById("leaveModal");
    const form = document.getElementById("leaveForm");
    const newRequestBtn = document.getElementById("newRequestBtn");
    const applyLeaveLink = document.querySelector('a[href="/employeeLeaveApplication?section=applyleave"]');
    const closeButton = document.getElementById("closeModalBtn");
    const cancelLeaveBtn = document.getElementById("cancelLeaveBtn");
    const leaveHistoryLink = document.querySelector('a[href="/employeeLeaveApplication?section=leaveHistory"]');
    const leaveCard = document.querySelector(".card");
    const tableBody = document.querySelector(".card tbody");
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");

    if (!modal) {
        console.error("Modal element not found!");
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    if (startDate && endDate) {
        startDate.setAttribute('min', today);
        endDate.setAttribute('min', today);
    }

    // Function to open modal
    function openModal() {
        console.log("Opening leave modal...");
        modal.style.display = "block";
        modal.classList.add("show");
    }

    // Function to close modal
    function closeModal() {
        console.log("Closing leave modal...");
        modal.style.display = "none";
        modal.classList.remove("show");
    }

    // Add event listeners
    if (newRequestBtn) newRequestBtn.addEventListener("click", openModal);
    if (applyLeaveLink) applyLeaveLink.addEventListener("click", function (event) {
        event.preventDefault();
        console.log("Apply for Leave link clicked!");
        openModal();
    });

    if (closeButton) closeButton.addEventListener("click", closeModal);
    if (cancelLeaveBtn) cancelLeaveBtn.addEventListener("click", closeModal);

    // Close modal when clicking outside it
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Fetch and display leave requests
    const employeeId = getEmployeeId();
    const accessToken = getAuthToken();

    if (employeeId && accessToken) {
        fetch(`/api/employee/leaves/${employeeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (!tableBody) {
                    console.error('Table body (tbody) element not found!');
                    return;
                }

                tableBody.innerHTML = ""; // Clear previous data
                if (Array.isArray(data) && data.length > 0) {
                    data.forEach((leave) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${leave.leaveType}</td>
                            <td>${leave.days}</td>
                            <td>${leave.startDate}</td>
                            <td>${leave.endDate}</td>
                            <td>${leave.status}</td>
                            <td>${leave.dateRequested}</td>
                        `;
                        tableBody.appendChild(row);
                    });
                } else {
                    tableBody.innerHTML = '<tr><td colspan="6">No leave applications found.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error fetching leave data:', error);
            });
    } else {
        console.error("Employee ID or access token missing!");
    }

    // Fetch leave history when clicking Leave History link
    if (leaveHistoryLink) {
        leaveHistoryLink.addEventListener("click", function (event) {
            event.preventDefault();
            console.log("Fetching leave history...");
            fetchLeaveHistory(["APPROVED", "RECALLED", "REJECTED"]);
            if (leaveCard) leaveCard.style.display = "block";
        });
    }
});

// Function to fetch leave history based on statuses
async function fetchLeaveHistory(statuses) {
    const tableBody = document.querySelector(".card tbody");
    const card = document.querySelector(".card");

    if (!tableBody || !card) {
        console.error("Required DOM elements not found!");
        return;
    }

    tableBody.innerHTML = ""; // Clear previous data
    const accessToken = getAuthToken();

    if (!accessToken) {
        console.error("No access token found. User might not be authenticated.");
        alert("Authentication error. Please log in again.");
        return;
    }

    console.log("Using access token:", accessToken);

    try {
        const fetchPromises = statuses.map(async (status) => {
            try {
                const response = await fetch(`/api/employee/leaves/status/${status}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Error fetching ${status}:`, errorText);
                    throw new Error(`Failed to fetch ${status}: ${response.status} - ${errorText}`);
                }

                return await response.json();
            } catch (error) {
                console.error(`Error fetching leave history for ${status}:`, error);
                return []; // Return empty array on failure
            }
        });

        const results = await Promise.all(fetchPromises);
        const allLeaves = results.flat(); // Merge all leave arrays

        console.log("Fetched leave data:", allLeaves);

        if (allLeaves.length === 0) {
            card.style.display = "none"; // Hide card if no data
            return;
        }

        allLeaves.forEach(leave => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${leave.leaveType || "N/A"}</td>
                <td>${leave.days || "N/A"}</td>
                <td>${formatDate(leave.startDate)}</td>
                <td>${formatDate(leave.endDate)}</td>
                <td>${leave.status || "N/A"}</td>
                <td>${formatDateTime(leave.dateRequested)}</td>
            `;
            tableBody.appendChild(row);
        });

        card.style.display = "block"; // Show card if data exists
    } catch (error) {
        console.error("Unexpected error fetching leave history:", error);
        alert("An unexpected error occurred while fetching leave history.");
    }
}

// Function to format date (YYYY-MM-DD -> DD/MM/YYYY)
function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB"); // UK format: DD/MM/YYYY
}

// Function to format datetime
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return "N/A";
    return new Date(dateTimeStr).toLocaleString("en-GB"); // Includes time
}

// Call function with required statuses
fetchLeaveHistory(["REJECTED", "APPROVED", "RECALLED"]);

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

