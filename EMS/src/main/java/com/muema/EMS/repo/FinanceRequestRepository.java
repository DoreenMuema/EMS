package com.muema.EMS.repo;

import com.muema.EMS.model.FinancialRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinanceRequestRepository extends JpaRepository<FinancialRequest, Long> {
    List<FinancialRequest> findByEmployeeId(Long employeeId);
    List<FinancialRequest> findByStatus(String status);
    List<FinancialRequest> findByType(FinancialRequest.FinancialRequestType type);
    @Query("SELECT f FROM FinancialRequest f WHERE UPPER(f.status) = UPPER(:status) AND f.employee.id = :employeeId")
    List<FinancialRequest> findByStatusAndEmployeeId(@Param("status") String status, @Param("employeeId") Long employeeId);


}