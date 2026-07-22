package com.portfolio.TaskFlow.API.Repositories;

import com.portfolio.TaskFlow.API.Entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {

    void deleteById(Long id);

    Status findByStatus(Status status)
}
