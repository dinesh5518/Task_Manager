package com.taskmanager.backend.dto.request;

import lombok.Data;

@Data
public class UserSettingsRequest {
    private String theme;
    private Boolean notificationsEnabled;
    private Boolean emailAlerts;
    private Boolean dueDateReminders;
    private Boolean soundEnabled;
    private Boolean sessionVisibility;
    private Boolean profilePublic;
    private Boolean securityAlerts;
}
