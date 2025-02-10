package com.muema.EMS.repo;

import com.muema.EMS.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Fetch unread notifications for a specific employee with a specific notification type
    List<Notification> findByEmployeeIdAndReadAndType(Long employeeId, boolean read, Notification.NotificationType type);

    // Fetch all notifications for a specific employee
    List<Notification> findByEmployeeId(Long employeeId);

    // Fetch unread notifications for a specific role (e.g., admin) and notification type
    List<Notification> findUnreadByRecipientRoleAndType(String recipientRole, Notification.NotificationType type);

    // Fetch all notifications for a specific recipient role
    List<Notification> findByRecipientRole(String role);

    // Fetch unread notifications for a specific recipient role
    List<Notification> findUnreadByRecipientRole(String recipientRole);

    List<Notification> findByEmployeeIdAndRead(Long employeeId, boolean b);
}