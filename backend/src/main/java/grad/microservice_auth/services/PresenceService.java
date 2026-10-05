package grad.microservice_auth.services;

import grad.microservice_auth.Enum.StatutPresence;
import grad.microservice_auth.dto.PresenceRequest;
import grad.microservice_auth.dto.PresenceResponse;
import grad.microservice_auth.dto.PageResponse;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Presence;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.PresenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PresenceService {

    private final PresenceRepository presenceRepository;
    private final AgentRepository agentRepository;

    @Transactional
    public PresenceResponse create(PresenceRequest request) {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));

        Presence presence = new Presence();
        presence.setAgent(agent);
        presence.setDatePresence(request.getDatePresence());
        presence.setHeureArrivee(request.getHeureArrivee());
        presence.setHeureDepart(request.getHeureDepart());
        presence.setObservation(request.getObservation());

        StatutPresence statut;
        try {
            statut = StatutPresence.valueOf(request.getStatut());
        } catch (IllegalArgumentException | NullPointerException e) {
            statut = StatutPresence.PRESENT;
        }
        presence.setStatut(statut);

        presence = presenceRepository.save(presence);
        return mapToResponse(presence);
    }

    public List<PresenceResponse> getAll() {
        return presenceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PresenceResponse getById(Long id) {
        Presence presence = presenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Présence non trouvée"));
        return mapToResponse(presence);
    }

    @Transactional
    public PresenceResponse update(Long id, PresenceRequest request) {
        Presence presence = presenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Présence non trouvée"));
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));

        presence.setAgent(agent);
        presence.setDatePresence(request.getDatePresence());
        presence.setHeureArrivee(request.getHeureArrivee());
        presence.setHeureDepart(request.getHeureDepart());
        presence.setObservation(request.getObservation());

        StatutPresence statut;
        try {
            statut = StatutPresence.valueOf(request.getStatut());
        } catch (IllegalArgumentException | NullPointerException e) {
            statut = StatutPresence.PRESENT;
        }
        presence.setStatut(statut);

        presence = presenceRepository.save(presence);
        return mapToResponse(presence);
    }

    @Transactional
    public void delete(Long id) {
        presenceRepository.deleteById(id);
    }

    // ========== PAGINATION ==========
    public PageResponse<PresenceResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Presence> presencePage = presenceRepository.findAll(pageable);
        List<PresenceResponse> content = presencePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                presencePage.getNumber(),
                presencePage.getSize(),
                presencePage.getTotalElements(),
                presencePage.getTotalPages(),
                presencePage.isLast()
        );
    }

    // ========== RECHERCHE PAR NOM/PRÉNOM DE L'AGENT ==========
    public PageResponse<PresenceResponse> searchByAgentName(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Presence> presencePage = presenceRepository.findByAgentNomOrPrenomContainingIgnoreCase(keyword, pageable);
        List<PresenceResponse> content = presencePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                content,
                presencePage.getNumber(),
                presencePage.getSize(),
                presencePage.getTotalElements(),
                presencePage.getTotalPages(),
                presencePage.isLast()
        );
    }

    private PresenceResponse mapToResponse(Presence presence) {
        return new PresenceResponse(
                presence.getId(),
                presence.getAgent().getId(),
                presence.getAgent().getNom(),
                presence.getAgent().getPrenom(),
                presence.getDatePresence(),
                presence.getHeureArrivee(),
                presence.getHeureDepart(),
                presence.getStatut().name(),
                presence.getObservation()
        );
    }
}