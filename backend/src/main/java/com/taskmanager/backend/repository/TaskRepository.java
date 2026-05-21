package com.taskmanager.backend.repository;

import com.taskmanager.backend.models.Task;
import com.taskmanager.backend.models.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByCreatedById(String userId);
    List<Task> findByAssignedToId(String userId);
    Page<Task> findByCreatedByIdOrAssignedToId(String createdById, String assignedToId, Pageable pageable);
    List<Task> findByStatusAndCreatedById(TaskStatus status, String userId);
}
