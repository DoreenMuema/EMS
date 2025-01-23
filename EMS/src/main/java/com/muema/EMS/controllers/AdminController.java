package com.muema.EMS.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.muema.EMS.model.*;
import com.muema.EMS.repo.EmployeeRepository;
import com.muema.EMS.repo.LeaveRepository;
import com.muema.EMS.repo.TaskRepository;
import com.muema.EMS.services.*;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.GrantedAuthority;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/")
public class AdminController {

    private final Logger logger = LoggerFactory.getLogger(AdminController.class);
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final LeaveService leaveService;
    private final TaskService taskService;
    private final NotificationService notificationService;
    private final EmployeeService employeeService;
    private final FinanceRequestService financeRequestService;
    private final EmployeeRepository employeeRepository;


    @Autowired
    public AdminController(JwtUtils jwtUtils,
                           EmployeeService employeeService,
                           AuthenticationManager authenticationManager,
                           PasswordEncoder passwordEncoder,
                           LeaveService leaveService,
                           TaskService taskService,
                           EmployeeRepository employeeRepository,
                           TaskRepository taskRepository,
                           LeaveRepository leaveRepository,
                           NotificationService notificationService,
                           FinanceRequestService financeRequestService,
                           EmployeeRepository employeeRepository1) {
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.leaveService = leaveService;
        this.taskService = taskService;
        this.notificationService = notificationService;
        this.employeeService = employeeService;
        this.financeRequestService = financeRequestService;
        this.employeeRepository = employeeRepository1;
    }
    @PostMapping("/admin_login")
    public ResponseEntity<Map<String, Object>> adminLogin(@RequestBody Map<String, String> loginRequest,
                                                          HttpServletResponse response) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        try {
            Optional<Employee> employee = employeeService.findByEmail(email);
            if (employee.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Email is incorrect"));
            }

            if (!passwordEncoder.matches(password, employee.get().getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Password is incorrect"));
            }

            // Authenticate the user with email and password
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            // Set the authentication context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token with email and role
            String jwtToken = jwtUtils.generateToken(authentication.getName(), authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority).findFirst().orElse("ROLE_USER"));

            response.setHeader("Authorization", "Bearer " + jwtToken);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("token", jwtToken);
            responseBody.put("message", "Login successful");
            responseBody.put("email", email);
            responseBody.put("role", authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority).findFirst().orElse("ROLE_USER"));

