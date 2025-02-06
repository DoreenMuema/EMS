// Function to get the auth token

function getAuthToken() {
    const token = localStorage.getItem('accessToken');
    console.log('Access token retrieved:', token || 'No token found');
    return token;
}

// Function to get the employee ID
function getEmployeeId() {
    const employeeId = localStorage.getItem('employeeId');
    console.log('Employee ID retrieved:', employeeId || 'No employee ID found');
    return employeeId;
}

document.addEventListener('DOMContentLoaded', () => {
    let notificationCount = 0;
    let notifications = [];

    // Function to update notifications display
    function updateNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        const notificationBell = document.getElementById('notificationBell');

        if (notificationsList) {
            notificationsList.innerHTML = notifications.map(n => `<li>${n.message}</li>`).join('');
        } else {
            console.warn('Notifications list element not found!');
        }

        if (notificationBell) {
            notificationBell.classList.toggle('new-notification', notificationCount > 0);
        } else {
            console.warn('Notification bell element not found!');
        }
    }

    // Function to simulate receiving a new notification
    function receiveNewNotification(message) {
        notifications.push({ message });
        notificationCount++;
        console.log('New notification received:', message); // Log received notification
        updateNotifications();
    }

    // Example notification
    receiveNewNotification('New leave application submitted.');

    const employeeId = getEmployeeId();
    const accessToken = getAuthToken();
    const financeRequestsTable = document.querySelector('#financeRequestsTable tbody');

    // Fetch and display finance requests
    if (financeRequestsTable && employeeId && accessToken) {
        console.log(`Fetching finance requests for employee ID: ${employeeId}`);
        fetch(`/api/finance-requests/${employeeId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch finance requests.');
                return response.json(); // Ensure JSON parsing
            })
            .then(data => {
                console.log('Fetched finance requests:', data); // Log fetched data
                data.forEach(request => {
                    const row = financeRequestsTable.insertRow();
                    row.innerHTML = `
                        <td>${request.id}</td>
                        <td>${request.itemDescription}</td>
                        <td>${request.amount}</td>
                        <td>${request.status}</td>
                        <td>${request.type}</td>
                        <td>${request.description ? request.description : 'No description available'}</td>
                <td>
  ${request.proofFileUrl ?
                        `<a href="/uploads/${localStorage.getItem('employeeId')}-${request.proofFileUrl}" download target="_blank">Download Proof</a>`
                        : 'No proof file'}
</td>


                        <td>${request.claimDate}</td>
                        <td>${request.requisitionDate}</td>
                        <td>${new Date(request.createdDate).toLocaleDateString()}</td>
                    `;
                    console.log(`Request added to table: ID=${request.id}, Description=${request.itemDescription}, Amount=${request.amount}`);
                });
            })
            .catch(error => {
                console.error('Error fetching finance requests:', error);
            });
    } else {
        console.warn('Finance requests table or required data not found!');
    }
// Modal and form handling
    const newClaimRequestButton = document.getElementById('newClaimRequestButton');
    const newRequisitionRequestButton = document.getElementById('newRequisitionRequestButton');
    const claimModal = document.getElementById('claimModal');
    const requisitionModal = document.getElementById('requisitionModal');
    const createClaimForm = document.getElementById('createClaimForm');
    const createRequisitionForm = document.getElementById('createRequisitionForm');

// Cancel buttons
    const cancelClaimRequestBtn = document.getElementById('cancelClaimRequestBtn');
    const cancelRequisitionRequestBtn = document.getElementById('cancelRequisitionRequestBtn');

// Open claim request modal
    if (newClaimRequestButton && claimModal) {
        newClaimRequestButton.addEventListener('click', () => {
            console.log('Opening claim request modal...');
            claimModal.style.display = 'block';
        });
    }

// Open requisition request modal
    if (newRequisitionRequestButton && requisitionModal) {
        newRequisitionRequestButton.addEventListener('click', () => {
            console.log('Opening requisition request modal...');
            requisitionModal.style.display = 'block';
        });
    }

// Close modals when clicking outside
    window.addEventListener('click', event => {
        if (event.target === claimModal) {
            console.log('Closing claim request modal...');
            claimModal.style.display = 'none';
        }
        if (event.target === requisitionModal) {
            console.log('Closing requisition request modal...');
            requisitionModal.style.display = 'none';
        }
    });

// Close claim request modal when "Cancel" is clicked
    if (cancelClaimRequestBtn) {
        cancelClaimRequestBtn.addEventListener('click', () => {
            console.log('Closing claim request modal (cancel button)...');
            claimModal.style.display = 'none';
        });
    }

// Close requisition request modal when "Cancel" is clicked
    if (cancelRequisitionRequestBtn) {
        cancelRequisitionRequestBtn.addEventListener('click', () => {
            console.log('Closing requisition request modal (cancel button)...');
            requisitionModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', event => {
        if (event.target === claimModal) {
            console.log('Closing claim request modal...');
            claimModal.style.display = 'none';
        }
        if (event.target === requisitionModal) {
            console.log('Closing requisition request modal...');
            requisitionModal.style.display = 'none';
        }
    });


// Function to generate the proof file URL
    function getProofFileUrl( fileName) {
        const employeeId= getEmployeeId();
        // Construct and return the URL for the file
        return `http://localhost:8080/uploads/${employeeId}/${fileName}`;
    }

// Handle Claim Form Submission
    if (createClaimForm) {
        createClaimForm.addEventListener('submit', event => {
            event.preventDefault();

            const formData = new FormData(createClaimForm);
            const employeeId = getEmployeeId(); // Get employee ID from local storage
            const requestType = 'CLAIM'; // Explicitly setting for clarity

            if (!employeeId) return; // Exit if employee ID is not available

            // Log form data for debugging
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            // Prepare the file to be uploaded
            const fileInput = document.getElementById('claimFileUpload');
            const file = fileInput.files[0];
            if (file) {
                // Construct the upload path using the employee ID and file name
                const fileName = `${employeeId}-${file.name}`;
                formData.append('proofFile', file, fileName); // Add the file with the custom name

                // Get the proofFile URL and append it to the form data
                const proofFileUrl = getProofFileUrl(employeeId, fileName);
                formData.append('proofFileUrl', proofFileUrl); // Add the proofFileUrl to formData
            } else {
                alert('Please upload a proof file.');
                return;
            }


            // Construct the URL to upload the file (with employee ID in the URL)
// Validate item description
            const itemDescription = formData.get('itemDescription');
            if (!itemDescription) {
                alert('Item Description is required!');
                return;
            }

            // Get the claim date from the input field and validate it
            const claimDate = document.getElementById('claimDate').value;
            if (claimDate) {
                formData.append('claimDate', claimDate); // Add the claim date to the FormData
            } else {
                alert('Claim date is required!');
                return;
            }

            console.log('Submitting claim request...');
            fetch(`/api/finance-requests/${employeeId}`, {
                method: 'POST',
                body: formData,
                headers: { 'Authorization': `Bearer ${accessToken}` },
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to submit claim request.');
                    return response.json();
                })
                .then(data => {
                    console.log('Server response after submitting claim request:', data);
                    alert('Claim request submitted successfully!');
                    claimModal.style.display = 'none';
                    location.reload();  // Refresh page after successful form submission
                })
                .catch(error => {
                    console.error('Error submitting claim request:', error);
                    alert('Failed to submit the request. Please try again.');
                });
        });
    }

  // Handle Requisition Form Submission

    if (createRequisitionForm) {
        createRequisitionForm.addEventListener('submit', event => {
            event.preventDefault();

            const formData = new FormData(createRequisitionForm);
            const employeeId = getEmployeeId();
            const requestType = 'REQUISITION'; // Set the request type explicitly

            if (!employeeId) return; // Exit if employee ID is not available

            // Log form data for debugging
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            // Validate item description
            const itemDescription = formData.get('itemDescription');
            if (!itemDescription) {
                alert('Item Description is required!');
                return;
            }

            // Get the requisition date from the input field and validate it
            const requisitionDate = document.getElementById('requisitionDate').value;
            if (requisitionDate) {
                formData.append('requisitionDate', requisitionDate); // Add the requisition date to the FormData
            } else {
                alert('Requisition date is required!');
                return;
            }

            // Validate requisition description (if needed)
            const requisitionDescription = formData.get('description');
            if (!requisitionDescription) {
                alert('Requisition description is required!');
                return;
            }

            console.log('Submitting requisition request...');
            fetch(`/api/finance-requests/${employeeId}`, {
                method: 'POST',
                body: formData,
                headers: { 'Authorization': `Bearer ${accessToken}` },
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to submit requisition request.');
                    return response.json();
                })
                .then(data => {
                    console.log('Server response after submitting requisition request:', data);
                    alert('Requisition request submitted successfully!');
                    requisitionModal.style.display = 'none'; // Hide modal after successful submission
                    location.reload();  // Refresh page after successful form submission
                })
                .catch(error => {
                    console.error('Error submitting requisition request:', error);
                    alert('Failed to submit the request. Please try again.');
                });
        });
    }

    // Toggle proof upload section based on request type
    const requestTypeSelect = document.getElementById('requestType');
    const proofUploadSection = document.getElementById('proofUploadSection');

    function toggleProofSection() {
        if (requestTypeSelect?.value === 'CLAIM') {
            proofUploadSection?.style.setProperty('display', 'block');
            console.log('Showing proof upload section...');
        } else {
            proofUploadSection?.style.setProperty('display', 'none');
            console.log('Hiding proof upload section...');
        }
    }

    if (requestTypeSelect) {
        toggleProofSection();
        requestTypeSelect.addEventListener('change', toggleProofSection);
    }

    // Logout function
    function logout() {
        console.log('Logging out...');
        localStorage.clear();
        window.location.href = '/';
    }

    const logoutLink = document.querySelector("a[href='#']");
    if (logoutLink) {
        logoutLink.addEventListener('click', logout);
    }

    // Disable future dates for claim requests
    const claimDateInput = document.getElementById('claimDate');
    if (claimDateInput) {
        claimDateInput.setAttribute('max', new Date().toISOString().split('T')[0]);
        console.log('Disabled future dates for claims');
    }

    // Disable past dates for requisition requests
    const requisitionDateInput = document.getElementById('requisitionDate');
    if (requisitionDateInput) {
        requisitionDateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
        console.log('Disabled past dates for requisitions');
    }
});
function logout() {
    // Clear user data from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("employeeId");

    // Redirect to the home page
    window.location.href = "/";
}
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

