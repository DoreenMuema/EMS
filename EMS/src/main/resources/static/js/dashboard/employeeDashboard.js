// Function to get the auth token
function getAuthToken() {
    return localStorage.getItem('accessToken');
}

// Function to get the employee ID from local storage
function getEmployeeId() {
    return localStorage.getItem('employeeId'); // Retrieve 'employeeId' from local storage
}
// Tasks button action
const viewTasksBtn = document.getElementById("viewTasksBtn");
if (viewTasksBtn) {
    console.log("Tasks button found");
    viewTasksBtn.addEventListener("click", () => {
        console.log("Tasks button clicked");
        window.location.href = "/employeeTasks";
    });
} else {
    console.error("Tasks button not found.");
}

// Leave request button action
const requestLeaveBtn = document.getElementById("requestLeaveBtn");
if (requestLeaveBtn) {
    console.log("Leave request button found");
    requestLeaveBtn.addEventListener("click", () => {
        console.log("Leave request button clicked");
        window.location.href = "/employeeLeaveApplication";
    });
} else {
    console.error("Leave request button not found.");
}

// Finance button action
const financeBtn = document.getElementById("financeBtn");
if (financeBtn) {
    console.log("Finance button found");
    financeBtn.addEventListener("click", () => {
        console.log("Finance button clicked");
        window.location.href = "/employeefinanceRequest";
    });
} else {
    console.error("Finance button not found.");
}
// Function to fetch tasks by employee ID and display them
function fetchTasksByStatus(status = '') {
    const employeeId = getEmployeeId();  // Get employeeId from local storage

    console.log('Fetching tasks for employee ID:', employeeId);  // Log employeeId

    // Ensure employeeId is valid (e.g., a number) before sending the request
    if (!employeeId || isNaN(employeeId)) {
        console.error('Invalid employee ID');
        return;  // Prevent API call if the employeeId is invalid
    }

    const token = getAuthToken();  // Assuming getAuthToken() retrieves the token
    const tasksContainer = document.getElementById('employeeTasks-container'); // Ensure this element exists

    console.log('Authorization token:', token);  // Log token for debugging

    // Fetch tasks from the backend using the provided employeeId
    fetch(`/api/tasks/pending/${employeeId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            return response.json();
        })
        .then(tasks => {
            console.log('Tasks fetched:', tasks);  // Log the fetched tasks

            tasksContainer.innerHTML = '';  // Clear any previous content

            if (tasks.length > 0) {
                tasks.forEach(task => {
                    const taskDiv = document.createElement('div');
                    taskDiv.classList.add('activity');
                    taskDiv.innerHTML = `
                        <i class="fas fa-tasks"></i>
                        <p><strong>Task Title:</strong> ${task.title}</p>
                        <p><strong>Assigned by:</strong> ${task.employee.firstName} ${task.employee.surname}</p>
                        <p><strong>Due Date:</strong> ${task.dueDate}</p>
                        <p><strong>Status:</strong> ${task.status}</p>
                        <button class="view-details-btn">View Details</button>
                    `;
                    tasksContainer.appendChild(taskDiv);

                    // Add event listener for "View Details" button
                    const viewDetailsButton = taskDiv.querySelector('.view-details-btn');
                    viewDetailsButton.addEventListener('click', () => {
                        console.log('View Details clicked for task:', task.title);
                        window.location.href = '/employeeTasks';  // Redirect to manage tasks page
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

// Fetch and display leave and finance notifications
function updateNotifications(employeeId) {
    const token = getAuthToken();  // Retrieve the auth token

    // Fetch unread finance notifications
    fetch(`/api/notifications/employee/${employeeId}/finance/unread`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            const financeContainer = document.getElementById('employeeFinanceRequests-container');
            financeContainer.innerHTML = `
                <p>Unread Finance Requests: ${data}</p>
                <button class="view-notifications-btn" id="finance-notifications-btn">View Finance Notifications</button>
            `;
            document.getElementById('finance-notifications-btn').addEventListener('click', () => {
                window.location.href = '/financeNotifications';  // Redirect to finance notifications page
            });
        })
        .catch(error => console.error('Error fetching finance notifications:', error));

    // Fetch unread leave notifications
    fetch(`/api/notifications/employee/${employeeId}/leave/unread`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            const leaveContainer = document.getElementById('employeeRequests-container');
            leaveContainer.innerHTML = `
                <p>Unread Leave Requests: ${data}</p>
                <button class="view-notifications-btn" id="leave-notifications-btn">View Leave Notifications</button>
            `;
            document.getElementById('leave-notifications-btn').addEventListener('click', () => {
                window.location.href = '/leaveNotifications';  // Redirect to leave notifications page
            });
        })
        .catch(error => console.error('Error fetching leave notifications:', error));
}

// Call the function to fetch tasks once the page is ready
fetchTasksByStatus();

// Get all tabs and activity sections
const tabs = document.querySelectorAll('.tab');
const activityContents = document.querySelectorAll('.activity-content');

// Add click event listener for each tab
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        console.log('Tab clicked:', tab.getAttribute('data-tab'));  // Log which tab was clicked

        // Remove active class from all tabs
        tabs.forEach(tab => tab.classList.remove('active'));

        // Hide all activity sections
        activityContents.forEach(content => content.style.display = 'none');

        // Add active class to clicked tab
        tab.classList.add('active');

        // Show the corresponding activity section
        const tabId = tab.getAttribute('data-tab');
        const activitySection = document.getElementById(tabId);

        // Check if the element exists before modifying its style
        if (activitySection) {
            console.log('Displaying activity section:', tabId);  // Log the section being displayed
            activitySection.style.display = 'block';
        } else {
            console.error(`No element found with ID: ${tabId}`);
        }

        // Fetch and display tasks when the 'Assigned Tasks' tab is clicked
        if (tabId === 'employeeTasks') {
            console.log('Fetching assigned tasks for employee');
            fetchTasksByStatus('assigned');  // Fetch tasks with status 'assigned'
        }

        // Fetch notifications for finance and leave when the appropriate tab is clicked
        if (tabId === 'notifications') {
            updateNotifications(getEmployeeId());  // Update finance and leave notifications
        }
    });
});

// Fetch tasks by default when the page loads
console.log('Fetching default tasks (assigned) when the page loads');
fetchTasksByStatus('assigned');  // Initially fetch 'assigned' tasks
// Function to fetch unread finance notifications
function getUnreadFinanceNotifications(employeeId) {
    const token = getAuthToken();  // Retrieve the auth token

    fetch(`/api/notifications/employee/${employeeId}/finance/unread`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,  // Add the Authorization header with the Bearer token
            'Content-Type': 'application/json',  // Optional: add content type header
        }
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('employeeFinanceRequests-container').innerHTML = `Unread Finance Requests: ${data}`;
        })
        .catch(error => console.error('Error fetching finance notifications:', error));
}

// Function to fetch unread leave notifications
function getUnreadLeaveNotifications(employeeId) {
    const token = getAuthToken();  // Retrieve the auth token

    fetch(`/api/notifications/employee/${employeeId}/leave/unread`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,  // Add the Authorization header with the Bearer token
            'Content-Type': 'application/json',  // Optional: add content type header
        }
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('employeeRequests-container').innerHTML = `Unread Leave Requests: ${data}`;
        })
        .catch(error => console.error('Error fetching leave notifications:', error));
}

// Handle tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabContent = document.querySelectorAll('.activity-content');
        const activeTab = this.getAttribute('data-tab');

        // Hide all activity contents
        tabContent.forEach(content => {
            content.style.display = 'none';
        });

        // Show the selected tab content
        document.getElementById(activeTab).style.display = 'block';

        // Optionally fetch notifications when the tabs are clicked
        const employeeId = getEmployeeId(); // Replace with the actual employeeId from your backend or session
        if (activeTab === 'employeeFinance') {
            getUnreadFinanceNotifications(employeeId);
        } else if (activeTab === 'employeeLeaves') {
            getUnreadLeaveNotifications(employeeId);
        }
    });
});

// Trigger fetching notifications for the default active tab (e.g., Finance Requests)
window.addEventListener('DOMContentLoaded', function() {
    const employeeId = getEmployeeId();  // Replace with the actual employeeId
    getUnreadFinanceNotifications(employeeId);  // Load finance notifications by default
});
// Function to validate names
function validateName(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    const regex = /^[A-Za-z]{2,}$/; // Only letters, minimum 2 characters

    if (!regex.test(input.value)) {
        error.style.display = "block";
        input.style.border = "2px solid red";
    } else {
        error.style.display = "none";
        input.style.border = "";
    }
}

document.getElementById("firstName").addEventListener("input", () => validateName("firstName", "firstNameError"));
document.getElementById("surname").addEventListener("input", () => validateName("surname", "surnameError"));
document.getElementById("otherName").addEventListener("input", () => validateName("otherName", "otherNameError"));

// Function to validate password
function validatePassword() {
    const password = document.getElementById("password");
    const error = document.getElementById("passwordError");
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

    if (!regex.test(password.value)) {
        error.style.display = "block";
        password.style.border = "2px solid red";
    } else {
        error.style.display = "none";
        password.style.border = "";
    }
}

document.getElementById("password").addEventListener("input", validatePassword);

// Password validation for confirmation
document.getElementById('changePasswordForm').addEventListener('submit', function(event) {
    let newPassword = document.getElementById('newPassword').value;
    let confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert("New Password and Confirm Password do not match!");
        event.preventDefault();
    }
});


// Establish the WebSocket connection for the employee
const employeeId = getEmployeeId(); // Get the employee ID
if (employeeId) { // Ensure employeeId is not null or undefined
    const employeeSocket = new WebSocket(`ws://localhost:8080/ws/employee/${employeeId}`);

    // Handle incoming WebSocket messages
    employeeSocket.onmessage = function(event) {
        const message = event.data;
        alert('Employee Notification: ' + message); // Display the notification
    };

    // Handle WebSocket connection errors
    employeeSocket.onerror = function(error) {
        console.error('WebSocket Error:', error);
    };

    // Handle WebSocket connection closure
    employeeSocket.onclose = function() {
        console.log('WebSocket connection closed.');
    };
} else {
    console.error('Employee ID not found in local storage.');
}




document.addEventListener('DOMContentLoaded', () => {
    const employeeId = getEmployeeId();
    const accessToken = getAuthToken();

    // Fetch profile data
    if (!accessToken || !employeeId) {
        alert("Authorization token or Employee ID not found. Please log in again.");
        window.location.href = "/employeeLogin";
        return;
    }

    fetch(`/api/profile/${employeeId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('email').textContent = data.email || 'N/A';
            document.getElementById('role').textContent = data.role || 'N/A';
            document.getElementById('designation').textContent = data.designation || 'N/A';
            document.getElementById('idNumberDisplay').textContent = data.idNumber || 'N/A';  // Update the displayed ID number
            document.getElementById('phoneNumber').textContent = data.phone || 'N/A';
            document.getElementById('addressProfile').textContent = data.address || 'N/A';
            document.getElementById('departmentProfile').textContent = data.department || 'N/A';
            document.getElementById('employmentDate').textContent = data.employmentDate || 'N/A';
            document.getElementById('employmentType').textContent = data.employmentType || 'N/A';
            document.getElementById('dobProfile').textContent = data.dob || 'N/A';
            document.getElementById('age').textContent = data.age || 'N/A';
            document.getElementById('genderProfile').textContent = data.gender || 'N/A';

            // Populate editable fields in the modal
            document.getElementById('firstName').value = data.firstName || '';
            document.getElementById('surname').value = data.surname || '';
            document.getElementById('otherName').value = data.otherName || '';
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('address').value = data.address || '';
            document.getElementById('idNumber').value = data.idNumber || '';
            document.getElementById('dobModal').value = data.dob || '';
            document.getElementById('ageModal').value = '';
            document.getElementById('genderModal').value = data.gender || '';


        })
        .catch(error => {
            console.error('Error fetching profile data:', error);
        });

    // Fetch leave requests
    fetch(`/api/employee/leaves/${employeeId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            // Ensure the tbody element exists before appending rows
            const tbody = document.querySelector('.card table tbody');
            if (tbody) {
                if (data && Array.isArray(data)) {
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
                        tbody.appendChild(row);
                    });
                } else {
                    const row = document.createElement('tr');
                    row.innerHTML = '<td colspan="6">No leave applications found.</td>';
                    tbody.appendChild(row);
                }
            } else {
                console.error('Table body (tbody) element not found!');
            }
        })
        .catch(error => {
            console.error('Error fetching leave data:', error);
        });
    document.getElementById('imageUpload').addEventListener('change', function (event) {
        const fileInput = event.target;
        const formData = new FormData();
        const employeeId = getEmployeeId();

        formData.append('file', fileInput.files[0]);
        formData.append('employeeId', employeeId);

        // Send the image to the backend
        fetch('/uploads/upload', {
            method: 'POST',
            'Authorization': `Bearer ${accessToken}`,
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const imageUrl = data.fileUrl;
                    document.getElementById('profileImage').src = imageUrl; // Update the image preview
                    document.getElementById('removeImage').style.display = 'block'; // Show the cancel icon
                } else {
                    alert('Upload failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error uploading image:', error);
                alert('An error occurred while uploading the image.');
            });
    });

    document.getElementById('removeImage').addEventListener('click', function () {
        document.getElementById('profileImage').src = 'https://via.placeholder.com/150'; // Reset to default
        document.getElementById('removeImage').style.display = 'none'; // Hide the cancel icon
        document.getElementById('imageUpload').value = ''; // Clear the file input
    });



    const editProfileForm = document.getElementById('editProfileForm');
// Get today's date to disable future dates in the calendar
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

    if (editProfileForm) {
        // Disable future dates in employment date field
        const employmentDateField = document.getElementById('employmentDateModal');
        if (employmentDateField) {
            employmentDateField.setAttribute('max', today);  // Set the max date to today's date
        }

        editProfileForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const updatedData = {
                firstName: document.getElementById('firstName').value,
                surname: document.getElementById('surname').value,
                otherName: document.getElementById('otherName').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                dob: document.getElementById('dobModal').value,
                idNumber: document.getElementById('idNumber').value,
                gender: document.getElementById('genderModal').value,
                age: document.getElementById('ageModal').value,
                department: document.getElementById('departmentModal').value,
            };
            console.log("Updated Data:", updatedData);

            fetch(`/api/profile/update/${employeeId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)

            })
                .then(response => response.json())
                .then(data => {
                    alert('Profile updated successfully!');
                    closeModal();
                    location.reload();
                })
                .catch(error => {
                    console.error('Error updating profile:', error);
                });
        });
        // Handle cancel button click
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');

        function closeModal() {
            const employeeModal = document.getElementById('employeeModal');
            const changePasswordModal = document.getElementById('changePasswordModal');

            if (employeeModal && employeeModal.style.display !== 'none') {
                employeeModal.style.display = 'none';  // Hide employee modal
                console.log("Employee modal closed!");
            }

            if (changePasswordModal && changePasswordModal.style.display !== 'none') {
                changePasswordModal.style.display = 'none';  // Hide change password modal
                console.log("Change password modal closed!");
            }
        }


        function handleCancelClick() {
            if (editProfileForm) {
                editProfileForm.reset(); // Reset form fields
            }
            closeModal(); // Close the modal
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', handleCancelClick);
        }

        if (cancelEditProfileBtn) {
            cancelEditProfileBtn.addEventListener('click', handleCancelClick);
        }
    }


    // Handle other modals
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            document.getElementById('employeeModal').style.display = 'block';
        });
    }

    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            document.getElementById('changePasswordModal').style.display = 'block';
        });
    }
    document.addEventListener("DOMContentLoaded", () => {
        const editProfileBtn = document.getElementById('editProfileBtn');
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const employeeModal = document.getElementById('employeeModal');
        const changePasswordModal = document.getElementById('changePasswordModal');
        const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');
        const cancelChangePasswordBtn = document.getElementById('cancelChangePasswordBtn');

        if (editProfileBtn && changePasswordBtn && employeeModal && changePasswordModal) {
            // Open Employee Modal
            editProfileBtn.addEventListener('click', () => {
                console.log('Opening Employee Modal');
                employeeModal.style.display = 'block';
            });

            // Open Change Password Modal
            changePasswordBtn.addEventListener('click', () => {
                console.log('Opening Change Password Modal');
                changePasswordModal.style.display = 'block';
            });

            // Close Employee Modal
            cancelEditProfileBtn.addEventListener('click', () => {
                console.log('Closing Employee Modal');
                employeeModal.style.display = 'none';
            });

            // Close Change Password Modal
            cancelChangePasswordBtn.addEventListener('click', () => {
                console.log('Closing Change Password Modal');
                changePasswordModal.style.display = 'none';
            });
        } else {
            console.error("Error: Required modal elements not found in the DOM.");
        }
    });




    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                alert('Passwords do not match. Please try again.');
                return;
            }

            fetch(`/api/change-password/${employeeId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentPassword, newPassword })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Password changed successfully!');
                        closeChangePasswordModal();
                    } else if (data.error) {
                        alert(`Error changing password: ${data.error}`);
                    }
                })
                .catch(error => {
                    console.error('Error changing password:', error);
                    alert('An error occurred while changing the password. Please try again later.');
                });
        })
    }
    document.addEventListener("DOMContentLoaded", () => {
        const togglePassword = document.getElementById("toggle-password");
        const passwordField = document.getElementById("password");
        const eyeIcon = document.getElementById("eye-icon");

        togglePassword.addEventListener("click", () => {
            // Toggle the type attribute between password and text
            if (passwordField.type === "password") {
                passwordField.type = "text";
                eyeIcon.classList.remove("fa-eye");
                eyeIcon.classList.add("fa-eye-slash");
            } else {
                passwordField.type = "password";
                eyeIcon.classList.remove("fa-eye-slash");
                eyeIcon.classList.add("fa-eye");
            }
        });
    });


    // Fetch leave balances
    fetch(`/api/leave-balances/${employeeId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('.leave-balances table tbody');

            if (data.error) {
                // If there's an error message
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="3">${data.error}</td>`;
                tbody.appendChild(row);
            } else {
                // If leave balances are fetched successfully
                const leaveTypes = [
                    { type: "Annual Leave", eligible: data.annualLeave.eligible, available: data.annualLeave.available },
                    { type: "Compassionate Leave", eligible: data.compassionateLeave.eligible, available: data.compassionateLeave.available },
                    { type: "Sick Leave", eligible: data.sickLeave.eligible, available: data.sickLeave.available },
                    { type: "Paternity Leave", eligible: data.paternityLeave.eligible, available: data.paternityLeave.available }
                ];

                leaveTypes.forEach(leave => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td>${leave.type}</td>
                    <td>${leave.available}</td>
                    <td>${leave.eligible}</td>
                `;
                    tbody.appendChild(row);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching leave balances:', error);
        });
});

document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the employeeId from local storage
    const employeeId = localStorage.getItem('employeeId');

    // Check if the employeeId exists in local storage
    if (!employeeId) {
        console.error("Employee ID not found in local storage");
        return;
    }

    // Construct the base URL for the image
    const imageUrlBase = `/uploads/${employeeId}_Photo`;

    // Try different file extensions (png, jpg, jpeg)
    const possibleExtensions = ['.PNG', '.JPG', '.JPEG'];

    // Find the first available image by checking each file extension
    let imageUrl = null;
    for (const ext of possibleExtensions) {
        const testImageUrl = `${imageUrlBase}${ext}`;
        if (isImageAvailable(testImageUrl)) { // A function to check if the image exists
            imageUrl = testImageUrl;
            break;
        }
    }

    // If no valid image was found, fall back to a default image
    if (!imageUrl) {
        imageUrl = `${imageUrlBase}.PNG`; // Default to .PNG or any extension you prefer
    }

    // Set the profile image source
    setProfileImage(imageUrl);
});

// Function to set the profile image
function setProfileImage(imageUrl) {
    const profileImageElement = document.getElementById("profileImage");

    if (profileImageElement) {
        // Set the image URL for the profile image element
        profileImageElement.src = `http://localhost:8080${imageUrl}`;
    } else {
        console.error("Profile image element not found");
    }
}

