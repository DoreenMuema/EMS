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
// tasks button action
const tasksBtn = document.getElementById("tasksBtn");
if (tasksBtn) {
    console.log("Finance button found");
    tasksBtn.addEventListener("click", () => {
        console.log("Finance button clicked");
        window.location.href = "/manageTasks";
    });
} else {
    console.error("Finance button not found.");
}
// tasks button action
const adminFinanceBtn = document.getElementById("adminFinanceBtn");
if (adminFinanceBtn) {
    console.log("Finance button found");
    tasksBtn.addEventListener("click", () => {
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
    const leaveRequestsList = document.getElementById('leaveRequestsList');
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

// Ensure the "Create Employee" button is correctly targeted
document.addEventListener("DOMContentLoaded", () => {
    const createEmployeeBtn = document.getElementById('createEmployeeBtn');
    const employeeModal = document.getElementById('employeeModal');
    const employeeForm = document.getElementById('employeeForm');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (createEmployeeBtn && employeeModal && employeeForm && modalTitle && submitBtn && cancelBtn) {
        // Show the modal when the "Create Employee" button is clicked
        createEmployeeBtn.addEventListener('click', () => {
            resetEmployeeForm(); // Clear the form fields
            modalTitle.textContent = "Create New Employee"; // Set title
            submitBtn.textContent = "Create Employee"; // Set button text
            submitBtn.removeAttribute('data-employee-id'); // Clear any attached employee ID
            employeeModal.style.display = 'block'; // Show modal
        });

        // Hide the modal when the "Cancel" button is clicked
        cancelBtn.addEventListener('click', () => {
            employeeModal.style.display = 'none'; // Hide modal
        });

        // Handle form submission (create or update)
        employeeForm.addEventListener('submit', handleEmployeeFormSubmit);
    } else {
        console.error("Error: Required modal elements not found in the DOM.");
    }
});

// Reset the form fields
function resetEmployeeForm() {
    document.getElementById('employeeForm').reset();
}

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


// Deactivate an employee
function deactivateEmployee(id) {
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
}

// Delete an employee
function deleteEmployee(id) {
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

            const tbody = document.querySelector('#leaveTable tbody');
            tbody.innerHTML = ''; // Clear existing rows

            leaves.forEach(leave => {
                const row = document.createElement('tr');

                // Populate table columns
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

                // Add event listener for action dropdown
                row.querySelector('.action-dropdown').addEventListener('change', (event) => {
                    const action = event.target.value;
                    const leaveId = event.target.getAttribute('data-leave-id');
                    handleAction(action, leaveId);
                });

                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching leave applications:', error));
}

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
