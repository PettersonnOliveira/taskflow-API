package com.portfolio.TaskFlow.API.Dto;

import com.portfolio.TaskFlow.API.Entities.enums.Status;

public record TaskUpdateDTO(
        String title,
        String description,
        Status status
) {
}
