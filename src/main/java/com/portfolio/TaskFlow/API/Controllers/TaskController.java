package com.portfolio.TaskFlow.API.Controllers;

import com.portfolio.TaskFlow.API.Dto.TaskRequestDTO;
import com.portfolio.TaskFlow.API.Dto.TaskResponseDTO;
import com.portfolio.TaskFlow.API.Dto.TaskUpdateDTO;
import com.portfolio.TaskFlow.API.Entities.Task;
import com.portfolio.TaskFlow.API.Services.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(@Valid @RequestBody TaskRequestDTO dadosEntrada) {
        TaskResponseDTO responseDTO = taskService.createTask(dadosEntrada);
        //return ResponseEntity.ok(responseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponseDTO>> listAll() {
        List<TaskResponseDTO> listDtoResponse = taskService.listAll();
        return ResponseEntity.ok(listDtoResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> findById(@PathVariable Long id) {
        TaskResponseDTO responseDTO = taskService.findById(id);
        return ResponseEntity.ok(responseDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> update(@PathVariable Long id, @RequestBody TaskUpdateDTO dadosUpdate){
        TaskResponseDTO responseDTO = taskService.update(id, dadosUpdate);
        return ResponseEntity.ok(responseDTO);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }


}
