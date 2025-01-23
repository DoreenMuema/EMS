package com.muema.EMS.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "leave_balance")
public class LeaveBalances {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leave_balance_id", nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "leave_type", nullable = false)
    private String leaveType;

    @Column(name = "available_balance", nullable = false)
    private Integer availableBalance;

    @Column(name = "eligible_balance", nullable = false)
    private Integer eligibleBalance;

    // Removed any leaveApplication field or association
}
