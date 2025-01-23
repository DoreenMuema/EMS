package com.muema.EMS.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.text.DateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "leave")
public class LeaveApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leave_application_id", nullable = false)
    private Long id;

    @ManyToOne(cascade = CascadeType.PERSIST) // Cascade to Employee
    @JoinColumn(name = "employee_id")  // Foreign key to Employee
    private Employee employee;


    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;
    private String description;
    private long daysRequested;
    private LocalDateTime submissionTime;

    private LocalDateTime applicationDate;

    @Column(name = "leave_type", nullable = false)
    private String leaveType;



    @PrePersist
    public void prePersist() {
        if (applicationDate == null) {
            applicationDate = LocalDateTime.now();
        }
    }

    public int getDays() {
        return (int) ChronoUnit.DAYS.between(startDate, endDate);
    }

    public LocalDateTime getDateRequested() {
        return applicationDate;
    }

    public void setApprovalDate(LocalDateTime now) {
    }

    public void setRejectionDate(LocalDateTime now) {

    }
    // Use @JsonProperty to expose employee's first name and surname in the response
    @JsonProperty("employeeFirstName")
    public String getFirstName() {
        return employee != null ? employee.getFirstName() : null;
    }

    @JsonProperty("employeeSurname")
    public String getSurname() {
        return employee != null ? employee.getSurname() : null;
    }
}
