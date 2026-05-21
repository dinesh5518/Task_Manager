package com.taskmanager.backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tasks")
public class Task {
    
    @Id
    private String id;
    
    private String title;
    
    private String description;
    
    private TaskStatus status;
    
    private TaskPriority priority;
    
    private LocalDateTime dueDate;
    
    private List<String> tags;
    
    private String category;
    
    private List<Subtask> subtasks;
    
    private List<Comment> comments;
    
    @DBRef
    private User assignedTo;
    
    @DBRef
    private User createdBy;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class Subtask {
    private String id;
    private String title;
    private boolean completed;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class Comment {
    private String id;
    private String text;
    private String userId;
    private LocalDateTime createdAt;
}
