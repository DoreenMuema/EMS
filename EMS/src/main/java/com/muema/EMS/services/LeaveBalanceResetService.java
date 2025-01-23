package com.muema.EMS.services;

import com.muema.EMS.model.Employee;
import com.muema.EMS.repo.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaveBalanceResetService {

    private final EmployeeRepository employeeRepository;
    private final LeaveService leaveService;

    @Autowired
    public LeaveBalanceResetService(EmployeeRepository employeeRepository, @Lazy LeaveService leaveService) {
        this.employeeRepository = employeeRepository;
        this.leaveService = leaveService;
    }

    @Scheduled(cron = "0 0 0 31 12 *")  // Runs every 31st December at midnight
    public void resetLeaveBalances() {
        // Fetch all employees
        List<Employee> employees = employeeRepository.findAll();

        // For each employee, reset their leave balances for the new business year
        for (Employee employee : employees) {
            leaveService.resetLeaveBalance(employee.getId());
        }
    }
}
