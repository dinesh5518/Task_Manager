package com.taskmanager.backend.controller;

import com.taskmanager.backend.dto.request.ChangePasswordRequest;
import com.taskmanager.backend.dto.request.UpdateProfileRequest;
import com.taskmanager.backend.dto.request.UserSettingsRequest;
import com.taskmanager.backend.dto.response.MessageResponse;
import com.taskmanager.backend.dto.response.ProfileResponse;
import com.taskmanager.backend.models.User;
import com.taskmanager.backend.repository.UserRepository;
import com.taskmanager.backend.security.services.UserDetailsImpl;
import com.taskmanager.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(userService.getProfile(getCurrentUser()));
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(getCurrentUser(), request));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateAvatar(getCurrentUser(), file));
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<ProfileResponse> removeAvatar() {
        return ResponseEntity.ok(userService.removeAvatar(getCurrentUser()));
    }

    @PutMapping("/me/password")
    public ResponseEntity<MessageResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(userService.changePassword(getCurrentUser(), request));
    }

    @PutMapping("/me/settings")
    public ResponseEntity<ProfileResponse> updateSettings(@RequestBody UserSettingsRequest request) {
        return ResponseEntity.ok(userService.updateSettings(getCurrentUser(), request));
    }
}
