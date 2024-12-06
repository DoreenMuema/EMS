package com.muema.EMS.services;

import com.muema.EMS.model.Employee;
import com.muema.EMS.model.LeaveApplication;
import com.muema.EMS.model.Task;
import com.muema.EMS.repo.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private NotificationService notificationService;

    public Task assignTask(Long employeeId, Task task) {
        // Validate and fetch the employee
        Employee employee = employeeService.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        // Associate task with the employee
        task.setEmployee(employee);
        task.setStatus("PENDING");

        // Save task and send notification
        Task savedTask = taskRepository.save(task);
        notificationService.sendNotification(employeeId, "A new task has been assigned: " + task.getDescription());

        return savedTask;
    }

    public List<Task> getTasksByEmployeeId(Long employeeId) {
        return taskRepository.findByEmployeeId(employeeId);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }
}