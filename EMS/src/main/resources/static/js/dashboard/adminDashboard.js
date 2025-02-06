// Manage employees action
const viewEmployeeBtn = document.getElementById("viewEmployeeBtn");
if (viewEmployeeBtn) {
    console.log("Manage employee button found");
    viewEmployeeBtn.addEventListener("click", () => {
        console.log("Button clicked");
        window.location.href = "/manageEmployees";
    });
} else {
    console.error("Manage button not found.");
}

// leaves button action
const viewLeaveBtn = document.getElementById("viewLeaveBtn");
if (viewLeaveBtn) {
    console.log("leaves button found");
    viewLeaveBtn.addEventListener("click", () => {
        console.log("Button clicked");
        window.location.href = "/manageleaves";
    });
} else {
    console.error("Request Leave button not found.");
}
// Tasks button action
const tasksBtn = document.getElementById("tasksBtn");
if (tasksBtn) {
    console.log("Tasks button found");
    tasksBtn.addEventListener("click", () => {
        console.log("Tasks button clicked");
        window.location.href = "/manageTasks";
    });
} else {
    console.error("Tasks button not found.");
}

// Finance button action
const adminFinanceBtn = document.getElementById("adminFinanceBtn");
if (adminFinanceBtn) {
    console.log("Finance button found");
    adminFinanceBtn.addEventListener("click", () => {  // Corrected this line
        console.log("Finance button clicked");
        window.location.href = "/financeRequest";
    });
} else {
    console.error("Finance button not found.");
}

// Establish the WebSocket connection for the admin
const adminSocket = new WebSocket('ws://localhost:8080/ws/admin');

// Handle incoming WebSocket messages
adminSocket.onmessage = function(event) {
    const message = event.data;
    alert('Admin Notification: ' + message); // Display the notification
};

// Handle WebSocket connection errors
adminSocket.onerror = function(error) {
    console.error('WebSocket Error:', error);
};

// Handle WebSocket connection closure
adminSocket.onclose = function() {
    console.log('WebSocket connection closed.');
};

// Function to get the auth token

function getAuthToken() {
    return localStorage.getItem('accessToken');
}
// Function to get the employee ID
function getEmployeeId() {
    return localStorage.getItem('employeeId'); // Assuming 'employeeId' is stored in local storage
}

