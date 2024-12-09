const form = document.getElementById('employeeLoginForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Login form submitted");

    // Get form input values
    const username = form.elements['username'].value;
    const password = form.elements['password'].value;

    try {
        console.log("Sending login request with credentials...");
        const response = await fetch('/api/employee_login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Login successful:", data);

            // Store login details in localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('employeeId', data.employeeId);
            localStorage.setItem('username', data.username);
            localStorage.setItem('role', data.role);

            // Display loading screen while redirecting
            document.getElementById('loading').style.display = 'block';
            setTimeout(() => {
                window.location.href = '/employeeDashboard';
            }, 2000);
        } else {
            const error = await response.json();
            console.error("Login failed:", error);
            document.getElementById('response').innerHTML = `
                <div class="alert alert-danger">${error.error || "Login failed. Please check your credentials."}</div>
            `;
        }
    } catch (error) {
        console.error("Error during login:", error);
        document.getElementById('response').innerHTML = `
            <div class="alert alert-danger">An error occurred. Please try again later.</div>
        `;
    }
});