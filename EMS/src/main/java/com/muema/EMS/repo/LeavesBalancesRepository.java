package com.muema.EMS.repo;

import com.muema.EMS.model.LeaveBalances;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface LeavesBalancesRepository extends JpaRepository <LeaveBalances, Long>  {
    List<LeaveBalances> findByEmployeeId(Long employeeId);

    LeaveBalances findByEmployeeIdAndLeaveType(Long employeeId, String leaveType);
}
