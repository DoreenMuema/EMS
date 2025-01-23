package com.muema.EMS.services;

import com.muema.EMS.model.Employee;
import com.muema.EMS.model.LeaveApplication;
import com.muema.EMS.model.Task;
import com.muema.EMS.repo.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    public Task assignTask(Long employeeId, Task taskRequest) {
        // Validate and fetch the employee
        Employee employee = employeeService.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        // Validate the task title from the request body
        String taskTitle = taskRequest.getTitle();
        if (taskTitle == null || taskTitle.isBlank()) {
            throw new IllegalArgumentException("Task title must be provided");
        }

        // Create a new Task object and populate its fields
        Task task = new Task();
        task.setTitle(taskTitle);
        task.setDescription(taskRequest.getDescription());
        task.setDueDate(taskRequest.getDueDate());
        task.setEmployee(employee);
        task.setStatus("PENDING");

        // Save the task and send notification
        Task savedTask = taskRepository.save(task);
        notificationService.sendNotification(
                employeeId,
                "A new task has been assigned: " + task.getTitle() + " - " + task.getDescription()
        );

        return savedTask;
    }


    public List<Task> getTasksByEmployeeId(Long employeeId) {
        return taskRepository.findByEmployeeId(employeeId);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Optional<Task> findTaskById(Long taskId) {
        return taskRepository.findById(taskId);
    }


    public Task markTaskAsCompleted(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task with ID " + taskId + " not found."));

        if ("COMPLETED".equals(task.getStatus())) {
            throw new IllegalStateException("Task is already marked as completed.");
        }

        task.setStatus("COMPLETED");
        return taskRepository.save(task);
    }
    public Task requestTaskExtension(Long taskId, String extensionReason) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task with ID " + taskId + " not found."));

        if (!"PENDING".equals(task.getStatus())) {
            throw new IllegalStateException("Extensions can only be requested for tasks with 'PENDING' status.");
        }

        task.setStatus("EXTENSION_REQUESTED");
        task.setExtensionReason(extensionReason);
        task.setExtensionRequestedDate(LocalDateTime.now());
        return taskRepository.save(task);
    }



    public Task approveExtension(Long taskId, Boolean approve) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        // Approve or reject the extension
        task.setExtensionApproved(approve);
        task.setStatus(approve ? "APPROVED" : "REJECTED");

        // Save the updated task
        return taskRepository.save(task);
    }
}
