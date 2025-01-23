document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('toggle-password');
    const passwordField = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');

    // Initially, the password should be hidden, so the icon should be "eye"
    if (passwordField.type === 'password') {
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }

    togglePassword.addEventListener('click', function () {
        // Toggle password visibility
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        }
    });
});

const form = document.getElementById('employeeLoginForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Login form submitted");

    const email = form.elements['email'].value;
    const password = form.elements['password'].value;
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const responseElement = document.getElementById('response'); // Ensure response element exists

    // Clear previous error messages
    emailError.innerHTML = '';
    passwordError.innerHTML = '';
    responseElement.innerHTML = '';

    try {
        console.log("Sending login request with credentials...");
        const response = await fetch('/api/employee_login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log("Login successful:", responseData);
            const { accessToken, employeeId } = responseData;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('employeeId', employeeId);

            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
            const role = tokenPayload.role;

            if (role === 'ROLE_EMPLOYEE') {
                const profileResponse = await fetch(`/api/profile/${employeeId}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });

                if (profileResponse.ok) {
                    window.location.href = '/employeeDashboard';
                } else {
                    responseElement.innerHTML = `
                        <div class="alert alert-danger">Failed to fetch profile data.</div>
                    `;
                }
            } else {
                responseElement.innerHTML = `
                    <div class="alert alert-danger">Unauthorized role. Access denied.</div>
                `;
            }
        } else {
            const error = responseData.error || "Login failed. Please check your credentials.";
            console.error("Login failed:", error);

            // Show specific error messages
            if (error.includes("Email is incorrect")) {
                emailError.innerHTML = "The email entered is incorrect. Please check and try again.";
            } else if (error.includes("Password is incorrect")) {
                passwordError.innerHTML = "The password entered is incorrect. Please check and try again.";
            } else {
                responseElement.innerHTML = `
                    <div class="alert alert-danger">${error}</div>
                `;
            }
        }
    } catch (error) {
        console.error("Error during login:", error);
        responseElement.innerHTML = `
            <div class="alert alert-danger">An error occurred. Please try again later.</div>
        `;
    }
});

// Password visibility toggle
document.getElementById('toggle-password').addEventListener('click', function () {
    const passwordField = document.getElementById('password');
    const eyeIcon = this.querySelector('i');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';  // Show password
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');  // Change to 'eye-slash' icon
    } else {
        passwordField.type = 'password';  // Hide password
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');  // Change back to 'eye' icon
    }
});
