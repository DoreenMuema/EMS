// Function to get the auth token
function getAuthToken() {
    return localStorage.getItem('accessToken');
}

// Function to get the employee ID from local storage
function getEmployeeId() {
    return localStorage.getItem('employeeId'); // Retrieve 'employeeId' from local storage
}

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
            document.getElementById('lastLogin').textContent = data.lastLogin || 'N/A';
            document.getElementById('passwordExpiry').textContent = data.passwordExpiry || 'N/A';
            document.getElementById('idNumber').textContent = data.idNumber || 'N/A';
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
            document.getElementById('dobModal').value = data.dob || '';
            document.getElementById('ageModal').value = '';
            document.getElementById('genderModal').value = data.gender || '';
            document.getElementById('departmentModal').value = data.department || '';
            document.getElementById('employmentTypeModal').value = data.employmentType || '';
            document.getElementById('employmentDateModal').value = data.employmentDate || '';
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



    // Add event listener only if the form exists
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const updatedData = {
                firstName: document.getElementById('firstName').value,
                surname: document.getElementById('surname').value,
                otherName: document.getElementById('otherName').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                dob: document.getElementById('dobModal').value,
                gender: document.getElementById('genderModal').value,
                age: document.getElementById('ageModal').value,
                department: document.getElementById('departmentModal').value,
                employmentType: document.getElementById('employmentTypeModal').value,
                employmentDate: document.getElementById('employmentDateModal').value
            };

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
        const cancelButton = document.getElementById('cancelButton');
        if (cancelButton) {
            cancelButton.addEventListener('click', function () {
                editProfileForm.reset(); // Reset form fields
                closeModal(); // Close the modal
            });
        }
    }

    // Manage button action
    const manageButton = document.getElementById("viewTasksBtn");
    if (manageButton) {
        console.log("Manage button found");
        manageButton.addEventListener("click", () => {
            console.log("Button clicked");
            window.location.href = "/employeeTasks";
        });
    } else {
        console.error("Manage button not found.");
    }

    // Request button action
    const requestLeaveBtn = document.getElementById("requestLeaveBtn");
    if (requestLeaveBtn) {
        console.log("Request button found");
        requestLeaveBtn.addEventListener("click", () => {
            console.log("Button clicked");
            window.location.href = "/employeeLeaveApplication";
        });
    } else {
        console.error("Request Leave button not found.");
    }
    // finance button action
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

// Get the modal, form, and submit button for leave request
const modal = document.getElementById("leaveModal");
const form = document.getElementById("leaveForm");
const newRequestBtn = document.getElementById("newRequestBtn");
const closeButton = document.getElementById("closeModalBtn");

// Debugging: Check if elements are fetched correctly
console.log(modal, form, newRequestBtn, closeButton);

if (newRequestBtn) {
    newRequestBtn.addEventListener("click", () => {
        console.log("New request button clicked"); // Debugging
        modal.style.display = "block";  // Make sure modal shows up
    });
}

if (closeButton) {
    closeButton.addEventListener("click", () => {
        console.log("Close button clicked"); // Debugging
        modal.style.display = "none";  // Close the modal
    });
}

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

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('leaveModal');
    const leaveForm = document.getElementById('leaveForm');
    const closeModalButton = document.querySelector('.modal .close');
    const cancelButton = document.querySelector('#leaveForm button[type="cancel"]');

    // Open modal (Add trigger if needed)
    // Example: document.getElementById('openModalButton').addEventListener('click', () => {
    //     modal.style.display = 'block';
    // });

    // Close modal
    const closeModal = () => {
        modal.style.display = 'none';
    };

    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });

    // Form submit event
    leaveForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Gather form data
        const leaveType = document.getElementById('leaveType').value;
        const days = document.getElementById('days').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const description = document.getElementById('description').value;

        const leaveData = {
            leaveType,
            daysRequested: parseInt(days, 10),
            startDate,
            endDate,
            description
        };

        console.log("Leave data:", leaveData);

        const employeeId = getEmployeeId();
        const accessToken = getAuthToken();
        // Fetch request
        fetch(`/api/apply-leave/${employeeId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(leaveData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                alert('Leave request submitted successfully!');
                closeModal();
                location.reload(); // Reload page to refresh data
            })
            .catch(error => {
                console.error('Error submitting leave request:', error);
                alert('An error occurred while submitting your leave request.');
            });
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
