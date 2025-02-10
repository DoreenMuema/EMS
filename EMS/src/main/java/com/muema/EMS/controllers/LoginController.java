package com.muema.EMS.controllers;

import com.muema.EMS.model.Employee;
import com.muema.EMS.services.EmployeeService;
import com.muema.EMS.services.JwtUtils;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class LoginController {
    private final JwtUtils jwtUtils;
    private final EmployeeService employeeService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public LoginController(JwtUtils jwtUtils, EmployeeService employeeService, AuthenticationManager authenticationManager, PasswordEncoder passwordEncoder) {
        this.jwtUtils = jwtUtils;
        this.employeeService = employeeService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest,
                                                     HttpServletResponse response) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password must be provided"));
        }

        Optional<Employee> optionalEmployee = employeeService.findByEmail(email);

        // If the email doesn't exist
        if (optionalEmployee.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }

        Employee employee = optionalEmployee.get();

        // Check if the account is active
        if (!employee.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Account is deactivated"));
        }

        // Validate password
        if (!passwordEncoder.matches(password, employee.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token with the user's role
            String role = employee.getRole();
            String jwtToken = jwtUtils.generateToken(employee.getEmail(), role);

            // Add token to response headers
            response.setHeader("Authorization", "Bearer " + jwtToken);

            // Construct response
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("token", jwtToken);
            responseBody.put("message", "Login successful");
            responseBody.put("email", email);
            responseBody.put("role", role);
            responseBody.put("employeeId", employee.getId());

            return ResponseEntity.ok(responseBody);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }
    }
}
