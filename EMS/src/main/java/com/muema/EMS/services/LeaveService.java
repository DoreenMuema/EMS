package com.muema.EMS.services;

import com.muema.EMS.model.Employee;
import com.muema.EMS.model.LeaveApplication;
import com.muema.EMS.repo.LeaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LeaveService {
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private EmployeeService employeeService;  // to get Employee details

    public LeaveApplication applyForLeave(Long employeeId, LeaveApplication leaveApplication) {
        // Validate and fetch the employee
        Employee employee = employeeService.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        // Associate leave application with the employee
        leaveApplication.setEmployee(employee);
        leaveApplication.setStatus("PENDING");
        leaveApplication.setApplicationDate(LocalDateTime.now());

        return leaveRepository.save(leaveApplication);
    }

    public LeaveApplication approveLeave(Long leaveId) {
        LeaveApplication leaveApplication = leaveRepository.findById(leaveId).orElseThrow(() -> new RuntimeException("Leave not found"));
        leaveApplication.setStatus("APPROVED");
        leaveRepository.save(leaveApplication);

        // Send notification
        notificationService.sendNotification(leaveApplication.getEmployee().getId(), "Your leave has been approved.");

        return leaveApplication;
    }

    public LeaveApplication rejectLeave(Long leaveId) {
        LeaveApplication leaveApplication = leaveRepository.findById(leaveId).orElseThrow(() -> new RuntimeException("Leave not found"));
        leaveApplication.setStatus("REJECTED");
        leaveRepository.save(leaveApplication);

        // Send notification
        notificationService.sendNotification(leaveApplication.getEmployee().getId(), "Your leave has been rejected.");

        return leaveApplication;
    }

    // Get all leave applications for a specific employee
    public List<LeaveApplication> getAllLeaves() {
        return leaveRepository.findAll();
    }


}
