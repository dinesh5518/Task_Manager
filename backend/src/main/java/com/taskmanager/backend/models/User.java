package com.taskmanager.backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    private String name;
    
    private String email;
    
    private String password;
    
    private String avatar;
    
    private Set<Role> roles;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
