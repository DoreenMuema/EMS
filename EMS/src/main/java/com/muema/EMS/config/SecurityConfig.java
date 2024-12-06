package com.muema.EMS.config;

import com.muema.EMS.filters.JwtFilter;
import com.muema.EMS.model.Employee;
import com.muema.EMS.repo.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final EmployeeRepository employeeRepository;
    private final JwtFilter jwtFilter;

    @Autowired
    public SecurityConfig(EmployeeRepository employeeRepository, JwtFilter jwtFilter) {
        this.employeeRepository = employeeRepository;
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            Employee employee = employeeRepository.findByUsername(username);

            if (employee == null) {
                throw new UsernameNotFoundException("User  not found with username: " + username);
            }

            return new org.springframework.security.core.userdetails.User(
                    employee.getUsername(),
                    employee.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority(employee.getRole()))
            );
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable() // Disable CSRF for stateless APIs
                .cors().and() // Enable CORS
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/",
                                "/js/**",
                                "/css/**",
                                "/employee_login",
                                "/api/employee_login",
                                "/static/**").permitAll()
                        .requestMatchers("/api/admin/**",
                                "/admin",
                                "/api/admin/admin"
                        ).hasRole("ADMIN") // Protect admin endpoints
                        .requestMatchers("/api/profile/{employeeId}",
                                "/api//apply-leave/{employeeId}",
                                "/api/notifications/").hasAnyRole("EMPLOYEE", "ADMIN") // Allow access to profile for both roles
                        .anyRequest().authenticated() // Require authentication for all other requests
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Stateless session management
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class); // Add JWT filter to the filter chain

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Use BCrypt for password encoding
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager(); // Provide the AuthenticationManager bean
    }
}