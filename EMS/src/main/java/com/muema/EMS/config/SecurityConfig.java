package com.muema.EMS.config;

import com.muema.EMS.filters.JwtFilter;
import com.muema.EMS.model.Employee;
import com.muema.EMS.repo.EmployeeRepository;
import nz.net.ultraq.thymeleaf.layoutdialect.LayoutDialect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
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
        return email -> {
            Employee employee = employeeRepository.findByEmail(email);

            if (employee == null) {
                throw new UsernameNotFoundException("User not found with email: " + email);
            }

            return new org.springframework.security.core.userdetails.User(
                    employee.getEmail(),
                    employee.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority(employee.getRole()))
            );
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .cors().and()
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/",
                                "/employeeNotifications",
                                "/notifications",
                                "/manageLeaves",
                                "manageTasks",
                                "/employeefinanceRequest",
                                "/employeeTasks",
                                "/financeRequest",
                                "/employeeLeaveApplication",
                                "/employeeProfile",
                                "/manageEmployees",
                                "/adminDashboard",
                                "/employeeDashboard",
                                "/adminLogin",
                                "/employeeLogin",
                                "/uploads/**",
                                "/js/**",
                                "/css/**",
                                "/api/employee_login",
                                "/api/admin/admin_login",
                                "/static/**").permitAll()
                        .requestMatchers("/api/admin/**",
                                "/api/admin/new",
                                "/admin",
                                "/api/admin/admin"
                        ).hasRole("ADMIN")
                        .requestMatchers("/api/profile/{employeeId}",
                                "/api//apply-leave/{employeeId}",
                                "/api/notifications/").hasAnyRole("EMPLOYEE", "ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public LayoutDialect layoutDialect() {
        return new LayoutDialect();
    }


}
