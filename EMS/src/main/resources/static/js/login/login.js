document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.getElementById('toggle-password');
    const passwordField = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');

    // Initialize password visibility
    if (passwordField.type === 'password') {
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }

    togglePassword.addEventListener('click', function () {
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

const form = document.getElementById('loginForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Login form submitted");

    const email = form.elements['email'].value.trim();
    const password = form.elements['password'].value.trim();
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const responseElement = document.getElementById('loginResponse');

    // Clear previous error messages
    emailError.innerHTML = '';
    passwordError.innerHTML = '';
    responseElement.innerHTML = '';

    try {
        console.log("Sending login request...");
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log("Login successful:", responseData);

            // Extract values properly
            const { token, role, employeeId } = responseData;

            // Store common values
            localStorage.setItem('accessToken', token);
            localStorage.setItem('email', email);
            localStorage.setItem('role', role);

            // Store employeeId **only if the user is an employee**
            if (role === 'ROLE_EMPLOYEE') {
                localStorage.setItem('employeeId', employeeId);
            } else {
                localStorage.removeItem('employeeId'); // Ensure it's removed for admins
            }

            // Redirect based on role
            if (role === 'ROLE_ADMIN') {
                window.location.href = '/adminDashboard';
            } else if (role === 'ROLE_EMPLOYEE') {
                window.location.href = '/employeeDashboard';
            } else {
                responseElement.innerHTML = `<div class="alert alert-danger">Unauthorized role detected.</div>`;
            }
        } else {
            const error = responseData.error || "Login failed. Please check your credentials.";
            console.error("Login failed:", error);

            // Reset error messages
            let isEmailError = false;
            let isPasswordError = false;

            if (error.toLowerCase().includes('email')) {
                isEmailError = true;
                emailError.innerHTML = 'We couldn’t find an account with that email.';
            }

            if (error.toLowerCase().includes('password')) {
                isPasswordError = true;
                passwordError.innerHTML = 'Incorrect password. Please try again.';
            }

            // Display appropriate error message
            if (isEmailError && isPasswordError) {
                responseElement.innerHTML = `<div class="alert alert-danger">Incorrect email and password.</div>`;
            } else if (isEmailError) {
                responseElement.innerHTML = `<div class="alert alert-danger">Invalid email. Please check your input.</div>`;
            } else if (isPasswordError) {
                responseElement.innerHTML = `<div class="alert alert-danger">Incorrect password.</div>`;
            } else {
                responseElement.innerHTML = `<div class="alert alert-danger">${error}</div>`;
            }

            // Clear local storage on failure
            localStorage.removeItem('accessToken');
            localStorage.removeItem('email');
            localStorage.removeItem('role');
            localStorage.removeItem('employeeId');
        }
    } catch (error) {
        console.error("Error during login:", error);
        responseElement.innerHTML = `<div class="alert alert-danger">An error occurred. Please try again later.</div>`;
    }
});

// Function to fetch employeeId from localStorage
function getEmployeeId() {
    const role = localStorage.getItem('role');
    if (role === 'ROLE_EMPLOYEE') {
        return localStorage.getItem('employeeId');
    }
    return null; // Prevent access for non-employees
}
