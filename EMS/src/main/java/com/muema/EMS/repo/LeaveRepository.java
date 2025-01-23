package com.muema.EMS.repo;

import com.muema.EMS.model.LeaveApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveApplication, Long> {

    List<LeaveApplication> findByEmployeeId(Long employeeId);

    @Query("SELECT COUNT(l) FROM LeaveApplication l WHERE l.employee.id = :employeeId AND l.leaveType = :leaveType AND l.status = 'APPROVED'")
    int getAvailableLeave(Long employeeId, String leaveType);

    // Modify this method to handle the leave balance properly
    @Modifying
    @Query("UPDATE LeaveBalances lb SET lb.availableBalance = :availableBalance WHERE lb.employee.id = :employeeId AND lb.leaveType = :leaveType")
    void updateLeaveBalance(@Param("employeeId") Long employeeId, @Param("leaveType") String leaveType, @Param("availableBalance") Integer availableBalance);

}
