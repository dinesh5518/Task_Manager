package com.taskmanager.backend.service;

import com.taskmanager.backend.models.Notification;
import com.taskmanager.backend.models.NotificationType;
import com.taskmanager.backend.models.Task;
import com.taskmanager.backend.models.TaskStatus;
import com.taskmanager.backend.models.User;
import com.taskmanager.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(User user, NotificationType type, String message) {
        Notification notification = Notification.builder()
                .userId(user.getId())
                .type(type.name())
                .message(message)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public Notification markAsRead(String id, User user) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
        if (!notification.getUserId().equals(user.getId())) {
            throw new SecurityException("Unauthorized notification access");
        }
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        notifications.forEach((notification) -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    public void clearNotifications(User user) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        notificationRepository.deleteAll(notifications);
    }

    public List<Notification> scanDueDateNotifications(User user, List<Task> tasks) {
        List<Notification> created = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Task task : tasks) {
            if (task.getDueDate() == null || task.getStatus() == TaskStatus.COMPLETED) {
                continue;
            }

            String warningMessage = String.format("Upcoming due: %s is due within 24 hours.", task.getTitle());
            String overdueMessage = String.format("Overdue task: %s has passed its deadline.", task.getTitle());

            if (task.getDueDate().isBefore(now)) {
                if (!notificationRepository.findFirstByUserIdAndMessage(user.getId(), overdueMessage).isPresent()) {
                    created.add(createNotification(user, NotificationType.ERROR, overdueMessage));
                }
            } else if (task.getDueDate().isBefore(now.plusHours(24))) {
                if (!notificationRepository.findFirstByUserIdAndMessage(user.getId(), warningMessage).isPresent()) {
                    created.add(createNotification(user, NotificationType.WARNING, warningMessage));
                }
            }
        }

        return created;
    }
}
