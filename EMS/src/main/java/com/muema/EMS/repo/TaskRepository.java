package com.muema.EMS.repo;

import com.muema.EMS.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Find all tasks by employee ID
    List<Task> findByEmployeeId(Long employeeId);
    

    // Optionally, you can add more query methods as needed
    Optional<Task> findById(Long taskId);
}
