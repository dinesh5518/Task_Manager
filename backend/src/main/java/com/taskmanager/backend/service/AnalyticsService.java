package com.taskmanager.backend.service;

import com.taskmanager.backend.models.Task;
import com.taskmanager.backend.models.TaskPriority;
import com.taskmanager.backend.models.TaskStatus;
import com.taskmanager.backend.models.User;
import com.taskmanager.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
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
public class AnalyticsService {

    @Autowired
    private TaskRepository taskRepository;

    public Map<String, Object> getAnalytics(User user) {
        List<Task> tasks = taskRepository.findByCreatedById(user.getId());
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate thirtyDaysAgo = today.minusDays(29);

        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(task -> task.getStatus() == TaskStatus.COMPLETED).count();
        long pendingTasks = tasks.stream().filter(task -> task.getStatus() == TaskStatus.PENDING).count();
        long overdueTasks = tasks.stream()
                .filter(task -> task.getDueDate() != null)
                .filter(task -> task.getStatus() != TaskStatus.COMPLETED)
                .filter(task -> task.getDueDate().isBefore(now))
                .count();
        int productivityPercentage = totalTasks == 0 ? 0 : (int) Math.round(completedTasks * 100.0 / totalTasks);

        long tasksThisWeek = tasks.stream()
                .filter(task -> task.getCreatedAt() != null)
                .filter(task -> !task.getCreatedAt().toLocalDate().isBefore(weekStart))
                .filter(task -> !task.getCreatedAt().toLocalDate().isAfter(today))
                .count();
        long completedThisWeek = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.COMPLETED)
                .filter(task -> task.getUpdatedAt() != null)
                .filter(task -> !task.getUpdatedAt().toLocalDate().isBefore(weekStart))
                .filter(task -> !task.getUpdatedAt().toLocalDate().isAfter(today))
                .count();
        int weeklyCompletionRate = tasksThisWeek == 0 ? 0 : (int) Math.round(completedThisWeek * 100.0 / tasksThisWeek);