// Function to check if the image exists (this can be done using fetch or any method)
async function isImageAvailable(url) {
    try {
        const response = await fetch(`http://localhost:8080${url}`, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error("Error checking image availability:", error);
        return false;
    }
}

// Listen for file upload change event to refresh the profile image on upload
document.getElementById('fileUpload').addEventListener('change', function (event) {
    const formData = new FormData();
    const file = event.target.files[0];

    // Append file and employeeId to form data
    formData.append('file', file);
    formData.append('employeeId', localStorage.getItem('employeeId'));

    // Upload the file
    fetch('/uploads/upload', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
        .then(data => {
            if (data.success) {
                // Refresh the profile image after successful upload
                setProfileImage(data.fileUrl);
                alert("Profile image updated successfully!");
            } else {
                alert(data.message || "Error uploading image");
            }
        }).catch(error => {
        console.error("Error uploading image:", error);
        alert("There was an error uploading the image.");
    });
});

function togglePassword(passwordFieldId = 'password', eyeIconId = 'eye-icon') {
    var passwordField = document.getElementById(passwordFieldId);
    var eyeIcon = document.getElementById(eyeIconId);

    if (!passwordField || !eyeIcon) {
        console.error(`Element with ID "${!passwordField ? passwordFieldId : eyeIconId}" not found.`);
        return;
    }

    // Toggle the type of the input field
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
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

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown")) {
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
            menu.classList.remove("show");
        });
    }
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