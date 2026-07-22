package com.portfolio.TaskFlow.API.Dto;

import jakarta.validation.constraints.NotBlank;

public record TaskRequestDTO(
        @NotBlank
        String title,
        String description
) {
}
