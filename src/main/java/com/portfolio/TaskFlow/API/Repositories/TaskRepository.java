package com.portfolio.TaskFlow.API.Repositories;

import com.portfolio.TaskFlow.API.Entities.Task;
import com.portfolio.TaskFlow.API.Entities.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    void deleteById(Long id);

    List<Task> findByStatus(Status status);
}
