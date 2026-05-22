package com.taskmanager.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(min = 2, max = 80, message = "Name must be between 2 and 80 characters")
    private String name;

    @Size(max = 500, message = "Bio must be at most 500 characters")
    private String bio;

    @Email(message = "Email must be valid")
    private String email;
}
