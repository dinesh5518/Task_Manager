package com.taskmanager.backend.repository;

import com.taskmanager.backend.models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Notification> findFirstByUserIdAndMessage(String userId, String message);
}
