package com.muema.EMS.controllers;

import com.muema.EMS.model.Notification;
import com.muema.EMS.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationsController {

    @Autowired
    private NotificationService notificationService;

    // Endpoint to fetch notifications for employee
    @GetMapping("/employee/{employeeId}")
    @Secured("ROLE_EMPLOYEE")
    public ResponseEntity<List<Notification>> getEmployeeNotifications(@PathVariable Long employeeId) {
        List<Notification> notifications = notificationService.getNotifications(employeeId);
        return ResponseEntity.ok(notifications);
    }

    // Endpoint to fetch notifications for admin
    @GetMapping("/admin")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<List<Notification>> getAdminNotifications() {
        List<Notification> notifications = notificationService.getAdminNotifications();
        return ResponseEntity.ok(notifications);
    }

    // Endpoint to get unread notifications count for an employee
    @GetMapping("/employee/{employeeId}/unread")
    @Secured("ROLE_EMPLOYEE")
    public ResponseEntity<Long> getUnreadNotificationCountForEmployee(@PathVariable Long employeeId) {
        List<Notification> unreadNotifications = notificationService.getUnreadNotifications(employeeId);
        return ResponseEntity.ok((long) unreadNotifications.size());
    }

    // Endpoint to get unread notifications count for an admin
    @GetMapping("/admin/unread")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Long> getUnreadNotificationCountForAdmin() {
        List<Notification> unreadNotifications = notificationService.getUnreadNotificationsForAdmin();
        return ResponseEntity.ok((long) unreadNotifications.size());
    }

    // Endpoint to mark a notification as read
    @PutMapping("/mark-read/{notificationId}")
    @Secured({"ROLE_ADMIN", "ROLE_EMPLOYEE"})
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/employee/{employeeId}/finance/unread")
    @Secured("ROLE_EMPLOYEE")
    public ResponseEntity<Long> getUnreadFinanceNotificationsForEmployee(@PathVariable Long employeeId) {
        // Fetch unread finance notifications for employee
        List<Notification> unreadFinanceNotifications = notificationService.getUnreadNotificationsForFinanceRequests(employeeId);
        return ResponseEntity.ok((long) unreadFinanceNotifications.size());
    }

    @GetMapping("/employee/{employeeId}/leave/unread")
    @Secured("ROLE_EMPLOYEE")
    public ResponseEntity<Long> getUnreadLeaveNotificationsForEmployee(@PathVariable Long employeeId) {
        // Fetch unread leave notifications for employee
        List<Notification> unreadLeaveNotifications = notificationService.getUnreadNotificationsForLeaveRequests(employeeId);
        return ResponseEntity.ok((long) unreadLeaveNotifications.size());
    }

    // New Endpoint to get unread notifications for finance requests (Admin)
    @GetMapping("/admin/finance/unread")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Long> getUnreadFinanceNotificationsForAdmin() {
        // This assumes you have a method in NotificationService that filters finance-related notifications
        List<Notification> unreadFinanceNotifications = notificationService.getUnreadNotificationsForFinanceRequestsForAdmin();
        return ResponseEntity.ok((long) unreadFinanceNotifications.size());
    }

    // New Endpoint to get unread notifications for leave requests (Admin)
    @GetMapping("/admin/leave/unread")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Long> getUnreadLeaveNotificationsForAdmin() {
        // This assumes you have a method in NotificationService that filters leave-related notifications
        List<Notification> unreadLeaveNotifications = notificationService.getUnreadNotificationsForLeaveRequestsForAdmin();
        return ResponseEntity.ok((long) unreadLeaveNotifications.size());
    }
}
