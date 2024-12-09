package com.muema.EMS.controllers;

import com.muema.EMS.model.Employee;
import com.muema.EMS.model.LeaveApplication;
import com.muema.EMS.model.Notification;
import com.muema.EMS.model.Task;
import com.muema.EMS.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController  // Changed from @Controller to @RestController
@RequestMapping("/api")
public class EmployeeController {

    private final JwtUtils jwtUtils;
    private final EmployeeService employeeService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final LeaveService leaveService;
    private final NotificationService notificationService;
    private final TaskService taskService;

    @Autowired
    public EmployeeController(JwtUtils jwtUtils,
                              EmployeeService employeeService,
                              AuthenticationManager authenticationManager,
                              PasswordEncoder passwordEncoder,
                              LeaveService leaveService,
                              NotificationService notificationService, TaskService taskService) {
        this.jwtUtils = jwtUtils;
        this.employeeService = employeeService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.leaveService = leaveService;
        this.notificationService = notificationService;
        this.taskService = taskService;
    }

    @PostMapping("/employee_login")
    public ResponseEntity<Map<String, Object>> loginEmployee(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            Optional<Employee> optionalEmployee = employeeService.findByUsername(username);
            if (optionalEmployee.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
            }

            Employee employee = optionalEmployee.get();
            String accessToken = jwtUtils.generateToken(employee.getUsername(), employee.getRole());
            Map<String, Object> response = new HashMap<>();
            response.put("employeeId", employee.getId());
            response.put("accessToken", accessToken);
            response.put("username", employee.getUsername());
            response.put("role", employee.getRole());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Authentication failed: " + e.getMessage()));
        }
    }


    @PutMapping("/change-password/{employeeId}")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> passwordData,
                                                              @PathVariable Long employeeId,
                                                              Principal principal) {
        String newPassword = passwordData.get("newPassword");

        // Check if new password is provided
        if (newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password cannot be null or empty"));
        }

        try {
            // Find the employee from the database by their username (using the Principal)
            String username = principal.getName();
            Optional<Employee> optionalEmployee = employeeService.findByUsername(username);

            if (optionalEmployee.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Employee not found"));
            }

            // Call the service method to change the password
            employeeService.changePassword(employeeId, newPassword);

            return ResponseEntity.ok(Map.of("success", true, "message", "Password changed successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error changing password: " + e.getMessage()));
        }
    }

    @GetMapping("/profile/{employeeId}")
    public ResponseEntity<Map<String, Object>> viewProfile(Principal principal) {
        try {
            String username = principal.getName();
            Optional<Employee> optionalEmployee = employeeService.findByUsername(username);

            if (optionalEmployee.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Employee not found"));
            }

            Employee employee = optionalEmployee.get();
            Map<String, Object> response = new HashMap<>();
            response.put("username", employee.getUsername());
            response.put("role", employee.getRole());
            response.put("email", employee.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error retrieving profile: " + e.getMessage()));
        }
    }

    @PostMapping("/apply-leave/{employeeId}")
    public ResponseEntity<Map<String, Object>> applyForLeave(@PathVariable Long employeeId,
                                                             @RequestBody LeaveApplication leaveApplication) {
        try {
            // Process leave application
            LeaveApplication application = leaveService.applyForLeave(employeeId, leaveApplication);

            // Send notification upon successful leave application
            notificationService.sendNotification(employeeId, "Your leave application has been submitted.");

            // Response map with application details
            Map<String, Object> response = Map.of(
                    "id", application.getId(),
                    "status", application.getStatus(),
                    "employee", application.getEmployee().getUsername(),
                    "message", "Leave application submitted successfully."
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            // Employee not found or invalid input
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Internal server errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred: " + e.getMessage()));
        }
    }


    @GetMapping("/notifications/{employeeId}")
    public ResponseEntity<List<Notification>> getEmployeeNotifications(@PathVariable Long employeeId) {
        try {
            List<Notification> notifications = notificationService.getNotificationsForEmployee(employeeId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/tasks/{employeeId}")
    public ResponseEntity<List<Task>> getEmployeeTasks(@PathVariable Long employeeId) {
        try {
            List<Task> tasks = taskService.getTasksByEmployeeId(employeeId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}
