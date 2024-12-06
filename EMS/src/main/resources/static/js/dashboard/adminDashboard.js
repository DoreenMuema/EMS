document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token'); // Retrieve token from local storage

    if (!token) {
        alert('Unauthorized access. Please log in.');
        window.location.href = 'admin-login.html'; // Redirect to login if no token
        return;
    }

    try {
        const response = await fetch('/api/admin/admin', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Include token in headers
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired. Please log in again.');
                localStorage.removeItem('token'); // Clear invalid token
                window.location.href = 'admin-login.html';
            } else {
                throw new Error('Failed to load dashboard data');
            }
            return;
        }

        const data = await response.json();
        console.log(data);

        // Populate welcome message
        document.getElementById('welcomeMessage').innerText = `Welcome, ${data.user}!`;

        // Populate employees
        const employeeList = document.getElementById('employeeList');
        data.employees.forEach(employee => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.innerText = `${employee.username} (${employee.role})`;
            employeeList.appendChild(li);
        });

        // Populate leave applications
        const leaveApplications = document.getElementById('leaveApplications');
        data.leaveApplications.forEach(leave => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.innerText = `${leave.employee}: ${leave.startDate} to ${leave.endDate} (${leave.status})`;
            leaveApplications.appendChild(li);
        });

        // Populate tasks
        const taskList = document.getElementById('taskList');
        data.tasks.forEach(task => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.innerText = `${task.employee}: ${task.description} (Due: ${task.dueDate})`;
            taskList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('An error occurred while loading the dashboard. Please try again.');
    }
});
