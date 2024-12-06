package com.muema.EMS.repo;


import com.muema.EMS.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Employee findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
