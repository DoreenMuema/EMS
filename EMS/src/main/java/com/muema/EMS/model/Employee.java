package com.muema.EMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String username;
    private String password;
    private String role;
    private String name;
    private String email;
    private int age;
    private String designation;

    // Method to change the password
    public void changePassword(String newPassword) {
        this.password = newPassword; // Set the new password
    }
}