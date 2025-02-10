package com.muema.EMS.controllers;

import com.muema.EMS.model.*;
import com.muema.EMS.repo.EmployeeRepository;
import com.muema.EMS.repo.FinanceRequestRepository;
import com.muema.EMS.repo.LeaveRepository;
import com.muema.EMS.repo.LeavesBalancesRepository;
import com.muema.EMS.services.*;
import io.jsonwebtoken.io.IOException;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.Serializable;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static org.hibernate.query.sqm.tree.SqmNode.log;

@RestController
@RequestMapping("/api")
public class EmployeeController {

    private final Logger logger = LoggerFactory.getLogger(EmployeeController.class);
    private final JwtUtils jwtUtils;
    private final EmployeeService employeeService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final LeaveService leaveService;
    private final NotificationService notificationService;
    private final TaskService taskService;
    private final LeavesBalancesRepository leavesBalancesRepository;
    private final LeaveRepository leaveRepository;
    private final FinanceRequestService financeRequestService;
    private final EmployeeRepository employeeRepository;
    private final FinanceRequestRepository financeRequestRepository;

    @Autowired
    public EmployeeController(JwtUtils jwtUtils,
                              EmployeeService employeeService,
                              AuthenticationManager authenticationManager,
                              PasswordEncoder passwordEncoder,
                              LeaveService leaveService,
                              NotificationService notificationService,
                              TaskService taskService,
                              LeavesBalancesRepository leavesBalancesRepository,
                              LeaveRepository leaveRepository, FinanceRequestService financeRequestService, EmployeeRepository employeeRepository, FinanceRequestRepository financeRequestRepository) {
        this.jwtUtils = jwtUtils;
        this.employeeService = employeeService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.leaveService = leaveService;
        this.notificationService = notificationService;
        this.taskService = taskService;
        this.leavesBalancesRepository = leavesBalancesRepository;
        this.leaveRepository = leaveRepository;
        this.financeRequestService = financeRequestService;
        this.employeeRepository = employeeRepository;
        this.financeRequestRepository = financeRequestRepository;
    }



    @GetMapping("/profile/{employeeId}")
    @Secured("ROLE_EMPLOYEE, ROLE_ADMIN")
    public ResponseEntity<Map<String, Object>> viewProfile(Principal principal, @PathVariable String employeeId) {
        try {
            String email = principal.getName(); // Fetch the logged-in user's email
            Optional<Employee> optionalEmployee = employeeService.findByEmail(email);

            if (optionalEmployee.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Employee not found"));
            }

            Employee employee = optionalEmployee.get();

            // Prepare the response with fallback values
            Map<String, Object> response = new HashMap<>();
            response.put("email", employee.getEmail() != null ? employee.getEmail() : "N/A");
            response.put("role", employee.getRole() != null ? employee.getRole() : "N/A");
            response.put("designation", employee.getDesignation() != null ? employee.getDesignation() : "N/A");
            response.put("firstName", employee.getFirstName() != null ? employee.getFirstName() : "N/A");
            response.put("surname", employee.getSurname() != null ? employee.getSurname() : "N/A");
            response.put("otherName", employee.getOtherName() != null ? employee.getOtherName() : "N/A");
            response.put("phone", employee.getPhone() != null ? employee.getPhone() : "N/A");
            response.put("idNumber", employee.getIdNumber() != null ? employee.getIdNumber() : "N/A");  // Ensure idNumber is included
            response.put("employmentDate", employee.getEmploymentDate() != null ? employee.getEmploymentDate().toString() : "N/A");
            response.put("employmentType", employee.getEmploymentType() != null ? employee.getEmploymentType() : "N/A");
            response.put("dob", employee.getDob() != null ? employee.getDob().toString() : "N/A");  // Ensure dob is included
            response.put("gender", employee.getGender() != null ? employee.getGender() : "N/A");
            response.put("department", employee.getDepartment() != null ? employee.getDepartment() : "N/A");
            response.put("age", employee.getAge() != null ? employee.getAge() : "N/A");
            response.put("address", employee.getAddress() != null ? employee.getAddress() : "N/A");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error retrieving profile: " + e.getMessage()));
        }
    }


