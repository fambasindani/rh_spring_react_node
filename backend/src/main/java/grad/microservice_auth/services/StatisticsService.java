package grad.microservice_auth.services;

import grad.microservice_auth.Enum.StatutConge;
import grad.microservice_auth.dto.DashboardStatistics;
import grad.microservice_auth.entities.*;
import grad.microservice_auth.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final AgentRepository agentRepository;
    private final DirectionRepository directionRepository;
    private final GradeRepository gradeRepository;
    private final FonctionRepository fonctionRepository;
    private final CongeRepository congeRepository;
    private final AbsenceRepository absenceRepository;
    private final PresenceRepository presenceRepository;
    private final SanctionRepository sanctionRepository;
    private final NotificationRepository notificationRepository;

    public DashboardStatistics getDashboardStatistics() {
        DashboardStatistics stats = new DashboardStatistics();

        // Totaux
        stats.setTotalAgents(agentRepository.count());
        stats.setTotalDirections(directionRepository.count());
        stats.setTotalGrades(gradeRepository.count());
        stats.setTotalFonctions(fonctionRepository.count());

        // Répartition par direction
        Map<String, Long> agentsByDirection = new HashMap<>();
        List<Object[]> dirCounts = agentRepository.countByDirection();
        for (Object[] row : dirCounts) {
            Direction dir = (Direction) row[0];
            Long cnt = (Long) row[1];
            if (dir != null) {
                agentsByDirection.put(dir.getNom() + " (" + dir.getSigle() + ")", cnt);
            }
        }
        stats.setAgentsByDirection(agentsByDirection);

        // Répartition par grade
        Map<String, Long> agentsByGrade = new HashMap<>();
        List<Object[]> gradeCounts = agentRepository.countByGrade();
        for (Object[] row : gradeCounts) {
            Grade grade = (Grade) row[0];
            Long cnt = (Long) row[1];
            if (grade != null) {
                agentsByGrade.put(grade.getNom() + " (" + grade.getSigle() + ")", cnt);
            }
        }
        stats.setAgentsByGrade(agentsByGrade);

        // Répartition par fonction
        Map<String, Long> agentsByFonction = new HashMap<>();
        List<Object[]> fonctionCounts = agentRepository.countByFonction();
        for (Object[] row : fonctionCounts) {
            Fonction fonction = (Fonction) row[0];
            Long cnt = (Long) row[1];
            if (fonction != null) {
                agentsByFonction.put(fonction.getNom(), cnt);
            }
        }
        stats.setAgentsByFonction(agentsByFonction);

        // Répartition par statut
        long active = agentRepository.countByStatutTrue();
        long inactive = agentRepository.countByStatutFalse();
        stats.setActiveAgents(active);
        stats.setInactiveAgents(inactive);
        stats.setAgentsByStatut(Map.of("Actif", active, "Inactif", inactive));

        // Répartition par sexe
        Map<String, Long> agentsBySexe = new HashMap<>();
        List<Object[]> sexeCounts = agentRepository.countBySexe();
        for (Object[] row : sexeCounts) {
            String sexe = (String) row[0];
            Long cnt = (Long) row[1];
            if ("M".equals(sexe)) {
                agentsBySexe.put("Homme", cnt);
            } else if ("F".equals(sexe)) {
                agentsBySexe.put("Femme", cnt);
            }
        }
        stats.setAgentsBySexe(agentsBySexe);

        // Évolution des engagements par année
        List<DashboardStatistics.HireEvolution> hireEvo = new ArrayList<>();
        List<Object[]> hireByYear = agentRepository.countByYearOfEngagement();
        for (Object[] row : hireByYear) {
            int year = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            hireEvo.add(new DashboardStatistics.HireEvolution(year, count));
        }
        hireEvo.sort(Comparator.comparingInt(DashboardStatistics.HireEvolution::getYear));
        stats.setHireEvolution(hireEvo);

        // Anniversaires par mois
        List<DashboardStatistics.BirthdayMonth> bdays = new ArrayList<>();
        List<Object[]> birthdaysByMonth = agentRepository.countBirthdaysByMonth();
        for (Object[] row : birthdaysByMonth) {
            int month = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            bdays.add(new DashboardStatistics.BirthdayMonth(month, count));
        }
        stats.setBirthdaysThisYear(bdays);

        // ==================== NOUVELLES SECTIONS ====================
        LocalDate today = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        // Congés en attente
        stats.setPendingConges(congeRepository.countByStatut(StatutConge.EN_ATTENTE));

        // Absences aujourd'hui
        stats.setTodayAbsences(absenceRepository.countActiveOnDate(today));

        // Présences aujourd'hui
        long todayPresences = presenceRepository.countByDatePresence(today);
        stats.setTodayPresences(todayPresences);
        long totalAgentsCount = stats.getTotalAgents();
        stats.setTodayPresencesRate(totalAgentsCount > 0 ? (todayPresences * 100) / totalAgentsCount : 0);

        // Total sanctions
        stats.setTotalSanctions(sanctionRepository.count());

        // Notifications non lues
        stats.setUnreadNotifications(notificationRepository.countByLuFalse());

        // Derniers congés
        List<DashboardStatistics.DashboardConge> recentConges = new ArrayList<>();
        for (Conge c : congeRepository.findTop5ByOrderByDateDemandeDesc()) {
            recentConges.add(new DashboardStatistics.DashboardConge(
                    c.getId(),
                    c.getAgent().getNom(),
                    c.getAgent().getPrenom(),
                    c.getTypeConge().getNom(),
                    c.getDateDebut() != null ? c.getDateDebut().format(fmt) : "",
                    c.getDateFin() != null ? c.getDateFin().format(fmt) : "",
                    c.getNombreJours() != null ? c.getNombreJours() : 0,
                    c.getStatut().name()
            ));
        }
        stats.setRecentConges(recentConges);

        // Dernières absences
        List<DashboardStatistics.DashboardAbsence> recentAbsences = new ArrayList<>();
        for (Absence a : absenceRepository.findTop5ByOrderByDateDebutDesc()) {
            recentAbsences.add(new DashboardStatistics.DashboardAbsence(
                    a.getId(),
                    a.getAgent().getNom(),
                    a.getAgent().getPrenom(),
                    a.getDateDebut() != null ? a.getDateDebut().format(fmt) : "",
                    a.getDateFin() != null ? a.getDateFin().format(fmt) : "",
                    a.getMotif()
            ));
        }
        stats.setRecentAbsences(recentAbsences);

        // Dernières notifications
        List<DashboardStatistics.DashboardNotification> recentNotifications = new ArrayList<>();
        for (Notification n : notificationRepository.findTop5ByOrderByDateNotificationDesc()) {
            recentNotifications.add(new DashboardStatistics.DashboardNotification(
                    n.getId(),
                    n.getMessage(),
                    n.getLu(),
                    n.getDateNotification() != null ? n.getDateNotification().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "",
                    n.getAgent() != null ? n.getAgent().getEmail() : ""
            ));
        }
        stats.setRecentNotifications(recentNotifications);

        return stats;
    }
}
