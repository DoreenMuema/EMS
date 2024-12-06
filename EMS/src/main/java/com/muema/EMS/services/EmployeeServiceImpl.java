package com.muema.EMS.services;

import com.muema.EMS.model.Employee;
import com.muema.EMS.repo.EmployeeRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<Employee> getAllEmployee() {
        return employeeRepository.findAll();
    }

    @Override
    public void save(Employee employee) {
        if (Objects.nonNull(employee)) {
            if (!employee.getRole().startsWith("ROLE_")) {
                employee.setRole("ROLE_" + employee.getRole());
            }
            employeeRepository.save(employee);
        }
    }

    @Override
    public Optional<Employee> findById(Long id) {
        if (Objects.isNull(id)) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return employeeRepository.findById(id).or(() -> {
            throw new RuntimeException("Employee not found with the id: " + id);
        });
    }

    @Override
    public void deleteById(Long id) {
        if (Objects.nonNull(id)) {
            employeeRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("ID cannot be null");
        }
    }

    @Override
    public Optional<Employee> findByUsername(String username) {
        if (Objects.isNull(username)) {
            throw new IllegalArgumentException("Username cannot be null");
        }
        return Optional.ofNullable(employeeRepository.findByUsername(username));
    }

    public Employee createEmployee(Employee employee) {
        if (employee.getUsername() == null || employee.getUsername().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        if (employee.getEmail() == null || employee.getEmail().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        if (employee.getPassword() == null || employee.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        if (employee.getRole() == null || employee.getRole().isEmpty()) {
            throw new IllegalArgumentException("Role cannot be empty");
        }

        if (employeeRepository.existsByUsername(employee.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        return employeeRepository.save(employee);
    }

    @PostConstruct
    public void initializeAdmin() {
        if (employeeRepository.findByUsername("admin") == null) {
            Employee admin = new Employee();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN"); // Set role with prefix
            employeeRepository.save(admin);
            System.out.println("Admin user created with username: admin and password: admin123");
        }
    }
}