    @PutMapping("/profile/update/{employeeId}")
    @Secured("ROLE_EMPLOYEE, ROLE_ADMIN")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> profileData, Principal principal, @PathVariable String employeeId) {
        try {
            // Get the email of the currently authenticated user
            String email = principal.getName();
            Optional<Employee> optionalEmployee = employeeService.findByEmail(email);

            if (optionalEmployee.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Employee not found"));
            }

            Employee employee = optionalEmployee.get();

            // Extract updated fields from the request
            String newFirstName = profileData.get("firstName");
            String newSurname = profileData.get("surname");
            String newOtherName = profileData.get("otherName");
            String newPhone = profileData.get("phone");
            String newDob = profileData.get("dob");
            String newGender = profileData.get("gender");
            String newDepartment = profileData.get("department");
            String newAge = profileData.get("age"); // Accept age as part of the request
            String newAddress = profileData.get("address");
            String newIdNumber = profileData.get("idNumber"); // Accept idNumber as part of the request

            // Update the employee's details if provided
            if (newFirstName != null && !newFirstName.isEmpty()) {
                employee.setFirstName(newFirstName);
            }
            if (newSurname != null && !newSurname.isEmpty()) {
                employee.setSurname(newSurname);
            }
            if (newOtherName != null && !newOtherName.isEmpty()) {
                employee.setOtherName(newOtherName);
            }
            if (newPhone != null && !newPhone.isEmpty()) {
                employee.setPhone(newPhone);
            }
            if (newDob != null && !newDob.isEmpty()) {
                employee.setDob(newDob);  // Update dob if provided
            }
            if (newGender != null && !newGender.isEmpty()) {
                employee.setGender(newGender);
            }
            if (newDepartment != null && !newDepartment.isEmpty()) {
                employee.setDepartment(newDepartment);
            }

            // If age is provided in the request, set it directly
            if (newAge != null && !newAge.isEmpty()) {
                employee.setAge(Integer.parseInt(newAge)); // Set the age directly
            }
            if (newAddress != null && !newAddress.isEmpty()) {
                employee.setAddress(newAddress); // Set the address
            }
            if (newIdNumber != null && !newIdNumber.isEmpty()) {
                employee.setIdNumber(newIdNumber); // Update idNumber if provided
            }


            // Save updated employee
            employeeService.save(employee);

            // Prepare response with updated details
            Map<String, Object> response = new HashMap<>();
            response.put("firstName", employee.getFirstName());
            response.put("surname", employee.getSurname());
            response.put("otherName", employee.getOtherName());
            response.put("phone", employee.getPhone());
            response.put("dob", employee.getDob());
            response.put("gender", employee.getGender());
            response.put("imageUrl", employee.getImageUrl() != null ? employee.getImageUrl() : "N/A");
            response.put("department", employee.getDepartment());

            response.put("age", employee.getAge());  // Include age in the response
            response.put("address", employee.getAddress()); // Include address in the response
            response.put("idNumber", employee.getIdNumber()); // Include idNumber in the response

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }


    @PostMapping("/apply-leave/{employeeId}")
    @Secured({"ROLE_EMPLOYEE", "ROLE_ADMIN"})
    public ResponseEntity<Map<String, Object>> applyForLeave(@PathVariable Long employeeId,
                                                             @RequestBody LeaveApplication leaveApplication) {
        logger.debug("Entering applyForLeave with employeeId: {} and leaveApplication: {}", employeeId, leaveApplication);

        try {
            // Validate inputs
            if (employeeId == null) {
                logger.error("Employee ID is null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Employee ID cannot be null"));
            }
            if (leaveApplication == null) {
                logger.error("LeaveApplication is null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Leave application cannot be null"));
            }

            // Apply for leave
            LeaveApplication savedLeaveApplication = leaveService.applyForLeave(employeeId, leaveApplication);
            logger.debug("Leave application saved successfully: {}", savedLeaveApplication);

            // Send notification to admin
            String adminMessage = String.format(
                    "New leave request from Employee ID: %d. Leave Type: %s, Days Requested: %d, Start Date: %s, End Date: %s",
                    employeeId, leaveApplication.getLeaveType(), leaveApplication.getDaysRequested(),
                    leaveApplication.getStartDate(), leaveApplication.getEndDate()
            );

            // Send real-time WebSocket notification to admin
            notificationService.sendNotificationToAdmin(adminMessage);

            // Send real-time WebSocket notification to the employee
            String employeeMessage = String.format("Your leave request has been submitted and is awaiting approval. Leave Type: %s, Start Date: %s, End Date: %s",
                    leaveApplication.getLeaveType(), leaveApplication.getStartDate(), leaveApplication.getEndDate());
            notificationService.sendNotificationToEmployee(employeeId, employeeMessage);

            logger.debug("Notifications sent: Admin - {}, Employee - {}", adminMessage, employeeMessage);

            // Prepare response
            Map<String, Object> response = Map.of(
                    "id", savedLeaveApplication.getId(),
                    "type", savedLeaveApplication.getLeaveType(),
                    "days", savedLeaveApplication.getDaysRequested(),
                    "startDate", savedLeaveApplication.getStartDate(),
                    "endDate", savedLeaveApplication.getEndDate(),
                    "status", savedLeaveApplication.getStatus(),
                    "action", "Pending",
                    "description", savedLeaveApplication.getDescription()
            );

            logger.debug("Prepared response: {}", response);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("IllegalArgumentException occurred: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("An error occurred while applying for leave: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred: " + e.getMessage()));
        } finally {
            logger.debug("Exiting applyForLeave with employeeId: {}", employeeId);
        }
    }

    @GetMapping("/leave-balances/{employeeId}")
    @Secured("ROLE_EMPLOYEE, ROLE_ADMIN")
    public ResponseEntity<Map<String, Object>> getLeaveBalances(@PathVariable Long employeeId) {
        try {
            // Fetch leave balances for the employee
            Map<String, Integer> leaveBalances = leaveService.getLeaveBalances(employeeId);

            // Ensure leave balances are not empty, initialize if necessary
            leaveService.initializeLeaveBalancesIfEmpty(employeeId);

            // Define eligible leave days per leave type
            Map<String, Integer> eligibleLeaveDays = new HashMap<>();
            eligibleLeaveDays.put("annualLeave", 21);  // Example eligible leave days
            eligibleLeaveDays.put("compassionateLeave", Integer.MAX_VALUE);  // Unlimited
            eligibleLeaveDays.put("sickLeave", 7);  // Example eligible leave days
            eligibleLeaveDays.put("paternityLeave", 14);  // Example eligible leave days

            // Initialize available balance to eligible balance if not already set
            Map<String, Object> response = new HashMap<>();

            // Add eligible and available leave types to the response map
            for (String leaveType : eligibleLeaveDays.keySet()) {
                Integer available = leaveBalances.getOrDefault(leaveType, eligibleLeaveDays.get(leaveType)); // Use eligible days if no balance found
                Integer eligible = eligibleLeaveDays.get(leaveType);

                // Add to the response map
                response.put(leaveType, Map.of(
                        "eligible", eligible,
                        "available", available
                ));
            }

            // Return the response map
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Internal server errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred: " + e.getMessage()));
        }
    }

    @GetMapping("/employee/leaves/{employeeId}")
    @Secured("ROLE_EMPLOYEE, ROLE_ADMIN")
    public ResponseEntity<Object> getAllLeavesByEmployee(@PathVariable Long employeeId) {
        try {
            // Fetch all leave applications for the specified employee
            List<LeaveApplication> leaveApplications = leaveService.getLeavesByEmployeeId(employeeId);

            if (leaveApplications.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No leave applications found for the employee."));
            }

            // Prepare response with leave details
            List<Map<String, Object>> response = leaveApplications.stream()
                    .map(leave -> {
                        Map<String, Object> leaveDetails = new HashMap<>();
                        leaveDetails.put("id", leave.getId());
                        leaveDetails.put("leaveType", leave.getLeaveType());
                        leaveDetails.put("days", leave.getDays());
                        leaveDetails.put("startDate", leave.getStartDate());
                        leaveDetails.put("endDate", leave.getEndDate());
                        leaveDetails.put("status", leave.getStatus());
                        leaveDetails.put("dateRequested", leave.getDateRequested());
                        return leaveDetails;
                    })
                    .toList();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Internal server errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred: " + e.getMessage()));
        }
    }


    @PostMapping("/tasks/extension-request/{taskId}")
    public ResponseEntity<Task> requestExtensionForTask(@PathVariable Long taskId, @RequestBody String extensionReason) {
        logger.debug("Entering requestExtensionForTask with taskId: {} and extensionReason: {}", taskId, extensionReason);

        try {
            // Request extension for the task
            Task updatedTask = taskService.requestTaskExtension(taskId, extensionReason);
            logger.debug("Task extension requested successfully: {}", updatedTask);

            // Send WebSocket notification to the employee (task assignee)
            String employeeMessage = String.format("Your task with ID: %d has requested an extension. Reason: %s", taskId, extensionReason);
            notificationService.sendNotificationToEmployee(updatedTask.getEmployee().getId(), employeeMessage);

            // Send WebSocket notification to admin
            String adminMessage = String.format("Task ID: %d has requested an extension. Reason: %s", taskId, extensionReason);
            notificationService.sendNotificationToAdmin(adminMessage);

            // Prepare response
            return ResponseEntity.ok(updatedTask);

        } catch (Exception e) {
            logger.error("An error occurred while requesting task extension: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body((Task) Map.of("error", "An error occurred: " + e.getMessage()));
        } finally {
            logger.debug("Exiting requestExtensionForTask with taskId: {}", taskId);
        }
    }

    @PutMapping("/tasks/complete/{taskId}")
    public ResponseEntity<Task> markTaskAsCompleted(@PathVariable Long taskId) {
        logger.debug("Entering markTaskAsCompleted with taskId: {}", taskId);

        try {
            // Mark the task as completed
            Task updatedTask = taskService.markTaskAsCompleted(taskId);
            logger.debug("Task marked as completed: {}", updatedTask);

            // Send WebSocket notification to the employee (task assignee)
            String employeeMessage = String.format("Your task with ID: %d has been marked as completed.", taskId);
            notificationService.sendNotificationToEmployee(updatedTask.getEmployee().getId(), employeeMessage);

            // Send WebSocket notification to admin
            String adminMessage = String.format("Task ID: %d has been marked as completed.", taskId);
            notificationService.sendNotificationToAdmin(adminMessage);

            // Prepare response
            return ResponseEntity.ok(updatedTask);

        } catch (Exception e) {
            logger.error("An error occurred while marking task as completed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body((Task) Map.of("error", "An error occurred: " + e.getMessage()));
        } finally {
            logger.debug("Exiting markTaskAsCompleted with taskId: {}", taskId);
        }
    }


    // Get tasks for a specific employee (available to admin and the employee themselves)
    @GetMapping("/tasks/{employeeId}")
    @Secured({"ROLE_EMPLOYEE", "ROLE_ADMIN"})
    public ResponseEntity<List<Task>> getEmployeeTasks(@PathVariable Long employeeId) {
        try {
            List<Task> tasks = taskService.getTasksByEmployeeId(employeeId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    // Get pending tasks for a specific employee (available to admin and the employee themselves)
    @GetMapping("/tasks/pending/{employeeId}")
    @Secured({"ROLE_EMPLOYEE", "ROLE_ADMIN"})
    public ResponseEntity<List<Task>> getPendingEmployeeTasks(@PathVariable Long employeeId) {
        try {
            // Correct the service call to get tasks with "PENDING" status for a given employee
            List<Task> tasks = taskService.findPendingTasksByEmployeeId(employeeId);  // Adjusted method name
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    // Request an extension for a task
    @PostMapping("/request-extension/{taskId}")
    @Secured("ROLE_EMPLOYEE")
    public ResponseEntity<Task> requestExtension(@PathVariable Long taskId, @RequestBody String extensionReason) {
        Task updatedTask = taskService.requestTaskExtension(taskId, extensionReason);
        return ResponseEntity.ok(updatedTask);
    }

    @GetMapping("/finance-requests/{employeeId}")
    @Secured({"ROLE_ADMIN", "ROLE_EMPLOYEE"})
    public ResponseEntity<List<Map<String, Serializable>>> getRequestsByEmployeeId(@PathVariable Long employeeId) {
        try {
            // Log the received employeeId
            logger.debug("Fetching financial requests for employeeId: {}", employeeId);

            List<FinancialRequest> requests = financeRequestService.getFinancialRequestsByEmployeeId(employeeId);

            // Log the retrieved requests
            if (requests != null && !requests.isEmpty()) {
                logger.debug("Found {} requests for employeeId: {}", requests.size(), employeeId);
            } else {
                logger.debug("No requests found for employeeId: {}", employeeId);
            }

            // Map FinancialRequest to response format
            List<Map<String, Serializable>> response = requests.stream().map(request -> {
                Map<String, Serializable> requestMap = new HashMap<>();
                requestMap.put("id", request.getId());
                requestMap.put("itemDescription", request.getItemDescription());
                requestMap.put("amount", request.getAmount());
                requestMap.put("status", request.getStatus());
                requestMap.put("createdDate", request.getCreatedDate());
                requestMap.put("type", request.getType().name());
                requestMap.put("description", request.getDescription());

                // Add claimDate and requisitionDate with "N/A" as fallback
                requestMap.put("claimDate", request.getClaimDate() != null ? request.getClaimDate().toString() : "N/A");
                requestMap.put("requisitionDate", request.getRequisitionDate() != null ? request.getRequisitionDate().toString() : "N/A");

                requestMap.put("proofFileUrl", request.getProofFileUrl() != null ? new String(request.getProofFileUrl()) : null);
                return requestMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to retrieve financial requests", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @PostMapping(value = "/finance-requests/{employeeId}", consumes = {"multipart/form-data"})
    @Secured({"ROLE_ADMIN", "ROLE_EMPLOYEE"})
    public ResponseEntity<Map<String, Object>> createRequest(
            @RequestParam("itemDescription") String itemDescription,
            @RequestParam("amount") Double amount,
            @RequestParam("type") String type,
            @RequestParam(value = "proofFile", required = false) MultipartFile proofFile, // For CLAIMS
            @RequestParam(value = "description", required = false) String description, // For REQUISITION
            @RequestParam(value = "claimDate", required = false) @DateTimeFormat(pattern = "yyyy/MM/dd") LocalDate claimDate, // For CLAIM
            @RequestParam(value = "requisitionDate", required = false) @DateTimeFormat(pattern = "yyyy/MM/dd") LocalDate requisitionDate, // For REQUISITION
            @PathVariable Long employeeId) {

        try {
            logger.debug("Received request: itemDescription={}, amount={}, type={}, employeeId={}, claimDate={}, requisitionDate={}",
                    itemDescription, amount, type, employeeId, claimDate, requisitionDate);

            // Create FinancialRequest object
            FinancialRequest request = new FinancialRequest();
            request.setItemDescription(itemDescription);
            request.setAmount(amount);
            request.setType(FinancialRequest.FinancialRequestType.valueOf(type.toUpperCase()));

            request.setClaimDate(claimDate); // Ensure claimDate is set
            request.setRequisitionDate(requisitionDate); // Ensure requisitionDate is set

            // Handle CLAIM Requests
            if ("CLAIM".equalsIgnoreCase(type)) {
                if (proofFile == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Proof file is required for claims"));
                }

                // Validate file type
                String contentType = proofFile.getContentType();
                if (!contentType.equals("application/pdf") && !contentType.startsWith("image/")) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Only PDFs and images are allowed for proof file"));
                }

                // Save proof file
                String fileUrl = saveProofFile(proofFile, String.valueOf(employeeId));
                if (fileUrl == null) {
                    return ResponseEntity.status(500).body(Map.of("error", "Failed to upload proof file"));
                }

                request.setProofFileUrl(fileUrl);
            }

            // Handle REQUISITION Requests
            if ("REQUISITION".equalsIgnoreCase(type)) {
                if (description == null || description.trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Description is required for requisition requests"));
                }
                request.setDescription(description);
            }

            // Fetch employee
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
            request.setEmployee(employee);
            request.setStatus("PENDING");

            // Save the request
            FinancialRequest savedRequest = financeRequestRepository.save(request);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedRequest.getId());
            response.put("itemDescription", savedRequest.getItemDescription());
            response.put("amount", savedRequest.getAmount());
            response.put("status", savedRequest.getStatus());
            response.put("createdDate", savedRequest.getCreatedDate());

            // Debugging: Print claimDate and requisitionDate
            logger.debug("Saved claimDate: {}", savedRequest.getClaimDate());
            logger.debug("Saved requisitionDate: {}", savedRequest.getRequisitionDate());

            response.put("claimDate", savedRequest.getClaimDate() != null ? savedRequest.getClaimDate().toString() : "N/A");
            response.put("requisitionDate", savedRequest.getRequisitionDate() != null ? savedRequest.getRequisitionDate().toString() : "N/A");
            response.put("type", savedRequest.getType().name());


            if (savedRequest.getProofFileUrl() != null) {
                response.put("proofFileUrl", savedRequest.getProofFileUrl());
            }
            if (savedRequest.getDescription() != null) {
                response.put("description", savedRequest.getDescription());
            }

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            logger.error("File processing error", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process the uploaded file"));
        } catch (Exception e) {
            logger.error("Unexpected error occurred", e);
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred"));
        }
    }


    /**
     * Saves the uploaded proof file and returns its URL.
     */
    private String saveProofFile(MultipartFile proofFile, String employeeId) {
        try {
            // Define the upload directory
            String uploadsDir = "C:/Users/doree/Desktop/EMS/uploads";
            Path uploadPath = Paths.get(uploadsDir);

            // Create the directory if it doesn't exist
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                logger.info("Created upload directory at: {}", uploadPath);
            }

            // Construct the filename using employeeId and original filename
            String originalFileName = proofFile.getOriginalFilename();
            if (originalFileName == null || originalFileName.isEmpty()) {
                logger.warn("Received empty filename for employee: {}", employeeId);
                return null;
            }

            // Normalize filename to prevent invalid characters
            String sanitizedFileName = originalFileName.replaceAll("[^a-zA-Z0-9.\\-_]", "_"); // Replace special chars with _
            String fileName = employeeId + "-" + sanitizedFileName;

            // Save file to disk
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, proofFile.getBytes());
            logger.info("File saved successfully at: {}", filePath.toAbsolutePath());

            // Return only the filename (store this in the database)
            return fileName;

        } catch (IOException e) {
            logger.error("Error saving proof file for employee: {}", employeeId, e);
            return null;
        } catch (java.io.IOException e) {
            throw new RuntimeException(e);
        }
    }
}