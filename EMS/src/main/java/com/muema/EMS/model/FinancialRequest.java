package com.muema.EMS.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "financial_requests")
public class FinancialRequest {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "employee_id", nullable = false)
        @JsonInclude(JsonInclude.Include.NON_NULL) // Excludes null employee details
        private Employee employee;

        @JsonView(Views.Public.class)
        @Column(nullable = false)  // Ensure it cannot be null in DB
        private String itemDescription;

        @JsonView(Views.Public.class)
        @Column(nullable = false)
        private Double amount;

        @JsonView(Views.Public.class)
        @Column(nullable = false)
        private String status;

        @JsonView(Views.Public.class)
        @Column(columnDefinition = "TEXT") // Ensure long descriptions can be stored
        private String description;  // Now properly stored in the database

        @Column(nullable = true) // Proof file is optional
        private String proofFileUrl;

        @JsonView(Views.Public.class)
        @Column(nullable = false, updatable = false)
        private LocalDateTime createdDate = LocalDateTime.now();

        @Getter
        @Column(nullable = true) // Optional field for claimDate
        private LocalDate claimDate;

        @Getter
        @Column(nullable = true) // Optional field for requisitionDate
        private LocalDate requisitionDate;


    @Enumerated(EnumType.STRING)
        @Column(nullable = false)  // Ensure type is always specified
        private FinancialRequestType type;



        public enum FinancialRequestType {
                REQUISITION,
                CLAIM
        }

        public static class Views {
                public static class Public {} // Define public view for serialization control
        }

        // Fetch employee ID and username only
        @JsonProperty("employee")
        public EmployeeInfo getEmployeeInfo() {
                if (employee != null) {
                        return new EmployeeInfo(employee.getId(), employee.getFirstName(), employee.getSurname());
                }
                return null;
        }

        @Getter
        @Setter
        @AllArgsConstructor
        public static class EmployeeInfo {
                private Long id;
                private String firstName;
                private String surname;
        }
}
