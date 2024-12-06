package com.muema.EMS.model;

import jakarta.persistence.*;
import lombok.*;

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

    private String description;
    private LocalDateTime dueDate;
    private String status; // "PENDING", "COMPLETED"

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now(); // Default created date
}