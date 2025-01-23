package com.muema.EMS.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "task")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    private String title;

    private String description;

    private LocalDate dueDate;

    private LocalDateTime startDate;

    private String assignedBy; // Who assigned the task

    private String status; // "PENDING", "COMPLETED", "EXTENSION_REQUESTED", "APPROVED", "REJECTED"

    // Extension details
    private String extensionReason; // Reason for extension
    private LocalDateTime extensionRequestedDate; // Date when the extension was requested
    private Boolean extensionApproved; // Whether the extension was approved or not

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now(); // Default created date

    // Custom method to fetch employee ID and username only
    @JsonProperty("employee")
    public EmployeeInfo getEmployeeInfo() {
        if (employee != null) {
            return new EmployeeInfo(employee.getId(), employee.getFirstName(), employee.getSurname(), employee.getDesignation(),employee.getEmail());
        }
        return null;
    }

    // Nested static class to return the employee's info in a custom format
    @Getter
    @Setter
    @AllArgsConstructor
    public static class EmployeeInfo {
        private Long id;
        private String firstName;
        private String surname;
        private String designation;
        private String email;
    }

}