// Fetch Admin Dashboard Data
async function fetchAdminDashboardData() {
    try {
        const token = getAuthToken();
        const response = await fetch('/api/admin/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data); // Debug log the fetched data

        if (data) {
            updateLeaveRequests(data.leaveRequests || []);  // Corrected variable
            updateEmployeeCount(data.employees?.length || 0);
            updateTaskCount(data.tasks?.length || 0);
            updateDashboard(data); // Ensure this function is called to update the dashboard
        } else {
            console.error('Invalid or missing data:', data);
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

// Update the Leave Requests Section
function updateLeaveRequests(leaveRequests) {
    const leaveRequestsCount = document.getElementById('leaveRequestsCount');
    if (leaveRequestsCount) {
        leaveRequestsCount.textContent = `You have ${leaveRequests.length} leave requests`; // Example text content
    } else {
        console.warn('Element not found!');
    }

    // Update the list of leave requests
    const leaveRequestsList = document.getElementById('leave-table-body');
    if (leaveRequestsList) {
        if (leaveRequests.length > 0) {
            leaveRequestsList.innerHTML = leaveRequests.map(request => `
                <div class="request-card">
                    <p><strong>Employee:</strong> ${request.employee}</p>
                    <p><strong>Leave Dates:</strong> ${request.startDate} to ${request.endDate}</p>
                    <p><strong>Status:</strong> ${request.status}</p>
                </div>`).join('');
        } else {
            leaveRequestsList.innerHTML = '<p>No leave requests available</p>';
        }
    } else {
        console.warn('Leave requests list element not found!');
    }
}

// Update Employee Count on the Dashboard
function updateEmployeeCount(count) {
    document.getElementById('employeeCount').textContent = `Employee Count: ${count}`;
}

// Update Task Count on the Dashboard
function updateTaskCount(count) {
    document.getElementById('taskCount').textContent = `Task Count: ${count}`;
}


function fetchEmployeeData() {
    const employeeTableBody = document.querySelector('#employeeTable tbody'); // Correctly target the <tbody>
    if (!employeeTableBody) {
        console.error("Error: employeeTableBody element not found");
        return; // Exit if the table body element is not found
    }
    const token = getAuthToken(); // Assume this function fetches your auth token
    fetch('/api/admin/all_employees', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Clear existing rows
            employeeTableBody.innerHTML = '';

            // Populate rows dynamically
            data.forEach(employee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${employee.id}</td>
                    <td>${employee.username}</td>
                    <td>${employee.email}</td>
                    <td>${employee.designation}</td>
                    <td>${employee.isActive ? 'Yes' : 'No'}</td>
                  <td>
        <button class="update-button" onclick="updateEmployee(${employee.id})">Update</button>
        <button class="deactivate-button" onclick="deactivateEmployee(${employee.id})">Deactivate</button>
        <button class="delete-button" onclick="deleteEmployee(${employee.id})">Delete</button>
    </td>
                `;
                employeeTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching employee data:', error));
}

document.addEventListener("DOMContentLoaded", () => {
    // Get modal elements
    const employeeModal = document.getElementById("employeeModal");
    const createEmployeeBtn = document.getElementById("createEmployeeBtn");
    const employeeForm = document.getElementById("employeeForm");
    const modalTitle = document.getElementById("modalTitle");
    const submitBtn = document.getElementById("submitBtn");
    const cancelBtn = document.getElementById("closeModalBtn");

    // Ensure elements exist before adding event listeners
    if (createEmployeeBtn && employeeModal && employeeForm && modalTitle && submitBtn && cancelBtn) {
        // Show the modal when the "Create Employee" button is clicked
        createEmployeeBtn.addEventListener("click", () => {
            resetEmployeeForm(); // Clear the form fields
            modalTitle.textContent = "Create New Employee"; // Set title
            submitBtn.textContent = "Create Employee"; // Set button text
            submitBtn.removeAttribute("data-employee-id"); // Clear any attached employee ID
            employeeModal.style.display = "block"; // Show modal
        });

        // Hide the modal when the "Cancel" button is clicked
        cancelBtn.addEventListener("click", () => {
            employeeModal.style.display = "none"; // Hide modal
        });

        // Handle form submission (create or update)
        employeeForm.addEventListener("submit", handleEmployeeFormSubmit);
    } else {
        console.error("Error: Required modal elements not found in the DOM.");
    }

    // Attach event listener for password toggle
    document.querySelector(".password-toggle-icon").addEventListener("click", togglePassword);

    // Function to toggle password visibility
    function togglePassword() {
        const passwordInput = document.getElementById("password");
        const eyeIcon = document.getElementById("eye-icon");

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.classList.remove("fa-eye");
            eyeIcon.classList.add("fa-eye-slash");
        } else {
            passwordInput.type = "password";
            eyeIcon.classList.remove("fa-eye-slash");
            eyeIcon.classList.add("fa-eye");
        }
    }

    // Function to reset form fields
    function resetEmployeeForm() {
        employeeForm.reset();
    }
});


// Set max date for employmentDate to today
document.addEventListener('DOMContentLoaded', function () {
    const employmentDateInput = document.getElementById('employmentDate');
    const today = new Date().toISOString().split('T')[0];  // Get today's date in yyyy-mm-dd format
    employmentDateInput.setAttribute('max', today);
});

// Handle the form submission
function handleEmployeeFormSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const isCreate = submitBtn.textContent === "Create Employee";
    const employeeId = submitBtn.dataset.employeeId;

    const employeeData = {
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        firstName: document.getElementById('firstName').value,
        surname: document.getElementById('surname').value,
        otherName: document.getElementById('otherName').value || null,
        phone: document.getElementById('phone').value,
        employmentDate: document.getElementById('employmentDate').value || null,
        employmentType: document.getElementById('employmentType').value || null,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        department: document.getElementById('department').value || null,
        designation: document.getElementById('designation').value || null,
    };

    const method = isCreate ? 'POST' : 'PUT';
    const url = isCreate ? '/api/admin/employee/new' : `/api/admin/update/${employeeId}`;
    const token = getAuthToken();
    const id=getEmployeeId();

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(employeeData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Employee saved successfully');
                fetchEmployeeData(); // Refresh the employee list
                employeeModal.style.display = 'none'; // Hide modal
            } else {
                console.error('Error:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
}
// Update an employee
function updateEmployee(id) {
    const employeeModal = document.getElementById('employeeModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');

    if (!employeeModal || !modalTitle || !submitBtn) {
        console.error('Required modal elements not found in the DOM');
        return;
    }

    const token = getAuthToken();
    fetch(`/api/admin/employee/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch employee details. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(employee => {
            // Check if employee data exists
            if (!employee) {
                console.error('Employee data not found');
                alert('Failed to fetch employee details. Please try again.');
                return;
            }

            // Set form fields with employee data
            document.getElementById('email').value = employee.email || '';
            document.getElementById('username').value = employee.username || '';
            document.getElementById('password').value = ''; // Security: Leave blank
            document.getElementById('role').value = employee.role || '';
            document.getElementById('firstName').value = employee.firstName || '';
            document.getElementById('surname').value = employee.surname || '';
            document.getElementById('otherName').value = employee.otherName || '';
            document.getElementById('phone').value = employee.phone || '';
            document.getElementById('employmentDate').value = employee.employmentDate || '';
            document.getElementById('employmentType').value = employee.employmentType || '';
            document.getElementById('dob').value = employee.dob || '';
            document.getElementById('gender').value = employee.gender || '';
            document.getElementById('department').value = employee.department || '';
            document.getElementById('designation').value = employee.designation || '';

            // Update modal elements
            modalTitle.textContent = `Update Employee: ${employee.username}`;
            submitBtn.textContent = 'Update Employee';
            submitBtn.dataset.employeeId = id; // Attach employee ID to the button

            // Open modal
            employeeModal.style.display = 'block';

            // Submit the updated employee data
            submitBtn.addEventListener('click', function() {
                const updatedEmployee = {
                    email: document.getElementById('email').value,
                    username: document.getElementById('username').value,
                    role: document.getElementById('role').value,
                    firstName: document.getElementById('firstName').value,
                    surname: document.getElementById('surname').value,
                    otherName: document.getElementById('otherName').value,
                    phone: document.getElementById('phone').value,
                    employmentDate: document.getElementById('employmentDate').value,
                    employmentType: document.getElementById('employmentType').value,
                    dob: document.getElementById('dob').value,
                    gender: document.getElementById('gender').value,
                    department: document.getElementById('department').value,
                    designation: document.getElementById('designation').value,
                };

                // Make PUT request to update employee details
                fetch(`/api/admin/update/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedEmployee),
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to update employee. Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(() => {
                        // Update button and show success message
                        submitBtn.textContent = 'Employee Updated Successfully';
                        submitBtn.disabled = true; // Disable the button after update
                        setTimeout(() => {
                            employeeModal.style.display = 'none'; // Close modal after a few seconds
                        }, 1000);
                    })
                    .catch(error => {
                        console.error('Error updating employee:', error);
                        alert('Failed to update employee details. Please try again.');
                    });
            });
        })
        .catch(error => {
            console.error('Error fetching employee details:', error);
            alert('Failed to fetch employee details. Please try again.');
        });
}


// Deactivate an employee with confirmation
function deactivateEmployee(id) {
    if (confirm("Are you sure you want to deactivate this employee?")) {
        fetch(`/api/admin/deactivate/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to deactivate employee. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Employee deactivated:', data);
                alert(`Employee ${data.firstName} ${data.lastName} has been deactivated successfully.`);
                fetchEmployeeData(); // Refresh the employee list
            })
            .catch(error => {
                console.error('Error deactivating employee:', error);
                alert('Error: Unable to deactivate employee.');
            });
    } else {
        console.log("Employee deactivation cancelled.");
    }
}

// Delete an employee with confirmation
function deleteEmployee(id) {
    if (confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
        fetch(`/api/admin/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (response.ok) {
                    console.log(`Employee with ID ${id} deleted successfully`);
                    fetchEmployeeData(); // Refresh the employee list
                } else if (response.status === 404) {
                    console.error(`Employee with ID ${id} not found`);
                    alert("Employee not found.");
                } else {
                    console.error(`Error deleting employee with ID ${id}`);
                    alert("Failed to delete the employee. Please try again.");
                }
            })
            .catch(error => {
                console.error(`Error deleting employee with ID ${id}:`, error);
                alert("An error occurred while trying to delete the employee.");
            });
    } else {
        console.log("Employee deletion cancelled.");
    }
}

// Function to fetch leaves and populate the table
function fetchLeaveApplications() {
    const token = getAuthToken(); // Get the auth token
    fetch('/api/admin/leaves', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(leaves => {
            console.log('Fetched Leave Applications:', leaves); // Log the fetched data

            const tbody = document.querySelector('#leave-table-body');

            if (!tbody) {
                console.error('tbody not found!');
                return;
            }

            // Debugging the tbody content before populating
            console.log('Current tbody content:', tbody.innerHTML);

            tbody.innerHTML = ''; // Clear existing rows

            // Check if leaves array is empty
            if (leaves.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">No leave requests available</td></tr>';
                return;
            }

            // Loop through each leave and create a row for it
            leaves.forEach(leave => {
                const row = document.createElement('tr');

                // Populate table columns (ensure property names match the fetched data)
                row.innerHTML = `
                <td>${leave.employeeFirstName} ${leave.employeeSurname}</td>
                <td>${leave.leaveType}</td>
                <td>${leave.startDate}</td>
                <td>${leave.endDate}</td>
                <td>${leave.status}</td>
                <td>
                    <select class="action-dropdown" data-leave-id="${leave.id}">
                        <option value="">Select Action</option>
                        <option value="approve" class="button-option approve">Approve</option>
                        <option value="reject" class="button-option reject">Reject</option>
                        <option value="recall" class="button-option recall">Recall</option>
                    </select>
                </td>
            `;

                // Set the default selected value for the action dropdown to empty
                const actionDropdown = row.querySelector('.action-dropdown');
                actionDropdown.value = ""; // Ensure "Select Action" is selected by default

                // Add event listener for action dropdown
                actionDropdown.addEventListener('change', (event) => {
                    const action = event.target.value;
                    const leaveId = event.target.getAttribute('data-leave-id');
                    handleAction(action, leaveId);
                });

                tbody.appendChild(row);
            });

            // Debugging after rows are added
            console.log('Updated tbody content:', tbody.innerHTML);
        })
        .catch(error => console.error('Error fetching leave applications:', error));
}

// Call fetchLeaveApplications when the page is loaded
window.onload = function() {
    fetchLeaveApplications(); // Fetch the leave applications when the page is loaded
};

// Function to handle action (approve, reject, recall)
function handleAction(action, leaveId) {
    if (!action || !leaveId) return;

    let url;
    switch (action) {
        case 'approve':
            url = `/api/admin/approve-leave/${leaveId}`; // Replace with your actual endpoint
            break;
        case 'reject':
            url = `/api/admin/reject-leave/${leaveId}`; // Replace with your actual endpoint
            break;
        case 'recall':
            url = `/api/admin/recall-leave/${leaveId}`; // Replace with your actual endpoint
            break;
        default:
            return;
    }
    const token = getAuthToken(); // Get the auth token

    fetch(url, {

        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                alert(`${action.charAt(0).toUpperCase() + action.slice(1)} success`);
                fetchLeaveApplications(); // Refresh the table after action
            } else {
                alert('Error performing action');
            }
        })
        .catch(error => console.error('Error handling action:', error));
}

// Call the function to populate the table initially
fetchLeaveApplications();
document.querySelectorAll('.action-dropdown').forEach(dropdown => {
    dropdown.addEventListener('change', function() {
        const action = this.value;
        const leaveId = this.getAttribute('data-leave-id');

        if (action) {
            let url;
            let method = 'POST';
            let message = '';

            if (action === 'approve') {
                url = `/api/admin/approve-leave/${leaveId}`;
                message = 'Approving leave application...';
            } else if (action === 'reject') {
                url = `/api/admin/reject-leave/${leaveId}`;
                message = 'Rejecting leave application...';
            } else if (action === 'recall') {
                url = `/api/admin/recall-leave/${leaveId}`;
                message = 'Recalling leave application...';
            }

            // Confirm action
            if (confirm(`Are you sure you want to ${action} this leave application?`)) {
                // Make an API request
                fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message) {
                            alert(data.message); // Display success message
                        }
                        this.value = ''; // Reset the dropdown
                    })
                    .catch(error => {
                        alert('An error occurred: ' + error);
                    });
            }
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    console.log("Fetching finance requests...");
    fetchFinanceRequests();
});

function fetchFinanceRequests() {
    fetch('/leaves/status/PENDING', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer YOUR_JWT_TOKEN' // Replace with actual token
        }
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log("API Response:", data); // Debugging step
            const activitiesContainer = document.querySelector('.activities');

            // Ensure container exists
            if (!activitiesContainer) {
                console.error("Error: .activities container not found!");
                return;
            }

            activitiesContainer.innerHTML = ""; // Clear previous items

            if (data.length === 0) {
                activitiesContainer.innerHTML = "<p>No pending finance requests.</p>";
                return;
            }

            data.forEach(request => {
                const activityDiv = document.createElement('div');
                activityDiv.classList.add('activity');

                const icon = document.createElement('i');
                icon.classList.add('fas', 'fa-file-alt');

                const text = document.createElement('p');
                text.textContent = `Leave Request from ${request.employeeFirstName} ${request.employeeSurname} (${request.leaveType}): ${request.status}`;

                const button = document.createElement('button');
                button.textContent = "Review";
                button.addEventListener('click', () => {
                    alert(`Reviewing request from ${request.employeeFirstName}`);
                });

                activityDiv.appendChild(icon);
                activityDiv.appendChild(text);
                activityDiv.appendChild(button);
                activitiesContainer.appendChild(activityDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching finance requests:', error);
        });
}



document.addEventListener("DOMContentLoaded", function() {
    const financeTab = document.getElementById("financeTab");
    const financeRequestsList = document.getElementById("financeRequestsList");

    // Replace with actual token you get after login
    const token = getAuthToken(); // Get the auth token

    // Handle click event for the Finance tab
    financeTab.addEventListener("click", function() {
        fetchFinanceRequests("PENDING");
    });

    // Fetch finance requests based on the status
    function fetchFinanceRequests(status) {

        // Clear any previous content
        financeRequestsList.innerHTML = "Loading...";

        // Make API request to get the finance requests with the 'PENDING' status
        fetch(`/api/admin/finance-requests/status/${status}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                // Clear the previous content
                financeRequestsList.innerHTML = "";

                if (data && data.length > 0) {
                    data.forEach(request => {
                        const li = document.createElement("li");
                        li.textContent = `Request ID: ${request.id}, Amount: ${request.amount}`;
                        financeRequestsList.appendChild(li);
                    });
                } else {
                    financeRequestsList.innerHTML = "No pending requests.";
                }
            })
            .catch(error => {
                financeRequestsList.innerHTML = "Error fetching data.";
                console.error("Error fetching finance requests:", error);
            });
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".activity-content");
    const tasksContainer = document.getElementById("tasks-container");
    const financeRequestsContainer = document.getElementById("finance-requests-container");
    const leavesRequestsContainer = document.getElementById("leaves-requests-container");
    const token = getAuthToken();

    // Default tab is set to 'tasks' (but this can be changed)
    const defaultTab = 'tasks';
    const activeTab = document.querySelector(`.tab[data-tab="${defaultTab}"]`);
    const activeContent = document.getElementById(defaultTab);

    // Function to fetch tasks by status
    function fetchTasks(status) {
        fetch(`/api/admin/tasks/status/${status}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(tasks => {
                tasksContainer.innerHTML = '';  // Clear previous content
                if (tasks.length > 0) {
                    tasks.forEach(task => {
                        const taskDiv = document.createElement('div');
                        taskDiv.classList.add('activity');
                        taskDiv.innerHTML = `
                            <i class="fas fa-tasks"></i>
                            <p>${task.title}</p>
                            <p>Assigned to: ${task.employee.firstName} ${task.employee.surname}</p>
                            <p>Due Date: ${task.dueDate}</p>
                            <p>Status: ${task.status}</p>
                            <button class="view-details-btn">View Details</button>
                        `;
                        tasksContainer.appendChild(taskDiv);

                        // Add an event listener for the "View Details" button
                        const viewDetailsButton = taskDiv.querySelector('.view-details-btn');
                        viewDetailsButton.addEventListener('click', function () {
                            window.location.href = '/manageTasks';  // Redirect to the manage tasks page
                        });
                    });
                } else {
                    tasksContainer.innerHTML = '<p>No tasks found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
                tasksContainer.innerHTML = '<p>Error fetching data. Please try again later.</p>';
            });
    }

    // Function to fetch financial requests
    function fetchFinancialRequests(status) {
        fetch(`/api/admin/finance-requests/status/${status}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(requests => {
                financeRequestsContainer.innerHTML = '';  // Clear previous content
                if (requests.length > 0) {
                    requests.forEach(request => {
                        const requestDiv = document.createElement('div');
                        requestDiv.classList.add('activity');
                        requestDiv.innerHTML = `
                            <i class="fas fa-money-check"></i>
                            <p>Request by: ${request.employee.firstName} ${request.employee.surname}</p>
                            <p>Amount: ${request.amount}</p>
                            <p>Status: ${request.status}</p>
                            <button class="view-details-btn">View Details</button>
                        `;
                        financeRequestsContainer.appendChild(requestDiv);

                        // Add an event listener for the "View Details" button
                        const viewDetailsButton = requestDiv.querySelector('.view-details-btn');
                        viewDetailsButton.addEventListener('click', function () {
                            window.location.href = '/manageFinanceRequests';  // Redirect to the manage finance requests page
                        });
                    });
                } else {
                    financeRequestsContainer.innerHTML = '<p>No financial requests found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching financial requests:', error);
                financeRequestsContainer.innerHTML = '<p>Error fetching data. Please try again later.</p>';
            });
    }

    // Function to fetch leave requests
    function fetchLeaveRequests(status) {
        fetch(`/api/admin/leaves/status/${status}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(requests => {
                leavesRequestsContainer.innerHTML = '';  // Clear previous content
                if (requests.length > 0) {
                    requests.forEach(request => {
                        const requestDiv = document.createElement('div');
                        requestDiv.classList.add('activity');
                        requestDiv.innerHTML = `
                            <i class="fas fa-suitcase"></i>
                            <p>Request by: ${request.employeeFirstName} ${request.employeeSurname}</p>
                            <p>Leave Type: ${request.leaveType}</p>
                            <p>Status: ${request.status}</p>
                            <button class="view-details-btn">View Details</button>
                        `;
                        leavesRequestsContainer.appendChild(requestDiv);

                        // Add an event listener for the "View Details" button
                        const viewDetailsButton = requestDiv.querySelector('.view-details-btn');
                        viewDetailsButton.addEventListener('click', function () {
                            window.location.href = '/manageLeaveRequests';  // Redirect to the manage leave requests page
                        });
                    });
                } else {
                    leavesRequestsContainer.innerHTML = '<p>No leave requests found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching leave requests:', error);
                leavesRequestsContainer.innerHTML = '<p>Error fetching data. Please try again later.</p>';
            });
    }

    // Ensure that the active tab and content exist before applying styles
    if (activeTab && activeContent) {
        activeTab.classList.add("active");
        activeContent.style.display = "block";
    }

    // Event listener for switching tabs
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            // Remove 'active' class from all tabs and hide all contents
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(content => content.style.display = "none");

            // Add 'active' class to clicked tab and show corresponding content
            this.classList.add("active");
            const selectedTab = this.getAttribute("data-tab");

            const selectedContent = document.getElementById(selectedTab);
            if (selectedContent) {
                selectedContent.style.display = "block";  // Only apply if the element exists
            } else {
                console.error(`Element with id '${selectedTab}' not found.`);
            }

            // Fetch tasks when the Tasks tab is clicked
            if (selectedTab === "tasks") {
                fetchTasks('PENDING');  // Fetch tasks with a status of 'PENDING'
            }

            // Fetch financial requests when the Finance tab is clicked
            if (selectedTab === "finance") {
                fetchFinancialRequests('PENDING');
            }

            // Fetch leave requests when the Leave tab is clicked
            if (selectedTab === "leaves") {
                fetchLeaveRequests('PENDING');
            }
        });
    });

    // Event listener for clicking on the Finance section in recent activities
    document.getElementById("finance").addEventListener("click", function () {
        fetchFinancialRequests('PENDING');
    });

    // Event listener for clicking on the Leave section in recent activities
    document.getElementById("leaves").addEventListener("click", function () {
        fetchLeaveRequests('PENDING');
    });
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


// Fetch employee data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchEmployeeData();  // Load employee data
    fetchAdminDashboardData();  // Load dashboard data
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
