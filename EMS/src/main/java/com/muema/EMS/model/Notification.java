package com.muema.EMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee; // Employee who receives the notification

    @Enumerated(EnumType.STRING)
    @Column(name = "type")  // Explicitly name the column to avoid conflicts
    private NotificationType type;

    private String message;
    private Long recipientId;
    private String recipientRole;
    private boolean read; // To track if the notification has been read

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now(); // Default timestamp

    @ManyToOne
    @JoinColumn(name = "leave_application_id", referencedColumnName = "leave_application_id", nullable = true)
    private LeaveApplication leaveApplication; // Optional, if it's related to a leave application

    public enum NotificationType {
        LEAVE_REQUEST,
        TASK_ASSIGNMENT,
        MEETING_REMINDER,
        TASK_EXTENSION;
    }

    // No need for recipientId or employeeId setters
}
