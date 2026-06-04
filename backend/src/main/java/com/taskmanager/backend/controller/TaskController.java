package com.taskmanager.backend.controller;

import com.taskmanager.backend.models.Task;
import com.taskmanager.backend.models.User;
import com.taskmanager.backend.repository.UserRepository;
import com.taskmanager.backend.service.TaskService;
import com.taskmanager.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskService taskService;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        User currentUser = getCurrentUser();
        List<Task> tasks = taskService.getTasksForUser(currentUser);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        User currentUser = getCurrentUser();
        Task savedTask = taskService.createTask(task, currentUser);
        return ResponseEntity.ok(savedTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task taskDetails) {
        try {
            User currentUser = getCurrentUser();
            Task updatedTask = taskService.updateTask(id, taskDetails, currentUser);
            return ResponseEntity.ok(updatedTask);
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).build();
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable String id) {
        try {
            User currentUser = getCurrentUser();
            taskService.deleteTask(id, currentUser);
            return ResponseEntity.ok().build();
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).build();
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
