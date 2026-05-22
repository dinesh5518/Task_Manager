package com.taskmanager.backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {
    @Builder.Default
    private String theme = "dark";

    @Builder.Default
    private boolean notificationsEnabled = true;

    @Builder.Default
    private boolean emailAlerts = true;

    @Builder.Default
    private boolean dueDateReminders = true;

    @Builder.Default
    private boolean soundEnabled = true;

    @Builder.Default
    private boolean sessionVisibility = true;

    @Builder.Default
    private boolean profilePublic = false;

    @Builder.Default
    private boolean securityAlerts = true;
}
