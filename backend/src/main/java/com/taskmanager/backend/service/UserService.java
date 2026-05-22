package com.taskmanager.backend.service;

import com.taskmanager.backend.dto.request.ChangePasswordRequest;
import com.taskmanager.backend.dto.request.UpdateProfileRequest;
import com.taskmanager.backend.dto.request.UserSettingsRequest;
import com.taskmanager.backend.dto.response.MessageResponse;
import com.taskmanager.backend.dto.response.ProfileResponse;
import com.taskmanager.backend.models.Task;
import com.taskmanager.backend.models.TaskStatus;
import com.taskmanager.backend.models.User;
import com.taskmanager.backend.models.UserSettings;
import com.taskmanager.backend.repository.TaskRepository;
import com.taskmanager.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class UserService {

    private static final long MAX_AVATAR_BYTES = 2 * 1024 * 1024;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    public ProfileResponse getProfile(User user) {
        return toProfileResponse(userRepository.findById(user.getId()).orElse(user));
    }

    public ProfileResponse updateProfile(User user, UpdateProfileRequest request) {
        User current = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            current.setName(request.getName().trim());
        }
        if (request.getBio() != null) {
            current.setBio(request.getBio().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
            if (!normalizedEmail.equalsIgnoreCase(current.getEmail())
                    && userRepository.existsByEmail(normalizedEmail)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already in use");
            }
            current.setEmail(normalizedEmail);
        }

        current.setUpdatedAt(LocalDateTime.now());
        return toProfileResponse(userRepository.save(current));
    }

    public ProfileResponse updateAvatar(User user, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avatar file is required");
        }
        if (file.getSize() > MAX_AVATAR_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avatar must be smaller than 2MB");
        }
        String contentType = Optional.ofNullable(file.getContentType()).orElse("");
        if (!contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }

        User current = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        try {
            String base64 = java.util.Base64.getEncoder().encodeToString(file.getBytes());
            current.setAvatar("data:" + contentType + ";base64," + base64);
            current.setUpdatedAt(LocalDateTime.now());
            return toProfileResponse(userRepository.save(current));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to process avatar");
        }
    }

    public ProfileResponse removeAvatar(User user) {
        User current = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        current.setAvatar(null);
        current.setUpdatedAt(LocalDateTime.now());
        return toProfileResponse(userRepository.save(current));
    }

    public MessageResponse changePassword(User user, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password and confirmation do not match");
        }
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different from current password");
        }

        User current = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(current.getEmail(), request.getCurrentPassword()));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        current.setPassword(passwordEncoder.encode(request.getNewPassword()));
        current.setUpdatedAt(LocalDateTime.now());
        userRepository.save(current);
        return new MessageResponse("Password updated successfully");
    }

    public ProfileResponse updateSettings(User user, UserSettingsRequest request) {
        User current = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserSettings settings = Optional.ofNullable(current.getSettings())
                .orElse(UserSettings.builder().build());

        if (request.getTheme() != null && !request.getTheme().isBlank()) {
            String theme = request.getTheme().trim().toLowerCase(Locale.ROOT);
            if (!List.of("dark", "light").contains(theme)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Theme must be 'dark' or 'light'");
            }
            settings.setTheme(theme);
        }
        if (request.getNotificationsEnabled() != null) {
            settings.setNotificationsEnabled(request.getNotificationsEnabled());
        }
        if (request.getEmailAlerts() != null) {
            settings.setEmailAlerts(request.getEmailAlerts());
        }
        if (request.getDueDateReminders() != null) {
            settings.setDueDateReminders(request.getDueDateReminders());
        }
        if (request.getSoundEnabled() != null) {
            settings.setSoundEnabled(request.getSoundEnabled());
        }
        if (request.getSessionVisibility() != null) {
            settings.setSessionVisibility(request.getSessionVisibility());
        }
        if (request.getProfilePublic() != null) {
            settings.setProfilePublic(request.getProfilePublic());
        }
        if (request.getSecurityAlerts() != null) {
            settings.setSecurityAlerts(request.getSecurityAlerts());
        }

        current.setSettings(settings);
        current.setUpdatedAt(LocalDateTime.now());
        return toProfileResponse(userRepository.save(current));
    }

    private ProfileResponse toProfileResponse(User user) {
        List<String> roles = user.getRoles() == null
                ? List.of()
                : user.getRoles().stream().map(Enum::name).collect(Collectors.toList());

        return ProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .avatar(user.getAvatar())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .settings(Optional.ofNullable(user.getSettings()).orElse(UserSettings.builder().build()))
                .stats(buildStats(user))
                .build();
    }

    private Map<String, Object> buildStats(User user) {
        List<Task> tasks = taskRepository.findByCreatedById(user.getId());
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(task -> task.getStatus() == TaskStatus.COMPLETED).count();
        int productivity = totalTasks == 0 ? 0 : (int) Math.round(completedTasks * 100.0 / totalTasks);

        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(29);

        Map<LocalDate, Long> activityByDay = tasks.stream()
                .filter(task -> task.getUpdatedAt() != null)
                .collect(Collectors.groupingBy(task -> task.getUpdatedAt().toLocalDate(), Collectors.counting()));

        long activeStreak = 0;
        long currentStreak = 0;
        for (int i = 29; i >= 0; i--) {
            LocalDate date = thirtyDaysAgo.plusDays(i);
            if (activityByDay.getOrDefault(date, 0L) > 0) {
                currentStreak++;
                activeStreak = Math.max(activeStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }

        List<Map<String, Object>> recentActivity = tasks.stream()
                .sorted(Comparator.comparing(
                        task -> Optional.ofNullable(task.getUpdatedAt()).orElse(task.getCreatedAt()),
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(task -> {
                    String eventLabel = task.getStatus() == TaskStatus.COMPLETED
                            ? "Completed"
                            : (task.getUpdatedAt() != null && task.getCreatedAt() != null
                            && task.getUpdatedAt().isAfter(task.getCreatedAt()) ? "Updated" : "Created");
                    LocalDateTime eventTime = Optional.ofNullable(task.getUpdatedAt()).orElse(task.getCreatedAt());
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("id", task.getId());
                    entry.put("title", task.getTitle());
                    entry.put("status", Optional.ofNullable(task.getStatus()).map(Enum::name).orElse("PENDING"));
                    entry.put("event", eventLabel);
                    entry.put("timestamp", eventTime == null ? "" : eventTime.toString());
                    return entry;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> weeklyActivity = IntStream.rangeClosed(0, 6)
                .mapToObj(i -> {
                    LocalDate date = today.minusDays(6 - i);
                    return Map.<String, Object>of(
                            "day", date.format(DateTimeFormatter.ofPattern("EEE", Locale.ENGLISH)),
                            "count", activityByDay.getOrDefault(date, 0L)
                    );
                })
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTasks", totalTasks);
        stats.put("completedTasks", completedTasks);
        stats.put("pendingTasks", tasks.stream().filter(task -> task.getStatus() == TaskStatus.PENDING).count());
        stats.put("productivityPercentage", productivity);
        stats.put("activeStreak", activeStreak);
        stats.put("recentActivity", recentActivity);
        stats.put("weeklyActivity", weeklyActivity);
        stats.put("memberSinceDays", user.getCreatedAt() == null
                ? 0
                : ChronoUnit.DAYS.between(user.getCreatedAt().toLocalDate(), today));
        return stats;
    }
}
