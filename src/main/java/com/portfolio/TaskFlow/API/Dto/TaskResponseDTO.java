package com.portfolio.TaskFlow.API.Dto;

import com.portfolio.TaskFlow.API.Entities.Task;
import com.portfolio.TaskFlow.API.Entities.enums.Status;


import java.time.LocalDateTime;

public record TaskResponseDTO(
        Long id,
        String title,
        String description,
        Status status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public TaskResponseDTO(Task task) {
        this(
                task.getId(), task.getTitle(), task.getDescription(), task.getStatus(), task.getCreatedAt(), task.getUpdatedAt()
        );
    }
}