            return ResponseEntity.ok(responseBody);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }
    }



    @GetMapping("/dashboard")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Map<String, Object>> adminDashboard(HttpServletRequest request, HttpServletResponse response) {
        // Retrieve the token from the request header
        String token = request.getHeader("Authorization");

        // Log the token for debugging purposes
        logger.info("Received Token: " + token);

        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Token is missing"));
        }

        // Remove the "Bearer " prefix if it's present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);  // Remove the "Bearer " part
        }

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token format"));
        }

        // Validate the token (use your JwtUtils class for validation and claims extraction)
        JwtUtils jwtUtils = new JwtUtils();
        Claims claims = jwtUtils.extractAllClaims(token); // Extract all claims from the token

        // Extract email from the claims (assuming 'email' is a claim in the token)
        String email = jwtUtils.extractEmail(token); // Assuming this method extracts email from the token

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token claims"));
        }

        // Log the access with email
        logger.info("Admin Dashboard accessed by: " + email);

        // Set the token in the response header (optional)
        response.setHeader("Authorization", "Bearer " + token);

        // Get actual data from the services
        List<Employee> employees = employeeService.getAllEmployee();
        List<LeaveApplication> leaveApplications = leaveService.getAllLeaves();
        List<Task> tasks = taskService.getAllTasks();
        List<Notification> notifications = notificationService.getAllNotifications();

        // Prepare the response body
        Map<String, Object> responseBody = new HashMap<>();

        // Map employees data
        responseBody.put("employees", employees.stream()
                .map(employee -> Map.of("id", employee.getId(), "email", employee.getEmail(), "role", employee.getRole()))
                .collect(Collectors.toList()));

        // Map leave applications data
        responseBody.put("leaveApplications", leaveApplications.stream()
                .map(leave -> Map.of("id", leave.getId(), "employee", leave.getEmployee().getEmail(), "startDate", leave.getStartDate(), "endDate", leave.getEndDate(), "status", leave.getStatus()))
                .collect(Collectors.toList()));

        // Map tasks data
        responseBody.put("tasks", tasks.stream()
                .map(task -> Map.of("id", task.getId(), "employee", task.getEmployee().getEmail(), "description", task.getDescription(), "dueDate", task.getDueDate(), "status", task.getStatus()))
                .collect(Collectors.toList()));

        // Map notifications data
        responseBody.put("notifications", notifications.stream()
                .map(notification -> Map.of("id", notification.getId(), "message", notification.getMessage(), "date", notification.getTimestamp()))
                .collect(Collectors.toList()));

        // Add additional info to the response
        responseBody.put("email", email);    // Email
        responseBody.put("role", "ROLE_ADMIN");
        responseBody.put("message", "Welcome to the admin dashboard");

        return ResponseEntity.ok(responseBody);
    }


    @PostMapping("/employee/new")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Map<String, Object>> createEmployee(@RequestBody Employee employee) {
        try {
            // Validate password strength
            if (!employeeService.isPasswordValid(employee.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password does not meet the required strength"));
            }

            // Hash the password before saving the employee
            String encodedPassword = passwordEncoder.encode(employee.getPassword());
            employee.setPassword(encodedPassword);  // Set the hashed password

            // Save the employee with the hashed password
            employeeService.save(employee);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Employee created successfully");
            response.put("email", employee.getEmail());
            response.put("firstName", employee.getFirstName());
            response.put("surname", employee.getSurname());
            response.put("otherName", employee.getOtherName());
            response.put("phone", employee.getPhone());
            response.put("lastLogin", employee.getLastLogin());
            response.put("passwordExpiry", employee.getPasswordExpiry());
            response.put("employmentDate", employee.getEmploymentDate());
            response.put("dob", employee.getDob());
            response.put("gender", employee.getGender());
            response.put("department", employee.getDepartment());
            response.put("designation", employee.getDesignation());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error creating employee: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error creating employee: " + e.getMessage()
                    ));
        }
    }


    @GetMapping("/employee/{id}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Employee> getEmployeeByEmail(@PathVariable Long id) {
        Optional<Employee> employee = employeeService.findById(id);
        return employee.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all_employees")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        try {
            List<Employee> employees = employeeService.getAllEmployee();
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            logger.error("Error fetching employees: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/update/{id}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee updatedEmployee) {
        Optional<Employee> existingEmployeeOptional = employeeService.findById(id);

        if (existingEmployeeOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Employee employee = existingEmployeeOptional.get();

        if (updatedEmployee.getUsername() != null) {
            employee.setUsername(updatedEmployee.getUsername());
        }

        if (updatedEmployee.getEmail() != null) {
            employee.setEmail(updatedEmployee.getEmail());
        }

        if (updatedEmployee.getPassword() != null && !updatedEmployee.getPassword().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(updatedEmployee.getPassword());
            employee.setPassword(hashedPassword);
        }

        if (updatedEmployee.getDesignation() != null) {
            employee.setDesignation(updatedEmployee.getDesignation());
        }

        employeeService.save(employee);

        return ResponseEntity.ok(employee);
    }


    // DELETE: Delete an employee by id
    @DeleteMapping("/delete/{id}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        Optional<Employee> employee = employeeService.findById(id); // Use id for lookup

        if (employee.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // Return 404 if not found
        }

        employeeService.deleteById(id); // Delete the employee by ID
        return ResponseEntity.noContent().build(); // Return 204 No Content on success
    }


    @PutMapping("/deactivate/{id}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Employee> deactivateEmployee(@PathVariable Long id) {
        Optional<Employee> employeeOpt = employeeService.findById(id); // Find employee by ID
        if (employeeOpt.isEmpty()) {
            return ResponseEntity.notFound().build(); // Return 404 if not found
        }

        Employee employee = employeeOpt.get();
        employee.setIsActive(false); // Mark the employee as inactive
        employeeService.save(employee); // Save changes to the database

        return ResponseEntity.ok(employee); // Return the updated employee
    }


    @GetMapping("/leaves")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<List<Map<String, Object>>> getAllLeaves() throws JsonProcessingException {
        List<LeaveApplication> allLeaves = leaveService.getAllLeaves();

        // Example business rule: If the leave's end date has passed and it's still pending, mark it as "REJECTED"
        for (LeaveApplication leave : allLeaves) {
            if (leave.getStatus().equals("PENDING") && leave.getEndDate().isBefore(LocalDate.now())) {
                leave.setStatus("REJECTED");
            }
            leaveService.save(leave);
        }

        // Create a list of maps for custom JSON response
        List<Map<String, Object>> leavesResponse = new ArrayList<>();
        for (LeaveApplication leave : allLeaves) {
            Map<String, Object> leaveData = new HashMap<>();
            leaveData.put("id", leave.getId());
            leaveData.put("employeeFirstName", leave.getFirstName());
            leaveData.put("employeeSurname", leave.getSurname());
            leaveData.put("startDate", leave.getStartDate());
            leaveData.put("endDate", leave.getEndDate());
            leaveData.put("reason", leave.getReason());
            leaveData.put("status", leave.getStatus());
            leaveData.put("description", leave.getDescription());
            leaveData.put("leaveType", leave.getLeaveType());


            leavesResponse.add(leaveData);
        }

        // Return a custom JSON response
        return ResponseEntity.ok(leavesResponse);
    }

    @PostMapping("/approve-leave/{applicationId}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Map<String, Object>> approveLeaveApplication(@PathVariable Long applicationId) {
        Map<String, Object> response = new HashMap<>();

        try {
            LeaveApplication leaveApplication = leaveService.findById(applicationId)
                    .orElseThrow(() -> new IllegalArgumentException("Leave application not found"));

            // Proceed with approval logic
            LeaveApplication approvedLeaveApplication = leaveService.approveLeaveApplication(applicationId);

            // Notify the employee about the approval
            Notification approvalNotification = new Notification();
            approvalNotification.setType(Notification.NotificationType.LEAVE_REQUEST); // Use uppercase
            approvalNotification.setMessage("Your leave application has been approved.");
            approvalNotification.setRecipientId(leaveApplication.getEmployee().getId());
            notificationService.sendNotification(approvalNotification);

            // Optionally notify about insufficient balance (if you want to keep this logic)
            // You can log this situation or notify the employee if needed
            // For example:
            // logger.warn("Leave application approved for employee ID {} without checking balance.", leaveApplication.getEmployee().getId());

            response.put("message", "Leave application approved successfully.");
            response.put("leaveApplication", approvedLeaveApplication);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put("message", "An error occurred while processing the leave application: " + e.getMessage());
            logger.error("Error processing leave application", e);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // Reject leave application
    @PostMapping("/reject-leave/{applicationId}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Map<String, Object>> rejectLeaveApplication(@PathVariable Long applicationId) {
        Map<String, Object> response = new HashMap<>();

        try {
            LeaveApplication leaveApplication = leaveService.findById(applicationId)
                    .orElseThrow(() -> new IllegalArgumentException("Leave application not found"));

            LeaveApplication rejectedLeaveApplication = leaveService.rejectLeaveApplication(applicationId);

            // Send WebSocket notification
            Notification notification = new Notification();
            notification.setType(Notification.NotificationType.valueOf("leave"));
            notification.setMessage("Your leave application has been rejected.");
            notification.setRecipientId(leaveApplication.getEmployee().getId());
            notificationService.sendNotification(notification);

            response.put("message", "Leave application rejected successfully.");
            response.put("leaveApplication", rejectedLeaveApplication);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("message", "An error occurred while processing the leave application.");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Recall leave application
    @PostMapping("/recall-leave/{applicationId}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Map<String, Object>> recallLeaveApplication(@PathVariable Long applicationId) {
        Map<String, Object> response = new HashMap<>();

        try {
            LeaveApplication leaveApplication = leaveService.findById(applicationId)
                    .orElseThrow(() -> new IllegalArgumentException("Leave application not found"));

            if ("APPROVED".equals(leaveApplication.getStatus())) {
                leaveApplication.setStatus("RECALLED");
                LeaveApplication recalledLeaveApplication = leaveService.save(leaveApplication);

                // Send WebSocket notification
                Notification notification = new Notification();
                notification.setType(Notification.NotificationType.LEAVE_REQUEST); // Use the correct enum constant
                notification.setMessage("Your approved leave application has been recalled.");
                notification.setRecipientId(leaveApplication.getEmployee().getId());
                notificationService.sendNotification(notification);

                response.put("message", "Leave application recalled successfully.");
                response.put("leaveApplication", recalledLeaveApplication);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("message", "Leave application is not in approved status, so it can't be recalled.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error processing leave application recall", e); // Log the exception
            response.put("message", "An error occurred while processing the leave application.");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/assign-task")
    public ResponseEntity<Task> assignTask(@RequestBody Map<String, Object> requestBody) {
        // Extract email and validate
        String employeeEmail = (String) requestBody.get("email");
        if (employeeEmail == null || employeeEmail.isEmpty()) {
            throw new RuntimeException("Employee email must be provided in the request body.");
        }

        // Fetch the employee by email
        Employee employee = employeeService.findByEmail(employeeEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + employeeEmail));

        // Extract the task title and validate
        String taskTitle = (String) requestBody.get("title");
        if (taskTitle == null || taskTitle.isEmpty()) {
            throw new RuntimeException("Task title must be provided in the request body.");
        }

        // Create a task object
        Task task = new Task();
        task.setTitle(taskTitle); // Set the task title
        task.setDescription((String) requestBody.get("description"));
        task.setDueDate(LocalDate.parse((String) requestBody.get("dueDate")));
        task.setAssignedBy((String) requestBody.getOrDefault("assignedBy", "Admin"));
        task.setEmployee(employee);
        task.setStartDate(LocalDateTime.now());

        // Assign the task
        Task assignedTask = taskService.assignTask(employee.getId(), task);

        // Create a notification for the employee
        Notification notification = new Notification();
        notification.setType(Notification.NotificationType.TASK_ASSIGNMENT);
        notification.setMessage("You have been assigned a new task: " + task.getTitle());
        notification.setRecipientId(employee.getId()); // Send notification to the employee only
        notificationService.sendNotification(notification);

        return ResponseEntity.ok(assignedTask);
    }


    @GetMapping("/tasks/{id}")
    public ResponseEntity<Optional<Task>> getTask(@PathVariable Long id) {
        Optional<Task> task = taskService.findTaskById(id);
        if (task != null) {
            return ResponseEntity.ok(task);
        }
        return ResponseEntity.notFound().build();
    }


    // Get all tasks for all employees (no id required)
    @GetMapping("/all_tasks")
    @Secured("ROLE_ADMIN")
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @PostMapping("/approve-extension/{taskId}")
    @Secured({"ROLE_ADMIN", "ROLE_MANAGER"})
    public ResponseEntity<Task> approveExtension(@PathVariable Long taskId, @RequestBody Boolean approve) {
        // Approve or reject the extension request
        Task updatedTask = taskService.approveExtension(taskId, approve);

        // Prepare notification message
        String status = approve ? "approved" : "rejected";
        String message = "Your extension request for the task '" + updatedTask.getTitle() + "' has been " + status + ".";

        // Create notification object
        Notification notification = new Notification();
        notification.setType(Notification.NotificationType.TASK_EXTENSION);
        notification.setMessage(message);
        notification.setRecipientId(updatedTask.getEmployee().getId());

        // Send WebSocket notification
        notificationService.sendNotification(notification);

        return ResponseEntity.ok(updatedTask);
    }

    //get all finance request
    @GetMapping("/all-financeRequests")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<List<FinancialRequest>> getAllFinanceRequests() {
        try {
            // Fetch all financial requests
            List<FinancialRequest> requests = financeRequestService.getAllFinancialRequests();

            // Return the list of financial requests with employee information included
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }


    @GetMapping("/finance-requests/status/{status}")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<List<FinancialRequest>> getRequestsByStatus(@PathVariable String status) {
        try {
            // Fetch financial requests by status
            List<FinancialRequest> requests = financeRequestService.getFinancialRequestsByStatus(status.toUpperCase());

            // Return the list of financial requests as response
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }


    // Endpoint to get financial requests by type (REQUISITION or CLAIM)
    @GetMapping("/requests/type/{type}")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<List<FinancialRequest>> getRequestsByType(@PathVariable FinancialRequest.FinancialRequestType type) {
        try {
            List<FinancialRequest> requests = financeRequestService.getFinancialRequestsByType(type);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    // Endpoint to approve a financial request
    @PatchMapping("/requests/{requestId}/approve")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<Map<String, Object>> approveRequest(@PathVariable Long requestId) {
        try {
            FinancialRequest updatedRequest = financeRequestService.updateRequestStatus(requestId, "APPROVED");

            // Prepare the response
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedRequest.getId());
            response.put("status", updatedRequest.getStatus());
            response.put("message", "Financial request approved successfully.");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "An error occurred while approving the request."));
        }
    }

    // Endpoint to reject a financial request
    @PatchMapping("/requests/{requestId}/reject")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<Map<String, Object>> rejectRequest(@PathVariable Long requestId) {
        try {
            FinancialRequest updatedRequest = financeRequestService.updateRequestStatus(requestId, "REJECTED");

            // Prepare the response
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedRequest.getId());
            response.put("status", updatedRequest.getStatus());
            response.put("message", "Financial request rejected successfully.");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "An error occurred while rejecting the request."));
        }
    }

}