package com.muema.EMS.services;

import com.muema.EMS.model.Employee;
import com.muema.EMS.repo.EmployeeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class EmployeeServiceImpl implements EmployeeService {
    @Autowired
    private EmployeeRepo employeeRepo;

    @Override
    public List<Employee> getAllEmployee() {
        return employeeRepo.findAll();
    }

    @Override
    public void save(Employee employee) {
        if(Objects.nonNull(employee)){
            employeeRepo.save(employee);
        }
    }

    @Override
    public Employee getById(Long id) {
        Employee employee = null;
        if (Objects.nonNull(id)) {
            Optional<Employee> optionalEmployee = employeeRepo.findById(id);
            if(optionalEmployee.isPresent()){
                employee = optionalEmployee.get();
            }else{
                throw new RuntimeException("Employee not found with the id:"+ id);
            }
        }
        return employee;
    }

    @Override
    public void deleteById(Long id) {
        if(Objects.nonNull(id)){
            employeeRepo.deleteById(id);
        }
    }
}

