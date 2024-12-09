// After page loads, fetch the dashboard data
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        loadDashboardData(token);
    } else {
        alert('You need to log in to access the dashboard.');
        window.location.href = '/login.html';  // Redirect to login page
    }
});

async function loadDashboardData(token) {
    try {
        console.log('Fetching dashboard data...');
        const response = await fetch('/api/admin/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,  // Pass token in Authorization header
            },
        });

        const dashboardData = await response.json();
        console.log('Dashboard Data:', dashboardData);

        if (!response.ok) {
            throw new Error('Failed to load dashboard data.');
        }

        // Populate the dashboard with JSON data
        populateDashboard(dashboardData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        alert('Failed to load the dashboard data.');
    }
}

function populateDashboard(dashboardData) {
    const dashboardContainer = document.getElementById('dashboard');
    if (!dashboardContainer) {
        console.error('Dashboard container not found.');
        return;
    }

    // Clear existing content
    dashboardContainer.innerHTML = '';

    // Populate message
    const header = document.createElement('h1');
    header.textContent = dashboardData.message;
    dashboardContainer.appendChild(header);

    // User info
    const userInfo = document.createElement('p');
    userInfo.innerHTML = `<strong>User:</strong> ${dashboardData.user}`;
    dashboardContainer.appendChild(userInfo);

    // Tasks
    const tasksHeader = document.createElement('h3');
    tasksHeader.textContent = 'Tasks:';
    dashboardContainer.appendChild(tasksHeader);

    const tasksList = document.createElement('ul');
    dashboardData.tasks.forEach((task) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>Description:</strong> ${task.description} <br>
            <strong>Status:</strong> ${task.status} <br>
            <strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleString()} <br>
            <strong>Employee:</strong> ${task.employee}
        `;
        tasksList.appendChild(listItem);
    });
    dashboardContainer.appendChild(tasksList);

    // Notifications
    const notificationsHeader = document.createElement('h3');
    notificationsHeader.textContent = 'Notifications:';
    dashboardContainer.appendChild(notificationsHeader);

    const notificationsList = document.createElement('ul');
    dashboardData.notifications.forEach((notification) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${new Date(notification.date).toLocaleString()}: ${notification.message}`;
        notificationsList.appendChild(listItem);
    });
    dashboardContainer.appendChild(notificationsList);

    console.log('Dashboard content populated.');
}
