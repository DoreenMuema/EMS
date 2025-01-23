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

    /**
     * Endpoint to retrieve all notifications for a specific employee.
     *
     * @param employeeId the ID of the employee whose notifications are being fetched.
     * @return a list of notifications for the specified employee.
     *
     * Access Control: Restricted to users with roles ROLE_EMPLOYEE.
     */
    @GetMapping("/employee/{employeeId}")
    @Secured("ROLE_EMPLOYEE")
    public ResponseEntity<List<Notification>> getEmployeeNotifications(@PathVariable Long employeeId) {
        List<Notification> notifications = notificationService.getNotifications(employeeId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Endpoint to retrieve all notifications for an admin.
     *
     * @return a list of notifications for the admin.
     *
     * Access Control: Restricted to users with the role ROLE_ADMIN.
     */
    @GetMapping("/admin")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<List<Notification>> getAdminNotifications() {
        List<Notification> notifications = notificationService.getAdminNotifications();
        return ResponseEntity.ok(notifications);
    }

    /**
     * Endpoint to retrieve the count of unread notifications for a specific employee.
     *
     * @param employeeId the ID of the employee whose unread notification count is being fetched.
     * @return the number of unread notifications for the specified employee.
     *
     * Access Control: Restricted to users with the role ROLE_EMPLOYEE.
     */
    @GetMapping("/employee/{employeeId}/unread")
    @Secured("ROLE_EMPLOYEE")
    public ResponseEntity<Long> getUnreadNotificationCountForEmployee(@PathVariable Long employeeId) {
        List<Notification> unreadNotifications = notificationService.getUnreadNotifications(employeeId);
        return ResponseEntity.ok((long) unreadNotifications.size());
    }

    /**
     * Endpoint to retrieve the count of unread notifications for an admin.
     *
     * @return the number of unread notifications for the admin.
     *
     * Access Control: Restricted to users with the role ROLE_ADMIN.
     */
    @GetMapping("/admin/unread")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<Long> getUnreadNotificationCountForAdmin() {
        List<Notification> unreadNotifications = notificationService.getUnreadNotificationsForAdmin();
        return ResponseEntity.ok((long) unreadNotifications.size());
    }

    /**
     * Endpoint to mark a specific notification as read.
     *
     * @param notificationId the ID of the notification to be marked as read.
     * @return a response with an HTTP 200 status indicating the operation was successful.
     *
     * Access Control: Restricted to users with roles ROLE_ADMIN or ROLE_EMPLOYEE.
     */
    @PutMapping("/mark-read/{notificationId}")
    @Secured({"ROLE_ADMIN", "ROLE_EMPLOYEE"})
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }
}
