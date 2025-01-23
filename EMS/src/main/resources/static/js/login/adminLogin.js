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

const form = document.getElementById('adminLoginForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Login form submitted");

    const email = form.elements['email'].value;
    const password = form.elements['password'].value;
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const responseElement = document.getElementById('loginResponse'); // Make sure the element exists in the DOM

    // Clear previous error messages
    emailError.innerHTML = '';
    passwordError.innerHTML = '';
    responseElement.innerHTML = '';

    try {
        console.log("Sending login request with credentials...");
        const response = await fetch('/api/admin/admin_login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log("Login successful:", responseData);
            const { token, email, role } = responseData;

            localStorage.setItem('accessToken', token);
            localStorage.setItem('email', email);
            localStorage.setItem('role', role);

            // Redirect to appropriate dashboard based on role
            if (role === 'ROLE_EMPLOYEE') {
                window.location.href = '/employeeDashboard';
            } else {
                window.location.href = '/adminDashboard';
            }
        } else {
            const error = responseData.error || "Login failed. Please check your credentials.";
            console.error("Login failed:", error);

            // Provide user-friendly messages based on specific error
            if (error.toLowerCase().includes('email')) {
                emailError.innerHTML = 'Oops! We couldn\'t find an account with that email. Please try again.';
            } else if (error.toLowerCase().includes('password')) {
                passwordError.innerHTML = 'Incorrect password. Please try again.';
            } else {
                responseElement.innerHTML = `
                    <div class="alert alert-danger">Login failed. Please check your credentials and try again.</div>
                `;
            }

            // Clear the localStorage to ensure the user is logged out
            localStorage.removeItem('accessToken');
            localStorage.removeItem('email');
            localStorage.removeItem('role');
        }
    } catch (error) {
        console.error("Error during login:", error);
        responseElement.innerHTML = `
            <div class="alert alert-danger">An error occurred. Please try again later.</div>
        `;
    }
});
