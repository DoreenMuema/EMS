// Ensure loading screen is displayed initially
document.getElementById('loading').style.display = 'block';

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('accessToken');
        const employeeId = localStorage.getItem('employeeId');
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');

        if (!token || !employeeId) {
            console.error("Missing token or employee ID. Redirecting to login...");
            window.location.href = '/employeeLogin';
            return;
        }

        // Display user details
        document.getElementById('username').innerText = username || "Unknown User";
        document.getElementById('role').innerText = role || "Unknown Role";

        // Fetch Profile
        const profile = await fetch(`/api/profile/${employeeId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }).then((res) => res.ok ? res.json() : Promise.reject(res));

        document.getElementById('profile-username').innerText = profile.username;
        document.getElementById('profile-role').innerText = profile.role;
        document.getElementById('profile-email').innerText = profile.email;

        // Fetch Tasks
        const tasks = await fetch(`/api/tasks/${employeeId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }).then((res) => res.ok ? res.json() : Promise.reject(res));

        const taskList = document.getElementById('tasks-list');
        tasks.forEach((task) => {
            const li = document.createElement('li');
            li.innerText = task.name;
            taskList.appendChild(li);
        });

        // Fetch Notifications
        const notifications = await fetch(`/api/notifications/${employeeId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }).then((res) => res.ok ? res.json() : Promise.reject(res));

        const notificationList = document.getElementById('notifications-list');
        notifications.forEach((notification) => {
            const li = document.createElement('li');
            li.innerText = notification.message;
            notificationList.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading dashboard:", error);
        window.location.href = '/employee-login.html';
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
});