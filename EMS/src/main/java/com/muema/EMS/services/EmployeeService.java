package com.muema.EMS.services;

import com.muema.EMS.model.Employee;
import com.muema.EMS.repo.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public EmployeeService(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private static final String PASSWORD_PATTERN = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    // Validate password strength according to PCI DSS and custom requirements
    public boolean isPasswordValid(String password) {
        if (password == null || password.length() < 8) { // Updated minimum length to 8
            return false; // Invalid password if it's too short
        }

        // Check complexity for uppercase, lowercase, digits, and special characters
        return Pattern.matches(PASSWORD_PATTERN, password); // Valid if it matches the pattern
    }


    // Get all employees
    public List<Employee> getAllEmployee() {
        return employeeRepository.findAll();
    }

    // Save or update an employee
    public void save(Employee employee) {
        if (Objects.nonNull(employee)) {
            if (!employee.getRole().startsWith("ROLE_")) {
                employee.setRole("ROLE_" + employee.getRole());
            }
            employeeRepository.save(employee);
        }
    }


    // Find employee by ID
    public Optional<Employee> findById(Long id) {
        if (Objects.isNull(id)) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return employeeRepository.findById(id).or(() -> {
            throw new RuntimeException("Employee not found with the id: " + id);
        });
    }

    // Delete employee by ID
    public void deleteById(Long id) {
        if (Objects.nonNull(id)) {
            employeeRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("ID cannot be null");
        }
    }

    // Find employee by username
    public Optional<Employee> findByUsername(String username) {
        if (Objects.isNull(username)) {
            throw new IllegalArgumentException("Username cannot be null");
        }
        return Optional.ofNullable(employeeRepository.findByUsername(username));
    }

    // Find employee by email
    public Optional<Employee> findByEmail(String email) {
        if (Objects.isNull(email)) {
            throw new IllegalArgumentException("Email cannot be null");
        }
        return Optional.ofNullable(employeeRepository.findByEmail(email));
    }

    public Employee createEmployee(Employee employee) {
        // Validate username, email, password, etc.
        if (employee.getUsername() == null || employee.getUsername().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }

        if (employee.getEmail() == null || employee.getEmail().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }

        if (employee.getPassword() == null || employee.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        // Check if username or email already exists
        if (employeeRepository.existsByUsername(employee.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Validate password strength
        if (isPasswordValid(employee.getPassword())) {
            throw new IllegalArgumentException("Password does not meet the required strength. It should be at least 12 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
        }

        // Encrypt the password using PasswordEncoder
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));

        return employeeRepository.save(employee);
    }


    // Change password of an employee
    public void changePassword(Long employeeId, String newPassword) {
        // Check if employee exists
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() ->
                new RuntimeException("Employee not found with id: " + employeeId));

        // Validate password strength
        if (isPasswordValid(newPassword)) {
            throw new IllegalArgumentException("Password does not meet the required strength. It should be at least 12 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
        }

        // Encode and update password
        employee.setPassword(passwordEncoder.encode(newPassword));
        employeeRepository.save(employee); // Save updated employee with new password
    }

    // Initialize admin user if not exists
    @PostConstruct
    public void initializeAdmin() {
        if (employeeRepository.findByUsername("admin") == null) {
            Employee admin = new Employee();
            admin.setUsername("admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("SecurePass123!@"));
            admin.setRole("ROLE_ADMIN"); // Set role with prefix
            employeeRepository.save(admin);
            System.out.println("Admin user created with username: admin and password: SecurePass123!@");
        }
    }

    // Find active employees
    public List<Employee> findByIsActiveTrue() {
        return employeeRepository.findByIsActiveTrue(); // Custom query or JPA method
    }

    public Employee getAuthenticatedEmployee() {
        return null;
    }

    public List<Employee> findAdmins() {
        return employeeRepository.findAll().stream()
                .filter(employee -> "ROLE_ADMIN".equals(employee.getRole())) // Assuming role is stored as "ROLE_ADMIN"
                .collect(Collectors.toList());
    }

}
