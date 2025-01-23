package com.muema.EMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_id", nullable = false)
    private long id;

    private String firstName;
    private String surname;
    private String otherName;
    private String phone;
    private String username;
    private String password;
    private String lastLogin;
    private String passwordExpiry;
    private String idNumber;
    private String role;
    private String name;
    private String email = "N/A";
    private Integer age;
    private String designation = "N/A";
    private Boolean isActive = true;
    private String employmentDate;
    private String employmentType;
    private String dob;
    private String gender;
    private String department;
    private String address;
    private String imageUrl;

    @Column(name = "leave_balance")
    private Integer leaveBalance;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.PERSIST, orphanRemoval = true)
    private List<FinancialRequest> financialRequests = new ArrayList<>();


    // Getter method for isActive
    public boolean isActive() {
        return this.isActive != null && this.isActive;
    }

    // Setter method for isActive (if needed)
    public void setActive(Boolean active) {
        this.isActive = active;
    }
}
