package grad.microservice_auth.services;

import grad.microservice_auth.dto.NotificationRequest;
import grad.microservice_auth.dto.NotificationResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Notification;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AgentRepository agentRepository;  // ← Remplacer UserRepository par AgentRepository

    @Transactional
    public NotificationResponse create(NotificationRequest request) {
        // Récupérer l'agent via son ID
        Agent agent = request.getAgentId() != null
                ? agentRepository.findById(request.getAgentId()).orElse(null)
                : null;

        Notification notification = new Notification();
        notification.setAgent(agent);                 // ← setAgent au lieu de setUser
        notification.setMessage(request.getMessage());
        notification.setLu(false);
        notification.setDateNotification(LocalDateTime.now());
        notification = notificationRepository.save(notification);
        return mapToResponse(notification);
    }

    public List<NotificationResponse> getAll() {
        return notificationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<NotificationResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Notification> notificationPage = notificationRepository.findAll(pageable);
        List<NotificationResponse> content = notificationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                notificationPage.getNumber(),
                notificationPage.getSize(),
                notificationPage.getTotalElements(),
                notificationPage.getTotalPages(),
                notificationPage.isLast()
        );
    }

    public PageResponse<NotificationResponse> searchNotifications(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        // La méthode searchByKeyword doit être adaptée pour rechercher sur l'email de l'agent
        // On utilise findByMessageContainingOrAgentEmailContaining (à créer dans le repository)
        Page<Notification> notificationPage = notificationRepository.searchByKeyword(keyword, pageable);
        List<NotificationResponse> content = notificationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                notificationPage.getNumber(),
                notificationPage.getSize(),
                notificationPage.getTotalElements(),
                notificationPage.getTotalPages(),
                notificationPage.isLast()
        );
    }

    public NotificationResponse getById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        return mapToResponse(notification);
    }

    @Transactional
    public NotificationResponse update(Long id, NotificationRequest request) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));

        // Mettre à jour l'agent si demandé
        if (request.getAgentId() != null) {
            Agent agent = agentRepository.findById(request.getAgentId())
                    .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
            notification.setAgent(agent);
        }
        notification.setMessage(request.getMessage());
        notification.setLu(false); // ou conserver l'ancien statut, selon votre logique
        notification = notificationRepository.save(notification);
        return mapToResponse(notification);
    }

    @Transactional
    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        notification.setLu(true);
        notificationRepository.save(notification);
    }

    /**
     * Récupère les notifications d'un agent spécifique (pour la page "Mes notifications")
     */
    public List<NotificationResponse> getByAgent(Long agentId) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        return notificationRepository.findByAgent(agent).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private NotificationResponse mapToResponse(Notification notification) {
        String agentEmail = notification.getAgent() != null
                ? notification.getAgent().getEmail()
                : null;
        Long agentId = notification.getAgent() != null
                ? notification.getAgent().getId()
                : null;

        return new NotificationResponse(
                notification.getId(),
                agentId,
                agentEmail,
                notification.getMessage(),
                notification.getLu(),
                notification.getDateNotification()
        );
    }
}