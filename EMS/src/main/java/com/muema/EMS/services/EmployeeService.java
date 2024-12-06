package com.muema.EMS.services;

import com.muema.EMS.model.Employee;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface EmployeeService {
    List<Employee> getAllEmployee();
    void save(Employee employee);
    Optional<Employee> findById(Long id);
    void deleteById(Long id);
    Optional<Employee> findByUsername(String username);
    Employee createEmployee(Employee employee);
}
