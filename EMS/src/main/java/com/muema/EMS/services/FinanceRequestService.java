package com.muema.EMS.services;

import com.muema.EMS.model.Employee;
import com.muema.EMS.model.FinancialRequest;
import com.muema.EMS.repo.EmployeeRepository;
import com.muema.EMS.repo.FinanceRequestRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FinanceRequestService {
    @Autowired
    private FinanceRequestRepository financeRequestRepository;
    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeService employeeService;

    // Get financial requests for a specific employee
    public List<FinancialRequest> getFinancialRequestsByEmployeeId(Long employeeId) {
        // Verify that the employee exists
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return financeRequestRepository.findByEmployeeId(employeeId);
    }

    // Get financial requests by status
    public List<FinancialRequest> getFinancialRequestsByStatus(String status) {
        return financeRequestRepository.findByStatus(status);
    }

    // Create a financial request (requisition or claim)
    public FinancialRequest createFinancialRequest(FinancialRequest financialRequest) {
        // Set the employee from the authenticated user
        Employee employee = employeeService.getAuthenticatedEmployee();
        financialRequest.setEmployee(employee);
        return financeRequestRepository.save(financialRequest);
    }

    // Get all requests by type (REQUISITION or CLAIM)
    public List<FinancialRequest> getFinancialRequestsByType(FinancialRequest.FinancialRequestType type) {
        return financeRequestRepository.findByType(type);
    }

    public FinancialRequest updateRequestStatus(Long requestId, String status) {
        // Find the financial request by ID or throw an exception if not found
        FinancialRequest request = financeRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Financial request with ID " + requestId + " not found"));

        // Update the status of the financial request
        request.setStatus(status.toUpperCase());

        // Save the updated financial request back to the database
        return financeRequestRepository.save(request);
    }

    // Method to fetch all financial requests
    @Transactional
    public List<FinancialRequest> getAllFinancialRequests() {
        try {
            // Fetch all financial requests from the repository
            return financeRequestRepository.findAll(); // Use the instance variable
        } catch (Exception e) {
            // Log the exception for debugging purposes
            throw new RuntimeException("Failed to fetch financial requests: " + e.getMessage(), e);
        }
    }
}