        List<Task> completedTasksWithTimes = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.COMPLETED)
                .filter(task -> task.getCreatedAt() != null && task.getUpdatedAt() != null)
                .collect(Collectors.toList());
        double avgCompletionTimeHours = completedTasksWithTimes.stream()
                .mapToLong(task -> ChronoUnit.MINUTES.between(task.getCreatedAt(), task.getUpdatedAt()))
                .average()
                .orElse(0.0) / 60.0;

        Map<LocalDate, Long> completedByDay = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.COMPLETED)
                .filter(task -> task.getUpdatedAt() != null)
                .collect(Collectors.groupingBy(task -> task.getUpdatedAt().toLocalDate(), Collectors.counting()));

        List<Map<String, Object>> dailyProductivity = IntStream.rangeClosed(0, 13)
                .mapToObj(i -> {
                    LocalDate date = today.minusDays(13 - i);
                    return Map.<String, Object>of(
                            "date", date.format(DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH)),
                            "completed", completedByDay.getOrDefault(date, 0L)
                    );
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> weeklyProductivity = IntStream.rangeClosed(0, 5)
                .mapToObj(i -> {
                    LocalDate start = weekStart.minusWeeks(5 - i);
                    LocalDate end = start.plusDays(6);
                    long completed = tasks.stream()
                            .filter(task -> task.getStatus() == TaskStatus.COMPLETED)
                            .filter(task -> task.getUpdatedAt() != null)
                            .filter(task -> !task.getUpdatedAt().toLocalDate().isBefore(start))
                            .filter(task -> !task.getUpdatedAt().toLocalDate().isAfter(end))
                            .count();
                    return Map.<String, Object>of(
                            "week", start.format(DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH)),
                            "completed", completed
                    );
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> monthlyProductivity = IntStream.rangeClosed(0, 5)
                .mapToObj(i -> {
                    YearMonth month = YearMonth.from(today).minusMonths(5 - i);
                    long completed = tasks.stream()
                            .filter(task -> task.getStatus() == TaskStatus.COMPLETED)
                            .filter(task -> task.getUpdatedAt() != null)
                            .filter(task -> YearMonth.from(task.getUpdatedAt().toLocalDate()).equals(month))
                            .count();
                    return Map.<String, Object>of(
                            "month", month.format(DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH)),
                            "completed", completed
                    );
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> statusDistribution = List.of(
                Map.<String, Object>of("label", "Pending", "value", pendingTasks, "color", "#fbbf24"),
                Map.<String, Object>of("label", "In Progress", "value", tasks.stream().filter(task -> task.getStatus() == TaskStatus.IN_PROGRESS).count(), "color", "#38bdf8"),
                Map.<String, Object>of("label", "Completed", "value", completedTasks, "color", "#34d399")
        );

        Map<TaskPriority, Long> priorityCounts = tasks.stream()
                .collect(Collectors.groupingBy(
                        task -> Optional.ofNullable(task.getPriority()).orElse(TaskPriority.MEDIUM),
                        Collectors.counting()
                ));
        List<Map<String, Object>> priorityDistribution = List.of(
                Map.<String, Object>of("label", "Urgent", "value", priorityCounts.getOrDefault(TaskPriority.URGENT, 0L), "color", "#f97316"),
                Map.<String, Object>of("label", "High", "value", priorityCounts.getOrDefault(TaskPriority.HIGH, 0L), "color", "#ef4444"),
                Map.<String, Object>of("label", "Medium", "value", priorityCounts.getOrDefault(TaskPriority.MEDIUM, 0L), "color", "#8b5cf6"),
                Map.<String, Object>of("label", "Low", "value", priorityCounts.getOrDefault(TaskPriority.LOW, 0L), "color", "#22c55e")
        );

        Map<LocalDate, Long> activityByDay = tasks.stream()
                .filter(task -> task.getUpdatedAt() != null)
                .collect(Collectors.groupingBy(task -> task.getUpdatedAt().toLocalDate(), Collectors.counting()));

        List<Map<String, Object>> heatmap = IntStream.rangeClosed(0, 29)
                .mapToObj(i -> {
                    LocalDate date = thirtyDaysAgo.plusDays(i);
                    return Map.<String, Object>of(
                            "date", date.toString(),
                            "count", activityByDay.getOrDefault(date, 0L)
                    );
                })
                .collect(Collectors.toList());

        long bestStreak = 0;
        long currentStreak = 0;
        for (int i = 29; i >= 0; i--) {
            LocalDate date = thirtyDaysAgo.plusDays(i);
            if (activityByDay.getOrDefault(date, 0L) > 0) {
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        long activeDays = activityByDay.entrySet().stream().filter(entry -> !entry.getKey().isBefore(thirtyDaysAgo)).count();
        int completionConsistency = (int) Math.round((activeDays * 100.0) / 7.0);

        LocalDate weekEnd = weekStart.plusDays(6);
        LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

        List<Map<String, Object>> dueSoonTasks = tasks.stream()
                .filter(task -> task.getDueDate() != null)
                .filter(task -> task.getStatus() != TaskStatus.COMPLETED)
                .filter(task -> !task.getDueDate().toLocalDate().isBefore(today))
                .filter(task -> !task.getDueDate().toLocalDate().isAfter(today.plusDays(3)))
                .sorted(Comparator.comparing(Task::getDueDate))
                .limit(5)
                .map(task -> Map.<String, Object>of(
                        "id", task.getId(),
                        "title", task.getTitle(),
                        "dueDate", task.getDueDate().toLocalDate().toString(),
                        "priority", Optional.ofNullable(task.getPriority()).map(Enum::name).orElse("MEDIUM"),
                        "status", Optional.ofNullable(task.getStatus()).map(Enum::name).orElse("PENDING")
                ))
                .collect(Collectors.toList());

        long dueToday = tasks.stream()
                .filter(task -> task.getDueDate() != null)
                .filter(task -> task.getStatus() != TaskStatus.COMPLETED)
                .filter(task -> task.getDueDate().toLocalDate().equals(today))
                .count();
        long dueThisWeek = tasks.stream()
                .filter(task -> task.getDueDate() != null)
                .filter(task -> task.getStatus() != TaskStatus.COMPLETED)
                .filter(task -> !task.getDueDate().toLocalDate().isBefore(weekStart))
                .filter(task -> !task.getDueDate().toLocalDate().isAfter(weekEnd))
                .count();
        long dueThisMonth = tasks.stream()
                .filter(task -> task.getDueDate() != null)
                .filter(task -> task.getStatus() != TaskStatus.COMPLETED)
                .filter(task -> !task.getDueDate().toLocalDate().isBefore(monthStart))
                .filter(task -> !task.getDueDate().toLocalDate().isAfter(monthEnd))
                .count();

        Map<String, List<Task>> categories = tasks.stream()
                .collect(Collectors.groupingBy(task -> {
                    String category = task.getCategory();
                    return category == null || category.isEmpty() ? "Uncategorized" : category;
                }));

        List<Map<String, Object>> categoryDistribution = categories.entrySet().stream()
                .map(entry -> {
                    long categoryTotal = entry.getValue().size();
                    long categoryCompleted = entry.getValue().stream().filter(task -> task.getStatus() == TaskStatus.COMPLETED).count();
                    int categoryCompletionRate = categoryTotal == 0 ? 0 : (int) Math.round(categoryCompleted * 100.0 / categoryTotal);
                    return Map.<String, Object>of(
                            "category", entry.getKey(),
                            "total", categoryTotal,
                            "completed", categoryCompleted,
                            "completionRate", categoryCompletionRate
                    );
                })
                .sorted((a, b) -> Long.compare((Long) b.get("total"), (Long) a.get("total")))
                .collect(Collectors.toList());
        String mostActiveCategory = categoryDistribution.isEmpty() ? "None" : (String) categoryDistribution.get(0).get("category");

        List<Map<String, Object>> recentActivity = tasks.stream()
                .sorted(Comparator.comparing(task -> Optional.ofNullable(task.getUpdatedAt()).orElse(task.getCreatedAt()), Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8)
                .map(task -> {
                    String eventLabel = task.getStatus() == TaskStatus.COMPLETED ? "Completed" : (task.getUpdatedAt() != null && task.getCreatedAt() != null && task.getUpdatedAt().isAfter(task.getCreatedAt()) ? "Updated" : "Created");
                    LocalDateTime eventTime = Optional.ofNullable(task.getUpdatedAt()).orElse(task.getCreatedAt());
                    return Map.<String, Object>of(
                            "id", task.getId(),
                            "title", task.getTitle(),
                            "category", task.getCategory() == null ? "Uncategorized" : task.getCategory(),
                            "status", Optional.ofNullable(task.getStatus()).map(Enum::name).orElse("PENDING"),
                            "event", eventLabel,
                            "timestamp", eventTime == null ? "" : eventTime.toString()
                    );
                })
                .collect(Collectors.toList());

        String mostProductiveDay = completedByDay.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(entry -> entry.getKey().format(DateTimeFormatter.ofPattern("EEE, MMM d", Locale.ENGLISH)))
                .orElse("No activity");
        String leastProductiveDay = completedByDay.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(entry -> entry.getKey().format(DateTimeFormatter.ofPattern("EEE, MMM d", Locale.ENGLISH)))
                .orElse("No activity");

        Map<String, Object> overview = Map.of(
                "totalTasks", totalTasks,
                "completedTasks", completedTasks,
                "pendingTasks", pendingTasks,
                "overdueTasks", overdueTasks,
                "productivityPercentage", productivityPercentage,
                "weeklyCompletionRate", weeklyCompletionRate
        );

        Map<String, Object> performance = Map.of(
                "tasksCompletedThisWeek", completedThisWeek,
                "avgCompletionTimeHours", Math.round(avgCompletionTimeHours * 10.0) / 10.0,
                "mostProductiveDay", mostProductiveDay,
                "leastProductiveDay", leastProductiveDay,
                "completionConsistency", Math.min(100, Math.max(0, completionConsistency))
        );

        Map<String, Object> deadlines = Map.of(
                "dueSoonCount", dueSoonTasks.size(),
                "overdueCount", overdueTasks,
                "dueTodayCount", dueToday,
                "dueThisWeekCount", dueThisWeek,
                "dueThisMonthCount", dueThisMonth,
                "upcomingTasks", dueSoonTasks
        );

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("overview", overview);
        analytics.put("performance", performance);
        analytics.put("trends", Map.of(
                "dailyProductivity", dailyProductivity,
                "weeklyProductivity", weeklyProductivity,
                "monthlyProductivity", monthlyProductivity,
                "completionTrend", dailyProductivity
        ));
        analytics.put("status", statusDistribution);
        analytics.put("priority", priorityDistribution);
        analytics.put("heatmap", Map.of(
                "data", heatmap,
                "bestStreak", bestStreak,
                "activeDays", activeDays
        ));
        analytics.put("deadlines", deadlines);
        analytics.put("categories", Map.of(
                "distribution", categoryDistribution,
                "mostActiveCategory", mostActiveCategory
        ));
        analytics.put("recentActivity", recentActivity);

        return analytics;
    }
}
