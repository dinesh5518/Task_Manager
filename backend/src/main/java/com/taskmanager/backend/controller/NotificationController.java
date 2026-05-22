package com.taskmanager.backend.controller;

import com.taskmanager.backend.models.Notification;
import com.taskmanager.backend.models.Task;
import com.taskmanager.backend.models.User;
import com.taskmanager.backend.repository.UserRepository;
import com.taskmanager.backend.security.services.UserDetailsImpl;
import com.taskmanager.backend.service.NotificationService;
import com.taskmanager.backend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(notificationService.getNotificationsForUser(currentUser));
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification request) {
        User currentUser = getCurrentUser();
        Notification notification = notificationService.createNotification(currentUser, request.getType() == null ? com.taskmanager.backend.models.NotificationType.INFO : com.taskmanager.backend.models.NotificationType.valueOf(request.getType()), request.getMessage());
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        User currentUser = getCurrentUser();
        Notification notification = notificationService.markAsRead(id, currentUser);
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        User currentUser = getCurrentUser();
        notificationService.markAllAsRead(currentUser);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearNotifications() {
        User currentUser = getCurrentUser();
        notificationService.clearNotifications(currentUser);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/scan-due")
    public ResponseEntity<Map<String, Object>> scanDueNotifications() {
        User currentUser = getCurrentUser();
        List<Task> tasks = taskService.getTasksForUser(currentUser);
        List<Notification> created = notificationService.scanDueDateNotifications(currentUser, tasks);
        List<Notification> notifications = notificationService.getNotificationsForUser(currentUser);

        Map<String, Object> payload = new HashMap<>();
        payload.put("created", created);
        payload.put("notifications", notifications);
        return ResponseEntity.ok(payload);
    }
}
