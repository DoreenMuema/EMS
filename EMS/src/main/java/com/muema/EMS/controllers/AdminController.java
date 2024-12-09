package com.muema.EMS.controllers;

import com.muema.EMS.model.Employee;
import com.muema.EMS.model.LeaveApplication;
import com.muema.EMS.model.Notification;
import com.muema.EMS.model.Task;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/")
public class AdminController {

    private final Logger logger = LoggerFactory.getLogger(AdminController.class);
    private final JwtUtils jwtUtils;
    private final EmployeeService employeeService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final LeaveService leaveService;
    private final TaskService taskService ;
    private final NotificationService notificationService;

    @Autowired
    public AdminController(JwtUtils jwtUtils,
                           EmployeeService employeeService,
                           AuthenticationManager authenticationManager,
                           PasswordEncoder passwordEncoder, LeaveService leaveService, TaskService taskService, EmployeeRepository employeeRepository, TaskRepository taskRepository, LeaveRepository leaveRepository, NotificationService notificationService) {
        this.jwtUtils = jwtUtils;
        this.employeeService = employeeService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.leaveService = leaveService;
        this.taskService = taskService;
        this.notificationService = notificationService;
    }

    @PostMapping("/admin_login")
    public ResponseEntity<Map<String, Object>> adminLogin(@RequestBody Map<String, String> loginRequest,
                                                          HttpServletResponse response) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        try {
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get the role of the authenticated user from the authentication object
            String role = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_USER"); // Default to ROLE_USER if no role is found

            // Generate JWT token with role included
            String jwtToken = jwtUtils.generateToken(username, role); // Use the user's role here

            // Set token in the response header
            response.setHeader("Authorization", "Bearer " + jwtToken);

            // Prepare the response body with token, message, and role
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("token", jwtToken);
            responseBody.put("message", "Login successful");
            responseBody.put("role", role);  // Include the role in the response

            return ResponseEntity.ok(responseBody);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
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

        // Validate the token (you can use your JwtUtils class for validation and claims extraction)
        JwtUtils jwtUtils = new JwtUtils();
        Claims claims = jwtUtils.extractAllClaims(token); // Extract all claims from the token

        // Extract username or other claims
        String username = jwtUtils.extractUsername(token);

        logger.info("Admin Dashboard accessed by: " + username);

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
                .map(employee -> Map.of("id", employee.getId(), "username", employee.getUsername(), "role", employee.getRole()))
                .collect(Collectors.toList()));

        // Map leave applications data
        responseBody.put("leaveApplications", leaveApplications.stream()
                .map(leave -> Map.of("id", leave.getId(), "employee", leave.getEmployee().getUsername(), "startDate", leave.getStartDate(), "endDate", leave.getEndDate(), "status", leave.getStatus()))
                .collect(Collectors.toList()));

        // Map tasks data
        responseBody.put("tasks", tasks.stream()
                .map(task -> Map.of("id", task.getId(), "employee", task.getEmployee().getUsername(), "description", task.getDescription(), "dueDate", task.getDueDate(), "status", task.getStatus()))
                .collect(Collectors.toList()));

        // Map notifications data
        responseBody.put("notifications", notifications.stream()
                .map(notification -> Map.of("id", notification.getId(), "message", notification.getMessage(), "date", notification.getTimestamp()))
                .collect(Collectors.toList()));

        // Add additional info to the response
        responseBody.put("user", username);
        responseBody.put("role", "ROLE_ADMIN");
        responseBody.put("message", "Welcome to the admin dashboard");

        return ResponseEntity.ok(responseBody);
    }


    @PostMapping("/new")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Map<String, Object>> createEmployee(@RequestBody Employee employee) {
        try {
            // Hash the password before saving the employee
            String encodedPassword = passwordEncoder.encode(employee.getPassword());
            employee.setPassword(encodedPassword);  // Set the hashed password

            // Save the employee with the hashed password
            employeeService.save(employee);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Employee created successfully"
            ));
        } catch (Exception e) {
            logger.error("Error creating employee: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error creating employee: " + e.getMessage()
                    ));
        }
    }

    // GET: Retrieve an employee by ID
    @GetMapping("/{id}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
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
    // PUT: Update an existing employee
    @PutMapping("/update/{id}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee updatedEmployee) {
        Optional<Employee> existingEmployee = employeeService.findById(id);

        if (existingEmployee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Employee employee = existingEmployee.get();
        if (updatedEmployee.getUsername() != null) {
            employee.setUsername(updatedEmployee.getUsername());
        }
        if (updatedEmployee.getEmail() != null) {
            employee.setEmail(updatedEmployee.getEmail());
        }
        if (updatedEmployee.getPassword() != null) {
            employee.setPassword(updatedEmployee.getPassword());
        }
        if (updatedEmployee.getRole() != null) {
            employee.setRole(updatedEmployee.getRole());
        }

        employeeService.save(employee);
        return ResponseEntity.ok(employee);
    }

    // DELETE: Delete an employee by ID
    @DeleteMapping("/delete/{id}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        Optional<Employee> employee = employeeService.findById(id);

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        employeeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    // Approve leave
    @PutMapping("/approve-leave/{leaveId}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<LeaveApplication> approveLeave(@PathVariable Long leaveId) {
        LeaveApplication leaveApplication = leaveService.approveLeave(leaveId);
        return ResponseEntity.ok(leaveApplication);
    }

    // Reject leave
    @PutMapping("/reject-leave/{leaveId}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<LeaveApplication> rejectLeave(@PathVariable Long leaveId) {
        LeaveApplication leaveApplication = leaveService.rejectLeave(leaveId);
        return ResponseEntity.ok(leaveApplication);
    }

    // Assign a task to an employee
    @PostMapping("/assign-task/{employeeId}")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Task> assignTask(@PathVariable Long employeeId, @RequestBody Task task) {
        Task assignedTask = taskService.assignTask(employeeId, task);
        return ResponseEntity.ok(assignedTask);
    }

    // Get all tasks for an employee
    @GetMapping("/tasks")
    @Secured("ROLE_ADMIN")
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();

    }

    @GetMapping("/leaves")
    @Secured("ROLE_ADMIN")
    public List<LeaveApplication> getAllLeaves() {
        return leaveService.getAllLeaves();
    }

}



