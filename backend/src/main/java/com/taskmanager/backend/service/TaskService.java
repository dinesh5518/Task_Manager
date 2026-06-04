package com.taskmanager.backend.service;

import com.taskmanager.backend.models.NotificationType;
import com.taskmanager.backend.models.Task;
import com.taskmanager.backend.models.TaskStatus;
import com.taskmanager.backend.models.User;
import com.taskmanager.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private NotificationService notificationService;

    public List<Task> getTasksForUser(User user) {
        return taskRepository.findByCreatedById(user.getId());
    }

    public Task createTask(Task task, User user) {
        task.setCreatedBy(user);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.PENDING);
        }

        Task savedTask = taskRepository.save(task);
        notificationService.createNotification(user, NotificationType.SUCCESS, "Task created: " + savedTask.getTitle());
        return savedTask;
    }

    public Optional<Task> findById(String id) {
        return taskRepository.findById(id);
    }

    public Task updateTask(String id, Task taskDetails, User user) {
        Task task = taskRepository.findById(id).orElseThrow();
        if (!task.getCreatedBy().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized task update");
        }

        TaskStatus previousStatus = task.getStatus();
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setStatus(taskDetails.getStatus());
        task.setPriority(taskDetails.getPriority());
        task.setDueDate(taskDetails.getDueDate());
        task.setTags(taskDetails.getTags());
        task.setCategory(taskDetails.getCategory());
        task.setUpdatedAt(LocalDateTime.now());

        Task updatedTask = taskRepository.save(task);

        if (previousStatus != TaskStatus.COMPLETED && updatedTask.getStatus() == TaskStatus.COMPLETED) {
            notificationService.createNotification(user, NotificationType.SUCCESS, "Task completed: " + updatedTask.getTitle());
        } else {
            notificationService.createNotification(user, NotificationType.INFO, "Task updated: " + updatedTask.getTitle());
        }

        return updatedTask;
    }

    public void deleteTask(String id, User user) {
        Task task = taskRepository.findById(id).orElseThrow();
        if (!task.getCreatedBy().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized task delete");
        }
        notificationService.createNotification(user, NotificationType.WARNING, "Task deleted: " + task.getTitle());
        taskRepository.delete(task);
    }
}
