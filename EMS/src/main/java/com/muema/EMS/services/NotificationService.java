package com.muema.EMS.services;

import com.muema.EMS.model.Employee;
import com.muema.EMS.model.Notification;
import com.muema.EMS.repo.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmployeeService employeeService;

    public void sendNotification(Long employeeId, String message) {
        // Find employee by ID
        Employee employee = employeeService.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        // Create and save the notification
        Notification notification = new Notification();
        notification.setEmployee(employee);
        notification.setMessage(message);
        notification.setTimestamp(LocalDateTime.now()); // Ensure timestamp is set
        notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForEmployee(Long employeeId) {
        // Query notifications by employee ID
        return notificationRepository.findByEmployeeId(employeeId);
    }
}
