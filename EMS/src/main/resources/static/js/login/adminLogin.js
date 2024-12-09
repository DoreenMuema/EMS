document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent form submission
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        console.log('Form submitted. Username:', username); // Log the username

        try {
            // Send login request to the backend API
            const response = await fetch('/api/admin/admin_login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            console.log('Login response:', data); // Log the response from the backend

            if (response.ok) {
                alert('Login successful!');
                console.log('Login successful. Storing data in localStorage.');

                // Store the necessary data in localStorage
                localStorage.setItem('token', data.token); // Store main token
                localStorage.setItem('username', username); // Store username
                localStorage.setItem('role', data.role); // Store role
                localStorage.setItem('employeeId', data.employeeId); // Store employee ID

                console.log('Data stored in localStorage:', {
                    token: data.token,
                    username: username,
                    role: data.role,
                    employeeId: data.employeeId
                });

                // Now, fetch the data from the admin dashboard to check if the role is authorized
                const token = localStorage.getItem('token');

                if (token) {
                    const dashboardResponse = await fetch('/api/admin/dashboard', {
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + token // Send token as Authorization header
                        }
                    });

                    const dashboardData = await dashboardResponse.json(); // Get the dashboard data
                    console.log('Dashboard data:', dashboardData); // Log the dashboard data

                    if (dashboardResponse.ok) {
                        // If the response is OK and the user is authorized, proceed with redirecting
                        const storedRole = localStorage.getItem('role');
                        console.log("stored role", storedRole);
                        if (storedRole === 'ROLE_ADMIN') {
                            setTimeout(() => {
                                window.location.href = '/adminDashboard'; // Redirect to the admin dashboard after 2 seconds
                            }, 4000); // 2000ms = 2 seconds
                        } else {
                            alert('You do not have the necessary permissions to access the admin dashboard.');
                            window.location.href = '/adminLogin'; // Redirect to login page if not authorized
                        }
                    } else {
                        alert('Unauthorized access. Please check your token or permissions.');
                        window.location.href = '/adminLogin'; // Redirect to login page if not authorized
                    }
                } else {
                    alert('No token found. Please log in again.');
                    window.location.href = '/adminLogin'; // Redirect to login page if no token found
                }
            } else {
                alert('Login failed. Please check your credentials.');
                console.error('Login failed:', data.error);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again.');
        }
    });
});
