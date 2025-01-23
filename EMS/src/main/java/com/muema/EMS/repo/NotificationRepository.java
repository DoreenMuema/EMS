package com.muema.EMS.repo;

import com.muema.EMS.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByEmployeeIdAndRead(Long employeeId, boolean read);
    List<Notification> findByEmployeeId(Long employeeId);

    List<Notification> findByRecipientRole(String roleAdmin);

    List<Notification> findUnreadByRecipientRole(String roleAdmin);
}
