package com.portfolio.TaskFlow.API.Services;

import com.portfolio.TaskFlow.API.Dto.TaskRequestDTO;
import com.portfolio.TaskFlow.API.Dto.TaskResponseDTO;
import com.portfolio.TaskFlow.API.Dto.TaskUpdateDTO;
import com.portfolio.TaskFlow.API.Entities.Task;
import com.portfolio.TaskFlow.API.Entities.enums.Status;
import com.portfolio.TaskFlow.API.Repositories.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {
    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public TaskResponseDTO createTask(TaskRequestDTO dadosEntrada) {
        Task task = new Task(dadosEntrada);
        if (task.getStatus() == null) {
            task.setStatus(Status.PENDING);
        }
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        Task taskSalved = taskRepository.save(task);
        return new TaskResponseDTO(taskSalved);
    }

    public List<TaskResponseDTO> listAll(){
        List<Task> tasks = taskRepository.findAll();
        return tasks.stream()
                .map(TaskResponseDTO::new)
                .toList();
    }
    public TaskResponseDTO findById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task não encontrada"));
        return new TaskResponseDTO(task);
    }

    public TaskResponseDTO update(Long id, TaskUpdateDTO dadosUpdate){
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Recurso não encontrado com o ID:" + id));

        task.setTitle(dadosUpdate.title());
        task.setDescription(dadosUpdate.description());
        task.setStatus(dadosUpdate.status());
        task.setUpdatedAt(LocalDateTime.now());

        Task taskUpdate = taskRepository.save(task);
        return new TaskResponseDTO(taskUpdate);

    }

    public void delete(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurso não encontrado com o ID:" + id));
        taskRepository.delete(task);

}
}
