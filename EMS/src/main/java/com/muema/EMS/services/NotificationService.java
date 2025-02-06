package com.muema.EMS.services;

import com.muema.EMS.model.Employee;
import com.muema.EMS.model.LeaveApplication;
import com.muema.EMS.model.Notification;
import com.muema.EMS.repo.EmployeeRepository;
import com.muema.EMS.repo.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository,
                               EmployeeService employeeService,
                               EmployeeRepository employeeRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.employeeService = employeeService;
        this.employeeRepository = employeeRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public void createNotification(Long employeeId, String message) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));

        Notification notification = new Notification();
        notification.setEmployee(employee);
        notification.setMessage(message);

        notification.setType(Notification.NotificationType.TASK_ASSIGNMENT); // Ensure this is set

        notification.setRead(false);
        notification.setTimestamp(LocalDateTime.now());

        System.out.println("Notification Type: " + notification.getType()); // Check if it's printed

        notificationRepository.save(notification); // Save to DB
    }
    public List<Notification> getAdminNotifications() {
        // Logic to fetch admin-specific notifications
        return notificationRepository.findByRecipientRole("ROLE_ADMIN");
    }

    public List<Notification> getUnreadNotificationsForAdmin() {
        // Logic to fetch unread notifications for admins
        return notificationRepository.findUnreadByRecipientRole("ROLE_ADMIN");
    }




    public void sendNotification(Long employeeId, String message) {
        Employee employee = employeeService.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        Notification notification = new Notification();
        notification.setEmployee(employee);
        notification.setMessage(message);
        notification.setTimestamp(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    public List<Notification> getNotifications(Long employeeId) {
        return notificationRepository.findByEmployeeId(employeeId);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public void notifyAdmin(String message) {
        Long adminId = 1L; // Assuming admin ID is predefined

        Notification notification = new Notification();
        notification.setEmployee(null); // No specific employee for system-wide notifications
        notification.setRecipientId(adminId);
        notification.setMessage(message);
        notification.setTimestamp(LocalDateTime.now());
        notificationRepository.save(notification);

        System.out.println("Admin Notification: " + message);
    }

    public void sendNotificationToEmployee(Long employeeId, String message) {
        // Create notification in the database
        createNotification(employeeId, message);

        // Send WebSocket notification to the employee
        messagingTemplate.convertAndSend("/topic/employee/" + employeeId, message);
    }

    public void sendNotificationToAdmin(String message) {
        // Create notifications for all admins
        List<Employee> admins = employeeService.findAdmins();
        admins.forEach(admin -> createNotification(admin.getId(), message));

        // Send WebSocket notification to all admins
        messagingTemplate.convertAndSend("/topic/admin", message);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public List<Notification> getUnreadNotifications(Long employeeId) {
        return notificationRepository.findByEmployeeIdAndRead(employeeId, false);
    }

    public void sendLeaveApprovalNotification(LeaveApplication updatedLeaveApplication) {
        // Implementation for sending leave approval notification
    }

    public void sendLeaveRejectionNotification(LeaveApplication updatedLeaveApplication) {
        // Implementation for sending leave rejection notification
    }

    public void sendNotification(Notification notification) {
    }

    // Get unread finance-related notifications for a specific employee
    public List<Notification> getUnreadNotificationsForFinanceRequests(Long employeeId) {
        // Assuming 'FINANCE_REQUEST' is added to the NotificationType enum
        return notificationRepository.findByEmployeeIdAndReadAndType(employeeId, false, Notification.NotificationType.FINANCE_REQUEST);
    }

    // Get unread leave-related notifications for a specific employee
    public List<Notification> getUnreadNotificationsForLeaveRequests(Long employeeId) {
        // Fetch unread leave-related notifications for the given employee
        return notificationRepository.findByEmployeeIdAndReadAndType(employeeId, false, Notification.NotificationType.LEAVE_REQUEST);
    }

    // Get unread finance-related notifications for the admin
    public List<Notification> getUnreadNotificationsForFinanceRequestsForAdmin() {
        // Fetch unread finance-related notifications for the admin
        return notificationRepository.findUnreadByRecipientRoleAndType("admin", Notification.NotificationType.FINANCE_REQUEST);
    }

    // Get unread leave-related notifications for the admin
    public List<Notification> getUnreadNotificationsForLeaveRequestsForAdmin() {
        // Fetch unread leave-related notifications for the admin
        return notificationRepository.findUnreadByRecipientRoleAndType("admin", Notification.NotificationType.LEAVE_REQUEST);
    }
}
