package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatistics {
    private long totalAgents;
    private long totalDirections;
    private long totalGrades;
    private long totalFonctions;
    private Map<String, Long> agentsByDirection;
    private Map<String, Long> agentsByGrade;
    private Map<String, Long> agentsByFonction;
    private Map<String, Long> agentsByStatut;
    private Map<String, Long> agentsBySexe;
    private List<HireEvolution> hireEvolution;
    private List<BirthdayMonth> birthdaysThisYear;
    private long activeAgents;
    private long inactiveAgents;

    // Nouvelles sections dashboard
    private long pendingConges;
    private long todayAbsences;
    private long todayPresences;
    private long todayPresencesRate;
    private long totalSanctions;
    private long unreadNotifications;
    private List<DashboardConge> recentConges;
    private List<DashboardAbsence> recentAbsences;
    private List<DashboardNotification> recentNotifications;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class HireEvolution {
        private int year;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BirthdayMonth {
        private int month;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DashboardConge {
        private Long id;
        private String agentNom;
        private String agentPrenom;
        private String typeCongeNom;
        private String dateDebut;
        private String dateFin;
        private int nombreJours;
        private String statut;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DashboardAbsence {
        private Long id;
        private String agentNom;
        private String agentPrenom;
        private String dateDebut;
        private String dateFin;
        private String motif;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DashboardNotification {
        private Long id;
        private String message;
        private boolean lu;
        private String dateNotification;
        private String agentEmail;
    }
}
