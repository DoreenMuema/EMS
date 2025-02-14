const API_BASE_URL = "/api/admin"; // Replace with actual API URL

function getAuthToken() {
    return localStorage.getItem('accessToken');
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section") || "claims"; // Default to 'claims'
    showSection(section);
});

function showSection(section) {
    document.querySelectorAll('.finance-section').forEach(sec => sec.style.display = 'none');
    document.getElementById(`${section}Section`).style.display = 'block';

    if (section === 'claims') fetchClaims();
    else if (section === 'requisitions') fetchRequisitions();

}

async function fetchData(endpoint, callback) {
    try {
        const token = getAuthToken();
        if (!token) throw new Error("No auth token found");

        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        callback(data);
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        alert(`Error fetching ${endpoint}. Check console for details.`);
    }
}

function fetchClaims() { fetchData("requests/type/CLAIM", populateClaimsTable); }
function fetchRequisitions() { fetchData("requests/type/REQUISITION", populateRequisitionsTable); }


function populateTable(data, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    tableBody.innerHTML = data.length ? data.map(rowTemplate).join('') : "<tr><td colspan='7'>No data found.</td></tr>";
}

function rowTemplate(request) {
    const isClaim = request.type === "CLAIM"; // Check if it's a claim request

    return `
        <tr>
            <td>${request.id}</td>
            <td>${request.employee?.name || 'N/A'}</td>
            <td>${request.itemDescription}</td>
            <td>${request.amount}</td>
            <td>${request.status}</td>

            ${isClaim ? `
            <td>
                <button onclick="downloadProof(${request.id})" class="download-btn">Download Proof</button>
            </td>` : `<td>${request.description || 'N/A'}</td>`}

            <td>
                <button onclick="handleRequest(${request.id}, 'approve')" class="approve-btn">Approve</button>
                <button onclick="handleRequest(${request.id}, 'reject')" class="reject-btn">Reject</button>
            </td>
        </tr>`;
}
// Function to fetch approved/rejected claims and requisitions
async function fetchHistoryData() {
    try {
        const token = getAuthToken();
        if (!token) throw new Error("No auth token found");

        const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

        // Fetch all history data concurrently
        const endpoints = [
            { url: "finance-requests/status/APPROVED", key: "approvedClaims" },
            { url: "finance-requests/status/REJECTED", key: "rejectedClaims" },
            { url: "finance-requests/status/APPROVED", key: "approvedRequisitions" },
            { url: "finance-requests/status/REJECTED", key: "rejectedRequisitions" },
        ];

        // Create an array of fetch promises
        const fetchPromises = endpoints.map(endpoint =>
            fetch(`${API_BASE_URL}/${endpoint.url}`, { method: "GET", headers })
                .then(response => {
                    if (!response.ok) throw new Error(`Error fetching ${endpoint.url} - Status: ${response.status}`);
                    return response.json();
                })
                .catch(error => {
                    console.error(`Failed to fetch ${endpoint.url}:`, error);
                    return []; // Return empty array on failure
                })
        );

        // Wait for all requests to complete
        const [approvedClaims, rejectedClaims, approvedRequisitions, rejectedRequisitions] = await Promise.all(fetchPromises);

        // Merge approved and rejected results
        const claimsHistory = [...approvedClaims, ...rejectedClaims];
        const requisitionsHistory = [...approvedRequisitions, ...rejectedRequisitions];

        // Populate tables
        populateHistoryTable("claimsHistoryTableBody", claimsHistory, true);
        populateHistoryTable("requisitionsHistoryTableBody", requisitionsHistory, false);

    } catch (error) {
        console.error("Error fetching history data:", error);
        alert("Failed to load history data. Please try again.");
    }
}


// Function to include authorization headers in API requests
function getAuthHeaders() {
    return {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("accessToken"), // Ensure token is valid
            "Content-Type": "application/json"
        }
    };
}

// Function to populate history tables
function populateHistoryTable(tableId, requests, isClaim) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = ""; // Clear existing data

    requests.forEach(request => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${request.id}</td>
            <td>${request.employee?.name || "N/A"}</td>
            <td>${request.itemDescription}</td>
            <td>${request.amount}</td>
            <td>${request.status}</td>
            ${isClaim
            ? `<td><button onclick="downloadProof(${request.id})" class="download-btn">Download Proof</button></td>`
            : `<td>${request.description || "N/A"}</td>`}
            <td>
                <button onclick="viewDetails(${request.id})" class="details-btn">View Details</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Fetch and populate data when the page loads
document.addEventListener("DOMContentLoaded", fetchHistoryData);
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



function populateClaimsTable(data) { populateTable(data, "claimTableBody"); }
function populateRequisitionsTable(data) { populateTable(data, "requisitionTableBody"); }

async function handleRequest(id, action) {
    const confirmAction = confirm(`Are you sure you want to ${action} request ID ${id}?`);
    if (!confirmAction) return;

    try {
        const token = getAuthToken();
        if (!token) throw new Error("No auth token found");

        const response = await fetch(`${API_BASE_URL}/requests/${id}/${action}`, {
            method: "PATCH",  // Change from POST to PATCH
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        alert(`Request ${id} successfully ${action}d!`);

        // Refresh the page to update the table
        location.reload();
    } catch (error) {
        console.error(`Error ${action}ing request ${id}:`, error);
        alert(`Failed to ${action} request ID ${id}. Check console for details.`);
    }
}

// Attach the logout function to the logout link
document.addEventListener("DOMContentLoaded", () => {
    const logoutLink = document.querySelector("a[href='#']");
    if (logoutLink) {
        logoutLink.addEventListener("click", logout);
    }
});



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