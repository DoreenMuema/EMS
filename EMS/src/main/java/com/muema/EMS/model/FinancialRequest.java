package com.muema.EMS.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.annotation.JsonInclude;
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
@Table(name = "financial_requests")
public class FinancialRequest {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "employee_id", nullable = false)
        @JsonInclude(JsonInclude.Include.NON_NULL)  // Ensures null values for employee are excluded
        private Employee employee;

        @JsonView(Views.Public.class) // Fields to be included in response
        private String itemDescription;

        @JsonView(Views.Public.class)
        private Double amount;

        @JsonView(Views.Public.class)
        private String status;

        private String proofFileUrl; // Store URL/path instead of byte array


        @JsonView(Views.Public.class)
        private LocalDateTime createdDate = LocalDateTime.now();

        @Enumerated(EnumType.STRING)
        private FinancialRequestType type;

        public enum FinancialRequestType {
                REQUISITION,
                CLAIM
        }

        public static class Views {
                public static class Public {} // Define public view for serialization control
        }

        // Custom method to fetch employee ID and username only
        @JsonProperty("employee")
        public EmployeeInfo getEmployeeInfo() {
                if (employee != null) {
                        return new EmployeeInfo(employee.getId(), employee.getFirstName(),employee.getSurname());
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
