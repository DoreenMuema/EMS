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
                          <td>
                    ${request.proofFileUrl ?
                        `<a href="${request.proofFileUrl}" target="_blank">Download Proof</a>` :
                        'No proof file'}
                </td>
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
    const newRequestButton = document.getElementById('newRequestButton');
    const requestModal = document.getElementById('requestModal');
    const createRequestForm = document.getElementById('createRequestForm');

    if (newRequestButton && requestModal) {
        newRequestButton.addEventListener('click', () => {
            console.log('Opening new request modal...');
            requestModal.style.display = 'block';
        });

        window.addEventListener('click', event => {
            if (event.target === requestModal) {
                console.log('Closing new request modal...');
                requestModal.style.display = 'none';
            }
        });
    }

    if (createRequestForm) {
        createRequestForm.addEventListener('submit', event => {
            event.preventDefault();

            const formData = new FormData(createRequestForm);
            const requestType = formData.get('requestType');
            // Log form data for debugging
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }


            // Validate proof file for CLAIM request type
            if (requestType === 'CLAIM' && !formData.get('proofFile')) {
                alert('Please upload proof for claim requests.');
                return;
            }
            // Add missing data for 'itemDescription', 'amount', etc., if necessary
            const itemDescription = formData.get('itemDescription'); // Make sure this field exists in the form
            if (!itemDescription) {
                alert('Item Description is required!');
                return;
            }

            console.log('Submitting finance request...');
            fetch(`/api/finance-requests/${employeeId}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to submit request.');
                    return response.json(); // Use JSON for better handling
                })
                .then(data => {
                    console.log('Server response after submitting request:', data);
                    alert('Request submitted successfully!');
                    requestModal.style.display = 'none';
                })
                .catch(error => {
                    console.error('Error submitting request:', error);
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
});
