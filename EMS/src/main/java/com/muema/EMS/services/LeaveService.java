package com.muema.EMS.services;

import com.muema.EMS.model.Employee;
import com.muema.EMS.model.LeaveApplication;
import com.muema.EMS.model.LeaveBalances;
import com.muema.EMS.model.Notification;
import com.muema.EMS.repo.EmployeeRepository;
import com.muema.EMS.repo.LeaveRepository;
import com.muema.EMS.repo.LeavesBalancesRepository;
import com.muema.EMS.repo.NotificationRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class LeaveService {

    private final NotificationService notificationService;
    private final LeaveRepository leaveRepository;
    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;
    private final LeavesBalancesRepository leavesBalancesRepository;
    private final NotificationRepository notificationRepository;

    @Autowired
    public LeaveService(NotificationService notificationService,
                        LeaveRepository leaveRepository,
                        EmployeeService employeeService,
                        EmployeeRepository employeeRepository,
                        LeavesBalancesRepository leavesBalancesRepository, @Lazy NotificationRepository notificationRepository) {
        this.notificationService = notificationService;
        this.leaveRepository = leaveRepository;
        this.employeeService = employeeService;
        this.employeeRepository = employeeRepository;
        this.leavesBalancesRepository = leavesBalancesRepository;
        this.notificationRepository = notificationRepository;
    }

    public LeaveApplication applyForLeave(Long employeeId, LeaveApplication leaveApplication) {
        // Find the employee
        Employee employee = employeeService.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        // Initialize leave balances if not already done
        initializeLeaveBalancesIfEmpty(employeeId);

        // Set leave application details
        leaveApplication.setEmployee(employee);
        leaveApplication.setStatus("PENDING");
        leaveApplication.setApplicationDate(LocalDateTime.now());

        // Save the leave application
        LeaveApplication savedLeaveApplication = leaveRepository.save(leaveApplication);

        // Create a notification for the employee about the leave application
        Notification notification = new Notification();
        notification.setEmployee(employee);  // Ensure the notification is associated with the employee
        notification.setLeaveApplication(savedLeaveApplication);  // Link the notification to the leave application
        notification.setMessage("Your leave application is pending.");

        // Save the notification
        notificationRepository.save(notification);

        // Return the saved leave application
        return savedLeaveApplication;
    }

    public boolean checkLeaveBalance(Long employeeId, String leaveType, long requestedDays) {
        Map<String, Integer> leaveBalances = getLeaveBalances(employeeId);
        return leaveBalances.containsKey(leaveType) && requestedDays <= leaveBalances.get(leaveType);
    }

    public Map<String, Integer> getLeaveBalances(Long employeeId) {
        List<LeaveBalances> balances = leavesBalancesRepository.findByEmployeeId(employeeId);
        Map<String, Integer> leaveBalances = new HashMap<>();
        for (LeaveBalances balance : balances) {
            leaveBalances.put(balance.getLeaveType(), balance.getAvailableBalance());
        }
        return leaveBalances;
    }

    @Transactional
    public boolean updateLeaveBalance(Long employeeId, LeaveApplication leaveApplication, int leaveDaysRequested) {
        // Logger initialization
        Logger logger = LoggerFactory.getLogger(LeaveService.class);

        // Retrieve the leave balance for the employee and leave type
        LeaveBalances leaveBalance = leavesBalancesRepository.findByEmployeeIdAndLeaveType(employeeId, leaveApplication.getLeaveType());

        if (leaveBalance != null && leaveBalance.getAvailableBalance() >= leaveDaysRequested) {

            // Log before updating the leave balance
            logger.debug("Leave balance before update: " + leaveBalance.getAvailableBalance());
            logger.debug("Requested leave days: " + leaveDaysRequested);

            // Update the available and eligible balances
            leaveBalance.setAvailableBalance(leaveBalance.getAvailableBalance() - leaveDaysRequested);
            leaveBalance.setEligibleBalance(leaveBalance.getEligibleBalance() - leaveDaysRequested);

            // Save the updated leave balance
            leavesBalancesRepository.save(leaveBalance);

            // Log after updating the leave balance
            logger.debug("Leave balance after update: " + leaveBalance.getAvailableBalance());

            return true;
        }

        // If leave balance is insufficient
        logger.debug("Insufficient leave balance for the requested leave days.");
        return false;
    }

    public void initializeLeaveBalancesIfEmpty(Long employeeId) {
        // Fetch all leave balances for the employee
        List<LeaveBalances> balances = leavesBalancesRepository.findByEmployeeId(employeeId);

        // Map for eligible leave days based on leave type
        Map<String, Integer> eligibleLeaveDays = Map.of(
                "annualLeave", 21,
                "compassionateLeave", Integer.MAX_VALUE,
                "sickLeave", 7,
                "paternityLeave", 14
        );

        // Loop through each leave type to ensure the employee has an entry
        for (String leaveType : eligibleLeaveDays.keySet()) {
            // Check if the employee already has a leave balance for this leave type
            boolean hasLeaveType = balances.stream()
                    .anyMatch(balance -> balance.getLeaveType().equals(leaveType));

            // If the employee doesn't have a balance for this leave type, create and save it
            if (!hasLeaveType) {
                // Fetch the employee from the database (this ensures correct linkage to the employee)
                Employee employee = employeeRepository.findById(employeeId)
                        .orElseThrow(() -> new RuntimeException("Employee not found"));

                // Create a new LeaveBalances entity
                LeaveBalances newBalance = new LeaveBalances();
                newBalance.setEmployee(employee); // Set the correct employee
                newBalance.setLeaveType(leaveType); // Set the leave type
                newBalance.setAvailableBalance(eligibleLeaveDays.get(leaveType)); // Set the available balance
                newBalance.setEligibleBalance(eligibleLeaveDays.get(leaveType)); // Set the eligible balance

                // Save the new leave balance entry
                leavesBalancesRepository.save(newBalance);
            }
        }
    }

    public List<LeaveApplication> getLeavesByEmployeeId(Long employeeId) {
        return leaveRepository.findByEmployeeId(employeeId);
    }

    public List<LeaveApplication> getAllLeaves() {
        return leaveRepository.findAll();
    }

    public Optional<LeaveApplication> findById(Long id) {
        return leaveRepository.findById(id);
    }

    public LeaveApplication save(LeaveApplication leaveApplication) {
        leaveRepository.save(leaveApplication);
        return leaveApplication;
    }

    public void resetLeaveBalance(long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + employeeId));

        employee.setLeaveBalance(0);
        employeeRepository.save(employee);
    }

    @Transactional
    public LeaveApplication approveLeaveApplication(Long applicationId) {
        LeaveApplication leaveApplication = leaveRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Leave application not found"));

        // Check if the leave application has already been processed
        if (leaveApplication.getStatus().equals("APPROVED") || leaveApplication.getStatus().equals("REJECTED")) {
            throw new IllegalArgumentException("Leave application has already been processed.");
        }

        // Update leave application status to APPROVED
        leaveApplication.setStatus("APPROVED");
        leaveApplication.setApprovalDate(LocalDateTime.now());

        // Save the updated leave application
        LeaveApplication updatedLeaveApplication = leaveRepository.save(leaveApplication);

        // Send notification about leave approval
        notificationService.sendLeaveApprovalNotification(updatedLeaveApplication);

        return updatedLeaveApplication;
    }
    // Reject leave application
    @Transactional
    public LeaveApplication rejectLeaveApplication(Long applicationId) {
        LeaveApplication leaveApplication = leaveRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Leave application not found"));

        if (leaveApplication.getStatus().equals("APPROVED") || leaveApplication.getStatus().equals("REJECTED")) {
            throw new IllegalArgumentException("Leave application has already been processed.");
        }

        leaveApplication.setStatus("REJECTED");
        leaveApplication.setRejectionDate(LocalDateTime.now());
        LeaveApplication updatedLeaveApplication = leaveRepository.save(leaveApplication);

        // Send notification about leave rejection
        notificationService.sendLeaveRejectionNotification(updatedLeaveApplication);

        return updatedLeaveApplication;
    }

    public List<LeaveApplication> getLeavesByStatus(String status) {
        return leaveRepository.findByStatus(status);
    }

}
